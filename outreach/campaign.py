"""Batch outreach campaigns — research (vault tree + web), strategy, drafts, approve-send."""
from __future__ import annotations

import asyncio
import json
import logging
import os
import threading
import time
from datetime import datetime, timedelta
from typing import Callable, Optional

from config import config
from llm.router import complete
from memory import knowledge_vault, worlds
from memory.sql_store import (
    create_outreach_draft,
    get_campaign,
    get_campaign_companies,
    get_company,
    get_company_contacts,
    get_contact,
    get_draft,
    list_campaign_drafts,
    log_outreach,
    update_campaign,
    update_campaign_company,
    update_company,
    update_contact,
    update_draft,
)
from memory.world_templates import template_for_kind
from outreach.dossier import (
    build_dossier_markdown,
    ingest_dossier_to_vault,
    read_dossier,
    write_dossier,
)
from outreach.email_sender import send_email
from tools.web_search import search as web_search

logger = logging.getLogger(__name__)

BATCH_SIZES = {5, 10, 15, 20}
MAX_VAULT_READS_PER_COMPANY = 3
MAX_WEB_SEARCHES_PER_COMPANY = 2
EMAIL_SEND_COOLDOWN_S = int(os.getenv("OUTREACH_EMAIL_COOLDOWN_S", "30"))
WA_SEND_COOLDOWN_S = int(os.getenv("OUTREACH_WA_COOLDOWN_S", "60"))

_last_send_at: dict[str, float] = {}
_send_lock = threading.Lock()
_campaign_jobs: dict[str, dict] = {}


def _sync_await(coro):
    """Run async coroutine from sync code (safe inside or outside an event loop)."""
    try:
        asyncio.get_running_loop()
        in_loop = True
    except RuntimeError:
        in_loop = False
    if not in_loop:
        return asyncio.run(coro)
    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
        return ex.submit(asyncio.run, coro).result()


def create_campaign(world_id: str, company_ids: list, batch_size: int, brief: str = "",
                    name: str = None) -> dict:
    from memory.sql_store import create_campaign as _create

    world_id = worlds.resolve_world_id(world_id)
    if world_id == worlds.ROOT_ID:
        return {"error": "Select a sub-world (not main) for outreach campaigns."}
    w = worlds.get(world_id)
    if not w:
        return {"error": f"Unknown world: {world_id}"}

    try:
        batch_size = int(batch_size)
    except (TypeError, ValueError):
        batch_size = 5
    if batch_size not in BATCH_SIZES:
        return {"error": f"batch_size must be one of {sorted(BATCH_SIZES)}"}

    ids = []
    for cid in company_ids or []:
        try:
            ids.append(int(cid))
        except (TypeError, ValueError):
            continue
    if not ids:
        return {"error": "At least one company is required"}
    if len(ids) > batch_size:
        return {"error": f"Select at most {batch_size} companies"}

    for cid in ids:
        co = get_company(cid)
        if not co:
            return {"error": f"Company {cid} not found"}
        if co.get("world_id") and co.get("world_id") != world_id:
            return {"error": f"Company {co.get('name')} belongs to another world"}

    label = name or f"Outreach {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    campaign_id = _create(world_id, label, ids, batch_size, brief)
    return {"campaign_id": campaign_id, "status": "created"}


def _world_vault_ctx(world_id: str):
    w = worlds.get(world_id)
    if not w:
        return None, None, None
    slug = w.get("slug") or world_id
    tpl = w.get("template") or template_for_kind(w.get("kind", "project"))
    return w, slug, tpl


