"""Actionable nudges for the web UI — reminders, follow-ups, approvals, vault-derived prompts."""
from __future__ import annotations

import re
from datetime import datetime

from agent import store
from memory.sql_store import get_contacts_needing_followup, get_conn


def _iso_now() -> str:
    return datetime.now().isoformat()


def _overdue(due_at: str | None) -> bool:
    if not due_at:
        return False
    try:
        return datetime.fromisoformat(due_at.replace("Z", "+00:00")[:26]) <= datetime.now()
    except Exception:
        return False


def _vault_lead_nudges(world_id: str | None = None) -> list[dict]:
    """If synced vault docs mention leads/prospects, nudge when CRM has untouched prospects."""
    from memory import vault_documents

    try:
        conn = get_conn()
        if world_id:
            prospects = conn.execute(
                "SELECT id, name, company, status FROM contacts WHERE status = 'prospect' LIMIT 20"
            ).fetchall()
            docs = vault_documents.list_documents(world_id)
        else:
            prospects = conn.execute(
                "SELECT id, name, company, status FROM contacts WHERE status = 'prospect' LIMIT 20"
            ).fetchall()
            docs = []
            for wid_row in conn.execute("SELECT DISTINCT world_id FROM vault_documents").fetchall():
                docs.extend(vault_documents.list_documents(wid_row["world_id"]))
        conn.close()
    except Exception:
        return []

    if not prospects:
        return []

    lead_pattern = re.compile(r"\b(leads?|prospects?|outreach|pipeline|icp)\b", re.I)
    lead_docs = [
        d for d in docs
        if d.get("source_type") == "github"
        and lead_pattern.search(d.get("description") or "")
        or lead_pattern.search(d.get("title") or "")
        or lead_pattern.search(d.get("github_path") or "")
    ]
    if not lead_docs:
        return []

    doc = lead_docs[0]
    repo = doc.get("github_repo") or "vault"
    path = doc.get("github_path") or doc.get("title") or "document"
    count = len(prospects)
    names = ", ".join(f"{p['name']}" + (f" @ {p['company']}" if p.get("company") else "") for p in prospects[:3])
    extra = f" (+{count - 3} more)" if count > 3 else ""
    return [{
        "id": f"vault-leads-{doc.get('id')}",
        "kind": "vault_leads",
        "title": f"{count} prospect{'s' if count != 1 else ''} not contacted",
        "body": f"Your synced doc {repo}/{path} references leads. Have you reached out to {names}{extra}?",
        "action": "crm",
        "priority": 2,
        "meta": {
            "world_id": doc.get("world_id"),
            "doc_id": doc.get("id"),
            "prospect_count": count,
        },
    }]


def collect_nudges(world_id: str | None = None) -> list[dict]:
    nudges: list[dict] = []

    for r in store.get_pending_reminders():
        overdue = _overdue(r.get("due_at"))
        nudges.append({
            "id": f"reminder-{r['id']}",
            "kind": "reminder",
            "title": r.get("text") or "Reminder",
            "body": f"Due {r.get('due_at', '')[:16].replace('T', ' ')}",
            "action": "goals",
            "priority": 1 if overdue else 3,
            "meta": {"reminder_id": r["id"], "overdue": overdue},
        })

    try:
        for c in get_contacts_needing_followup():
            nudges.append({
                "id": f"followup-{c['id']}",
                "kind": "followup",
                "title": f"Follow up with {c.get('name', 'contact')}",
                "body": f"{c.get('company') or 'No company'} · status {c.get('status', '?')}",
                "action": "crm",
                "priority": 2,
                "meta": {"contact_id": c["id"]},
            })
    except Exception:
        pass

    for a in store.list_pending_approvals():
        nudges.append({
            "id": f"approval-{a['id']}",
            "kind": "approval",
            "title": f"Approval needed: {a.get('tool_name', 'tool')}",
            "body": (a.get("summary") or "")[:160],
            "action": "approvals",
            "priority": 1,
            "meta": {"approval_id": a["id"]},
        })

    for g in store.list_goals("active")[:5]:
        nudges.append({
            "id": f"goal-{g['id']}",
            "kind": "goal",
            "title": g.get("title") or "Active goal",
            "body": (g.get("detail") or "Track progress on this goal")[:120],
            "action": "goals",
            "priority": 4,
            "meta": {"goal_id": g["id"]},
        })

    nudges.extend(_vault_lead_nudges(world_id))

    nudges.sort(key=lambda n: (n.get("priority") or 9, n.get("title") or ""))
    return nudges[:24]