def _research_company(world_id: str, company: dict, brief: str, on_phase: Callable | None = None) -> dict:
    w, slug, tpl = _world_vault_ctx(world_id)
    name = company.get("name") or company.get("company_name") or "Company"
    sector = company.get("sector") or company.get("industry") or ""

    if on_phase:
        on_phase(f"Researching {name}…")

    outline = knowledge_vault.vault_outline(world_id, slug, tpl, world=w) if w else {"facets": []}
    files_used = []
    vault_snippets = []
    reads = 0

    needles = {name.lower(), sector.lower()} - {""}
    for facet in outline.get("facets") or []:
        for f in facet.get("files") or []:
            title_l = (f.get("title") or "").lower()
            summary_l = (f.get("summary") or "").lower()
            if not any(n in title_l or n in summary_l for n in needles) and reads > 0:
                continue
            doc_id = f.get("doc_id")
            if doc_id and reads < MAX_VAULT_READS_PER_COMPANY:
                full = knowledge_vault.read_vault_file(int(doc_id), world_id=world_id, max_chars=8000)
                if full.get("content"):
                    vault_snippets.append({
                        "doc_id": doc_id,
                        "title": full.get("title"),
                        "excerpt": full["content"][:2500],
                    })
                    files_used.append({"doc_id": doc_id, "title": full.get("title")})
                    reads += 1
            elif f.get("summary"):
                vault_snippets.append({
                    "doc_id": doc_id,
                    "title": f.get("title"),
                    "excerpt": f.get("summary"),
                })

    web_hits = []
    queries = [f"{name} {sector} India".strip(), f"{name} news"]
    for q in queries[:MAX_WEB_SEARCHES_PER_COMPANY]:
        try:
            for hit in (web_search(q, num_results=3) or [])[:3]:
                web_hits.append({
                    "query": q,
                    "title": hit.get("title") or "",
                    "snippet": (hit.get("snippet") or hit.get("body") or "")[:400],
                    "url": hit.get("url") or hit.get("link") or "",
                })
        except Exception as e:
            logger.warning("web_search failed for %s: %s", q, e)

    research = {
        "company_id": company.get("company_id") or company.get("id"),
        "company_name": name,
        "sector": sector,
        "vault_outline_facets": len(outline.get("facets") or []),
        "vault_files_used": files_used,
        "vault_snippets": vault_snippets[:6],
        "web_hits": web_hits[:6],
        "crm_research_summary": company.get("research_summary") or "",
        "brief": brief,
        "narrative": "",
        "summary": "",
    }
    return research


async def _synthesize_company_research(research: dict) -> dict:
    """Turn raw vault/web signals into a company-specific research narrative."""
    payload = json.dumps({
        "company": research.get("company_name"),
        "sector": research.get("sector"),
        "brief": research.get("brief"),
        "vault_snippets": (research.get("vault_snippets") or [])[:4],
        "web_hits": (research.get("web_hits") or [])[:4],
        "crm_notes": (research.get("crm_research_summary") or "")[:800],
    }, indent=2)[:8000]

    messages = [
        {"role": "system", "content": (
            f"You are a B2B research analyst for {config.company_name}. "
            "Write specific, factual company research for cold outreach. "
            "Do not invent facts not supported by the sources. "
            "If data is thin, say what is known and what to verify."
        )},
        {"role": "user", "content": f"""Sources for one company:
{payload}

Respond JSON only:
{{
  "narrative": "2-4 paragraphs: who they are, why they might care, hooks for outreach",
  "summary": "3 bullet points of personalization hooks",
  "risk_flags": ["optional gaps or things to verify"]
}}"""},
    ]
    raw = await complete(messages, task_type="analysis")
    clean = raw.strip().replace("```json", "").replace("```", "").strip()
    try:
        parsed = json.loads(clean)
        research["narrative"] = (parsed.get("narrative") or "")[:4000]
        research["summary"] = (parsed.get("summary") or "")[:1500]
        if isinstance(parsed.get("risk_flags"), list):
            research["risk_flags"] = parsed["risk_flags"][:5]
    except Exception:
        bits = []
        for s in (research.get("vault_snippets") or [])[:2]:
            bits.append(s.get("excerpt", "")[:300])
        for w in (research.get("web_hits") or [])[:2]:
            bits.append(w.get("snippet", "")[:300])
        research["narrative"] = "\n\n".join(bits)[:4000] or f"Limited public data for {research.get('company_name')}."
        research["summary"] = research["narrative"][:500]
    return research


def _write_campaign_dossier(campaign_id: int) -> str:
    camp = get_campaign(campaign_id)
    if not camp:
        return ""
    rows = get_campaign_companies(campaign_id)
    enriched = []
    for row in rows:
        r = dict(row)
        try:
            rj = json.loads(row.get("research_json") or "{}")
            r["_narrative"] = rj.get("narrative") or ""
        except Exception:
            r["_narrative"] = ""
        enriched.append(r)
    md = build_dossier_markdown(camp, enriched, camp.get("brief") or "")
    rel = write_dossier(camp["world_id"], campaign_id, md)
    doc_id = ingest_dossier_to_vault(
        camp["world_id"],
        campaign_id,
        md,
        f"Outreach — {camp.get('name') or campaign_id}",
    )
    update_campaign(campaign_id, dossier_path=rel, **({"dossier_doc_id": doc_id} if doc_id else {}))
    return md


async def run_strategy_phase(campaign_id: int) -> dict:
    camp = get_campaign(campaign_id)
    if not camp:
        return {"error": "campaign not found"}
    rows = get_campaign_companies(campaign_id)
    researches = []
    for row in rows:
        try:
            researches.append(json.loads(row.get("research_json") or "{}"))
        except Exception:
            researches.append({"company_name": row.get("company_name")})

    payload = json.dumps({
        "brief": camp.get("brief") or "",
        "companies": [
            {
                "name": r.get("company_name"),
                "sector": r.get("sector"),
                "signals": (r.get("web_hits") or [])[:2],
                "vault": (r.get("vault_snippets") or [])[:2],
            }
            for r in researches
        ],
    }, indent=2)[:12000]

    messages = [
        {"role": "system", "content": (
            f"You are a B2B outreach strategist for {config.company_name}. "
            "Given a homogeneous cohort, output ONE shared approach JSON."
        )},
        {"role": "user", "content": f"""Cohort research:
{payload}

Respond JSON only:
{{
  "cohort_label": "",
  "awareness_stage": "",
  "lead_type": "",
  "framing_rules": [],
  "email_tone": "",
  "whatsapp_tone": "",
  "differentiation": ""
}}"""},
    ]
    raw = await complete(messages, task_type="analysis")
    clean = raw.strip().replace("```json", "").replace("```", "").strip()
    try:
        strategy = json.loads(clean)
    except Exception:
        strategy = {"cohort_label": "SMB outreach", "framing_rules": [clean[:500]]}

    update_campaign(campaign_id, status="drafting", strategy_json=json.dumps(strategy))
    return strategy


async def run_template_phase(campaign_id: int) -> dict:
    """One unified batch email + WhatsApp template from cohort research."""
    camp = get_campaign(campaign_id)
    if not camp:
        return {"error": "campaign not found"}
    try:
        strategy = json.loads(camp.get("strategy_json") or "{}")
    except Exception:
        strategy = {}

    dossier = read_dossier(camp["world_id"], campaign_id) or ""
    if not dossier:
        _write_campaign_dossier(campaign_id)
        dossier = read_dossier(camp["world_id"], campaign_id) or ""

    messages = [
        {"role": "system", "content": (
            f"You write batch outreach templates for {config.my_name} at {config.company_name}. "
            f"{config.my_one_liner}\n"
            "Create ONE master email template for the cohort — specific enough to feel researched, "
            "generic enough to personalize per company later."
        )},
        {"role": "user", "content": f"""Strategy:
{json.dumps(strategy, indent=2)[:3000]}

Brief: {camp.get('brief') or ''}

Campaign dossier (all companies researched):
{dossier[:10000]}

JSON only:
{{
  "email_subject": "",
  "email_body": "",
  "whatsapp_body": "",
  "personalization_slots": ["placeholders to swap per company, e.g. {{company_hook}}"]
}}"""},
    ]
    raw = await complete(messages, task_type="outreach")
    clean = raw.strip().replace("```json", "").replace("```", "").strip()
    try:
        template = json.loads(clean)
    except Exception:
        template = {"email_subject": "Quick question", "email_body": clean[:1200], "whatsapp_body": clean[:280]}

    update_campaign(campaign_id, template_json=json.dumps(template))
    return template


async def run_draft_phase(campaign_id: int, on_phase: Callable | None = None) -> dict:
    from specialists import outreach_agent

    camp = get_campaign(campaign_id)
    if not camp:
        return {"error": "campaign not found"}
    try:
        strategy = json.loads(camp.get("strategy_json") or "{}")
    except Exception:
        strategy = {}
    try:
        template = json.loads(camp.get("template_json") or "{}")
    except Exception:
        template = {}

    drafted = 0
    for row in get_campaign_companies(campaign_id):
        if row.get("status") == "skipped":
            continue
        cid = row["company_id"]
        name = row.get("company_name") or "Company"
        if on_phase:
            on_phase(f"Drafting for {name}…")

        company_research = {}
        try:
            company_research = json.loads(row.get("research_json") or "{}")
        except Exception:
            pass

        contacts = get_company_contacts(cid)
        if not contacts:
            contacts = [c for c in get_company_contacts(cid)]

        for contact in contacts:
            if contact.get("email"):
                draft = await outreach_agent.draft_email_for_campaign(
                    contact_id=contact["id"],
                    strategy=strategy,
                    brief=camp.get("brief") or "",
                    company_research=company_research,
                    template=template,
                )
                create_outreach_draft(
                    campaign_id,
                    cid,
                    contact["id"],
                    "email",
                    subject=draft.get("subject") or "",
                    body=draft.get("body") or "",
                    personalization_notes=draft.get("personalization_notes") or "",
                )
                drafted += 1
            if contact.get("whatsapp_enabled") and contact.get("phone"):
                wa = await outreach_agent.draft_whatsapp_for_campaign(
                    contact_id=contact["id"],
                    strategy=strategy,
                    brief=camp.get("brief") or "",
                    company_research=company_research,
                    template=template,
                )
                create_outreach_draft(
                    campaign_id,
                    cid,
                    contact["id"],
                    "whatsapp",
                    body=wa.get("body") or "",
                    personalization_notes=wa.get("personalization_notes") or "",
                )
                drafted += 1

        update_campaign_company(row["id"], status="drafted")

    update_campaign(campaign_id, status="review")
    return {"drafts": drafted, "status": "review"}


def run_research_phase(campaign_id: int, on_phase: Callable | None = None) -> dict:
    camp = get_campaign(campaign_id)
    if not camp:
        return {"error": "campaign not found"}
    world_id = camp["world_id"]
    brief = camp.get("brief") or ""
    update_campaign(campaign_id, status="researching")

    total = len(get_campaign_companies(campaign_id))
    for i, row in enumerate(get_campaign_companies(campaign_id), start=1):
        if on_phase:
            on_phase(f"Researching {row.get('company_name')} ({i}/{total})…")
        research = _research_company(world_id, row, brief, on_phase=on_phase)
        research = _sync_await(_synthesize_company_research(research))
        update_campaign_company(row["id"], status="researched", research_json=json.dumps(research))
        if research.get("narrative") or research.get("vault_snippets") or research.get("web_hits"):
            summary_bits = [research.get("summary") or research.get("narrative", "")[:500]]
            update_company(row["company_id"], research_summary=summary_bits[0][:2000])

    if on_phase:
        on_phase("Writing campaign dossier…")
    _write_campaign_dossier(campaign_id)
    return {"status": "researched", "companies": total}


async def run_campaign_pipeline(campaign_id: int, on_phase: Callable | None = None) -> dict:
    run_research_phase(campaign_id, on_phase=on_phase)
    if on_phase:
        on_phase("Building cohort strategy…")
    await run_strategy_phase(campaign_id)
    if on_phase:
        on_phase("Creating batch message template…")
    await run_template_phase(campaign_id)
    return await run_draft_phase(campaign_id, on_phase=on_phase)


def get_review_queue(campaign_id: int) -> dict:
    camp = get_campaign(campaign_id)
    if not camp:
        return {"error": "campaign not found"}
    companies = get_campaign_companies(campaign_id)
    drafts = list_campaign_drafts(campaign_id)
    pending_drafts = [d for d in drafts if d.get("status") in ("draft", "approved")]
    current_company_id = None
    for co in companies:
        co_drafts = [d for d in drafts if d["company_id"] == co["company_id"]]
        if any(d.get("status") in ("draft", "approved") for d in co_drafts):
            current_company_id = co["company_id"]
            break

    try:
        strategy = json.loads(camp.get("strategy_json") or "{}")
    except Exception:
        strategy = {}
    try:
        template = json.loads(camp.get("template_json") or "{}")
    except Exception:
        template = {}

    dossier_md = read_dossier(camp["world_id"], campaign_id) or ""

    current_co = next((c for c in companies if c["company_id"] == current_company_id), None)
    research = {}
    if current_co:
        try:
            research = json.loads(current_co.get("research_json") or "{}")
        except Exception:
            pass

    by_status: dict[str, int] = {}
    for d in drafts:
        s = d.get("status") or "draft"
        by_status[s] = by_status.get(s, 0) + 1

    company_ids = [c["company_id"] for c in companies]
    company_index = (company_ids.index(current_company_id) + 1) if current_company_id in company_ids else len(company_ids)
    companies_complete = sum(
        1 for cid in company_ids
        if not any(d.get("status") in ("draft", "approved") for d in drafts if d["company_id"] == cid)
    )

    return {
        "campaign": camp,
        "strategy": strategy,
        "template": template,
        "dossier_md": dossier_md,
        "companies": companies,
        "drafts": drafts,
        "current_company_id": current_company_id,
        "current_company": current_co,
        "current_research": research,
        "current_drafts": [d for d in drafts if d.get("company_id") == current_company_id] if current_company_id else [],
        "pending_count": len(pending_drafts),
        "done": len(pending_drafts) == 0 and camp.get("status") in ("review", "done"),
        "progress": {
            "companies_total": len(companies),
            "companies_complete": companies_complete,
            "company_index": company_index,
            "drafts_total": len(drafts),
            "by_status": by_status,
        },
    }


def _rate_limit_gate(channel: str) -> Optional[str]:
    cooldown = WA_SEND_COOLDOWN_S if channel == "whatsapp" else EMAIL_SEND_COOLDOWN_S
    with _send_lock:
        last = _last_send_at.get(channel, 0)
        wait = cooldown - (time.time() - last)
        if wait > 0:
            return f"Rate limit: wait {int(wait)}s before next {channel} send"
    return None


def _preflight_draft(draft: dict, contact: dict) -> Optional[str]:
    channel = draft.get("channel")
    if channel == "email":
        if not config.gmail_address or not config.gmail_app_password:
            return "Gmail not configured"
        if not contact.get("email"):
            return "Contact has no email"
        if not (draft.get("subject") or "").strip():
            return "Email subject required"
        if not (draft.get("body") or "").strip():
            return "Email body required"
    elif channel == "whatsapp":
        if not contact.get("whatsapp_enabled"):
            return "WhatsApp not enabled for contact"
        if not contact.get("phone"):
            return "Contact has no phone"
        if not (draft.get("body") or "").strip():
            return "WhatsApp message required"
        if len((draft.get("body") or "")) > 300:
            return "WhatsApp message exceeds 300 characters"
    else:
        return f"Unknown channel: {channel}"
    return None


def approve_and_send(draft_id: int) -> dict:
    draft = get_draft(draft_id)
    if not draft:
        return {"error": "draft not found"}
    if draft.get("status") not in ("draft", "approved"):
        return {"error": f"Draft already {draft.get('status')}"}

    contact = get_contact(draft["contact_id"]) if draft.get("contact_id") else None
    if not contact:
        return {"error": "contact not found"}

    err = _preflight_draft(draft, contact)
    if err:
        update_draft(draft_id, status="failed", error_message=err)
        return {"error": err}

    rl = _rate_limit_gate(draft.get("channel") or "email")
    if rl:
        return {"error": rl}

    campaign_id = draft.get("campaign_id")
    channel = draft.get("channel")

    if channel == "email":
        result = send_email(contact["email"], draft["subject"], draft["body"])
        if not result.get("success"):
            update_draft(draft_id, status="failed", error_message=result.get("error") or "send failed")
            return result
    elif channel == "whatsapp":
        from integrations import whatsapp as wa
        phone = contact.get("phone") or ""
        token = wa.mint_send_token(phone, draft["body"])
        if not token:
            update_draft(draft_id, status="failed", error_message="WhatsApp token error")
            return {"error": "WhatsApp send not allowed"}
        result = wa.send_message(phone, draft["body"], approval_token=token)
        if not result.get("success") and not result.get("ok"):
            update_draft(draft_id, status="failed", error_message=result.get("error") or "send failed")
            return result
    else:
        return {"error": "unsupported channel"}

    with _send_lock:
        _last_send_at[channel] = time.time()

    log_id = log_outreach(
        contact["id"],
        channel=channel,
        direction="outbound",
        subject=draft.get("subject"),
        body=draft.get("body"),
        status="sent",
        campaign_id=campaign_id,
    )
    update_draft(draft_id, status="sent", outreach_log_id=log_id)
    update_contact(
        contact["id"],
        status="contacted",
        last_contacted_at=datetime.now().isoformat(),
        next_followup_at=(datetime.now() + timedelta(days=3)).isoformat(),
    )
    if draft.get("company_id"):
        update_company(draft["company_id"], status="contacted", last_contacted_at=datetime.now().isoformat())

    queue = get_review_queue(campaign_id)
    if queue.get("done"):
        update_campaign(campaign_id, status="done")

    return {"ok": True, "draft_id": draft_id, "log_id": log_id, "channel": channel}


def skip_draft(draft_id: int) -> dict:
    draft = get_draft(draft_id)
    if not draft:
        return {"error": "draft not found"}
    update_draft(draft_id, status="skipped")
    campaign_id = draft.get("campaign_id")
    queue = get_review_queue(campaign_id)
    if queue.get("done"):
        update_campaign(campaign_id, status="done")
    return {"ok": True, "draft_id": draft_id}


def skip_company(campaign_id: int, company_id: int) -> dict:
    """Skip all pending drafts for a company and advance the review queue."""
    camp = get_campaign(campaign_id)
    if not camp:
        return {"error": "campaign not found"}
    rows = [c for c in get_campaign_companies(campaign_id) if c["company_id"] == int(company_id)]
    if not rows:
        return {"error": "company not in campaign"}
    cc_id = rows[0]["id"]
    skipped = 0
    for d in list_campaign_drafts(campaign_id, company_id):
        if d.get("status") in ("draft", "approved"):
            update_draft(d["id"], status="skipped")
            skipped += 1
    update_campaign_company(cc_id, status="skipped")
    queue = get_review_queue(campaign_id)
    if queue.get("done"):
        update_campaign(campaign_id, status="done")
    return {"ok": True, "company_id": company_id, "skipped_drafts": skipped}


def start_campaign_job(campaign_id: int) -> dict:
    job_id = f"camp-{campaign_id}-{int(time.time())}"
    job = {"id": job_id, "campaign_id": campaign_id, "status": "running", "phase": "Starting…"}

    def _run():
        try:
            def on_phase(msg: str):
                job["phase"] = msg
                try:
                    from dashboard import live_ops
                    live_ops.set_phase(msg)
                except Exception:
                    pass

            asyncio.run(run_campaign_pipeline(campaign_id, on_phase=on_phase))
            job["status"] = "completed"
            job["phase"] = "Ready for review"
        except Exception as e:
            logger.exception("campaign job %s failed", campaign_id)
            job["status"] = "failed"
            job["phase"] = str(e)[:200]
            update_campaign(campaign_id, status="failed")

    _campaign_jobs[job_id] = job
    threading.Thread(target=_run, daemon=True).start()
    return job


def get_campaign_job(job_id: str) -> dict | None:
    return _campaign_jobs.get(job_id)


def get_running_job_for_campaign(campaign_id: int) -> dict | None:
    for job in _campaign_jobs.values():
        if job.get("campaign_id") == campaign_id and job.get("status") == "running":
            return job
    return None


def get_campaign_dossier(campaign_id: int) -> dict:
    camp = get_campaign(campaign_id)
    if not camp:
        return {"error": "campaign not found"}
    md = read_dossier(camp["world_id"], campaign_id) or ""
    return {"campaign_id": campaign_id, "dossier_md": md, "dossier_path": camp.get("dossier_path") or ""}


def save_campaign_dossier(campaign_id: int, content: str) -> dict:
    camp = get_campaign(campaign_id)
    if not camp:
        return {"error": "campaign not found"}
    rel = write_dossier(camp["world_id"], campaign_id, content or "")
    update_campaign(campaign_id, dossier_path=rel)
    return {"ok": True, "dossier_path": rel}


async def refresh_company_research(campaign_id: int, company_id: int, *, web_search_enabled: bool = False) -> dict:
    camp = get_campaign(campaign_id)
    if not camp:
        return {"error": "campaign not found"}
    rows = [c for c in get_campaign_companies(campaign_id) if c["company_id"] == int(company_id)]
    if not rows:
        return {"error": "company not in campaign"}
    row = rows[0]
    research = _research_company(camp["world_id"], row, camp.get("brief") or "")

    if web_search_enabled:
        name = row.get("company_name") or "Company"
        sector = row.get("sector") or ""
        extra_hits = []
        for q in [f"{name} {sector} India".strip(), f"{name} latest news", f"{name} manufacturing"]:
            try:
                for hit in (web_search(q, num_results=3) or [])[:3]:
                    extra_hits.append({
                        "query": q,
                        "title": hit.get("title") or "",
                        "snippet": (hit.get("snippet") or hit.get("body") or "")[:400],
                        "url": hit.get("url") or hit.get("link") or "",
                    })
            except Exception as e:
                logger.warning("refresh web_search failed: %s", e)
        existing = {h.get("url") for h in research.get("web_hits") or []}
        for h in extra_hits:
            if h.get("url") and h["url"] not in existing:
                research.setdefault("web_hits", []).append(h)

    research = await _synthesize_company_research(research)
    update_campaign_company(row["id"], research_json=json.dumps(research))
    _write_campaign_dossier(campaign_id)
    return {"ok": True, "research": research}


async def ai_edit_draft(draft_id: int, instruction: str, *, web_search_enabled: bool = False) -> dict:
    from specialists import outreach_agent

    draft = get_draft(draft_id)
    if not draft:
        return {"error": "draft not found"}
    if draft.get("status") not in ("draft", "approved"):
        return {"error": f"Draft is {draft.get('status')}"}

    camp = get_campaign(draft["campaign_id"])
    company_research = {}
    rows = [c for c in get_campaign_companies(draft["campaign_id"]) if c["company_id"] == draft.get("company_id")]
    if rows:
        if web_search_enabled:
            await refresh_company_research(draft["campaign_id"], draft["company_id"], web_search_enabled=True)
            rows = [c for c in get_campaign_companies(draft["campaign_id"]) if c["company_id"] == draft.get("company_id")]
        try:
            company_research = json.loads(rows[0].get("research_json") or "{}")
        except Exception:
            pass

    dossier = read_dossier(camp["world_id"], draft["campaign_id"]) if camp else ""
    edited = await outreach_agent.ai_edit_draft(
        draft=draft,
        instruction=instruction,
        company_research=company_research,
        dossier=dossier,
        brief=camp.get("brief") if camp else "",
    )
    if edited.get("error"):
        return edited
    payload = {}
    if draft.get("channel") == "email" and edited.get("subject") is not None:
        payload["subject"] = edited["subject"]
    if edited.get("body") is not None:
        payload["body"] = edited["body"]
    if edited.get("personalization_notes"):
        payload["personalization_notes"] = edited["personalization_notes"]
    if payload:
        update_draft(draft_id, **payload)
    return {"ok": True, "draft": get_draft(draft_id)}
