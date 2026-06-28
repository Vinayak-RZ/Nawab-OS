"""JSON API for the Founder OS web UI."""
import asyncio
import json
import logging
import os

from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)
bp = Blueprint("api", __name__, url_prefix="/api")


def _safe(fn, default=None):
    try:
        return fn()
    except Exception as e:
        logger.debug(f"[api] {fn.__name__ if hasattr(fn, '__name__') else fn} failed: {e}")
        return default


def _run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def collect_state() -> dict:
    from agent import about, budget, finance, store
    from memory import world_model
    from memory import worlds as hierarchical_worlds
    import agent.trace as trace
    from dashboard import notifications

    return {
        "about": _safe(about.describe, {}),
        "worlds": _safe(hierarchical_worlds.get_tree, {}),
        "snapshot": _safe(lambda: world_model.build_snapshot(persist=False), {}),
        "usage": _safe(budget.status, {}),
        "finance": _safe(finance.summary, {}),
        "approvals": _safe(store.list_pending_approvals, []),
        "goals": _safe(lambda: store.list_goals("active"), []),
        "reminders": _safe(store.get_pending_reminders, []),
        "tasks": _safe(lambda: __import__("memory.sql_store", fromlist=["get_pending_tasks"]).get_pending_tasks(), []),
        "traces": _safe(lambda: trace.recent(15), []),
        "actions": _safe(lambda: store.recent_actions(20), []),
        "usage_history": _safe(lambda: store.usage_history(7), []),
        "notifications": _safe(notifications.list_items, []),
        "unread_notifications": _safe(notifications.unread_count, 0),
        "config": _safe(_public_config, {}),
    }


def _public_config():
    from config import config
    return {
        "my_name": config.my_name,
        "company_name": config.company_name,
        "autonomy_level": config.autonomy_level,
        "agent_paused": config.agent_paused,
        "auto_approve": config.auto_approve,
        "telegram_enabled": config.telegram_enabled,
        "web_ui_enabled": config.web_ui_enabled,
        "dashboard_port": config.dashboard_port,
        "integrations": {
            "gmail": bool(config.gmail_address and config.gmail_app_password),
            "calendar": os.path.isfile(config.google_token_path),
            "qdrant": bool(config.qdrant_url),
            "x": bool(config.x_bearer_token or config.x_api_key),
            "serper": bool(config.serper_api_key),
            "tavily": bool(config.tavily_api_key),
            "github": _safe(lambda: __import__("integrations.github_client", fromlist=["is_connected"]).is_connected(), False),
            "github_oauth": bool(config.github_client_id and config.github_client_secret),
            "whatsapp": _safe(lambda: __import__("integrations.whatsapp", fromlist=["is_configured"]).is_configured(), False),
        },
        "whatsapp_enabled": config.whatsapp_enabled,
    }


@bp.route("/health")
def api_health():
    """Load balancer / uptime check — no auth (safe: no secrets in response)."""
    from integrations import object_storage
    return jsonify({
        "ok": True,
        "storage": "s3" if object_storage.s3_enabled() else "local",
    })


@bp.route("/infrastructure/health")
def api_infrastructure_health():
    """EC2 + S3 + disk health for Settings monitor (auth required when PIN enabled)."""
    from integrations import infrastructure_health

    probe = request.args.get("probe", "1").strip().lower() not in ("0", "false", "no")
    return jsonify(infrastructure_health.collect(probe_s3_write=probe))


@bp.route("/state")
def api_state():
    return jsonify(collect_state())


def collect_summary() -> dict:
    """Lightweight payload for background UI refresh (badges, status bar)."""
    from agent import store, budget
    from memory import worlds as hierarchical_worlds
    from memory.sql_store import get_contacts_needing_followup, get_pending_tasks
    from dashboard import notifications

    approvals = _safe(store.list_pending_approvals, [])
    reminders = _safe(store.get_pending_reminders, [])
    return {
        "usage": _safe(budget.status, {}),
        "approvals_pending": len(approvals) if isinstance(approvals, list) else 0,
        "reminders_pending": len(reminders) if isinstance(reminders, list) else 0,
        "tasks_open": _safe(lambda: len(get_pending_tasks()), 0),
        "crm_followups_due": _safe(lambda: len(get_contacts_needing_followup()), 0),
        "unread_notifications": _safe(notifications.unread_count, 0),
        "worlds": _safe(hierarchical_worlds.get_tree, {}),
        "config": _safe(_public_config, {}),
    }


@bp.route("/summary")
def api_summary():
    from dashboard import cache
    return jsonify(cache.get("api:summary", 10.0, collect_summary))


@bp.route("/chat", methods=["POST"])
def api_chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "message is required"}), 400

    from agent import core, store
    from memory import agent_history

    before = {a["id"] for a in store.list_pending_approvals()}

    from dashboard import live_ops

    async def _on_status(text: str):
        live_ops.set_phase(text)

    world_id = (data.get("world_id") or "").strip() or None
    rag_mode = (data.get("rag_mode") or "auto").strip().lower() or "auto"
    session_id = (data.get("session_id") or "").strip() or None
    specialist = (data.get("specialist") or "supervisor").strip() or "supervisor"
    title = message[:80] + ("…" if len(message) > 80 else "")

    session_id = agent_history.begin_turn(
        session_id=session_id,
        world_id=world_id,
        specialist=specialist,
        title=title,
    )
    agent_history.add_message(session_id, "user", message)

    async def _go():
        live_ops.begin("user", message)
        try:
            return await core.run(
                message, actor="user", on_status=_on_status,
                world_id=world_id, rag_mode=rag_mode,
            )
        finally:
            live_ops.end()

    try:
        reply = _run_async(_go())
    except Exception as e:
        agent_history.end_turn()
        logger.exception("chat failed")
        return jsonify({"error": str(e)[:500]}), 500

    run_id = agent_history.current_run_id()
    agent_history.add_message(session_id, "assistant", reply, run_id=run_id)
    agent_history.end_turn()

    new_approvals = [a for a in store.list_pending_approvals() if a["id"] not in before]
    return jsonify({
        "reply": reply,
        "session_id": session_id,
        "run_id": run_id,
        "new_approvals": new_approvals,
        "pending_approvals": store.list_pending_approvals(),
    })


@bp.route("/approvals")
def api_approvals():
    from agent import store
    return jsonify({"approvals": store.list_pending_approvals()})


@bp.route("/approvals/<int:aid>/approve", methods=["POST"])
def api_approve(aid):
    from agent import approvals
    reply = _run_async(approvals.approve(aid))
    return jsonify({"result": reply})


@bp.route("/approvals/<int:aid>/reject", methods=["POST"])
def api_reject(aid):
    from agent import approvals
    reply = _run_async(approvals.reject(aid))
    return jsonify({"result": reply})


@bp.route("/crm/contacts")
def api_contacts():
    from memory.sql_store import get_all_contacts, get_pipeline_summary, get_contacts_needing_followup
    return jsonify({
        "contacts": _safe(get_all_contacts, []),
        "pipeline": _safe(get_pipeline_summary, {}),
        "followups_due": _safe(get_contacts_needing_followup, []),
    })


@bp.route("/goals")
def api_goals():
    from agent import store
    return jsonify({
        "active": _safe(lambda: store.list_goals("active"), []),
        "done": _safe(lambda: store.list_goals("done"), []),
        "plans": _safe(store.list_open_plans, []),
        "reminders": _safe(store.get_pending_reminders, []),
        "skills": _safe(store.list_skills, []),
        "lessons": _safe(lambda: store.recent_lessons(15), []),
    })


@bp.route("/goals", methods=["POST"])
def api_goals_create():
    from agent import store
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400
    try:
        priority = int(data.get("priority") or 3)
    except (TypeError, ValueError):
        priority = 3
    gid = store.add_goal(
        title=title,
        detail=(data.get("detail") or "").strip(),
        priority=max(1, min(5, priority)),
    )
    return jsonify({"id": gid, "goal": {"id": gid, "title": title, "status": "active"}})


@bp.route("/goals/<int:gid>", methods=["PATCH"])
def api_goals_update(gid):
    from agent import store
    data = request.get_json(silent=True) or {}
    status = (data.get("status") or "").strip()
    if status not in ("active", "done", "cancelled"):
        return jsonify({"error": "status must be active, done, or cancelled"}), 400
    store.update_goal(gid, status=status)
    return jsonify({"ok": True, "id": gid, "status": status})


@bp.route("/reminders", methods=["POST"])
def api_reminders_create():
    from agent import store
    from scheduler.jobs import schedule_reminder
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    due_at = (data.get("due_at") or "").strip()
    if not text or not due_at:
        return jsonify({"error": "text and due_at are required"}), 400
    rid = store.add_reminder(text=text, due_at=due_at, repeat=(data.get("repeat") or None))
    _safe(lambda: schedule_reminder(rid, due_at), None)
    return jsonify({"id": rid})


@bp.route("/reminders/<int:rid>", methods=["PATCH"])
def api_reminders_update(rid):
    from agent import store
    from scheduler.jobs import cancel_reminder_job, schedule_reminder
    data = request.get_json(silent=True) or {}
    status = (data.get("status") or "").strip()
    if status not in ("pending", "done", "cancelled"):
        return jsonify({"error": "status must be pending, done, or cancelled"}), 400
    store.set_reminder_status(rid, status)
    if status in ("done", "cancelled"):
        _safe(lambda: cancel_reminder_job(rid), None)
    elif data.get("due_at"):
        due_at = (data.get("due_at") or "").strip()
        store.reschedule_reminder(rid, due_at)
        _safe(lambda: schedule_reminder(rid, due_at), None)
    return jsonify({"ok": True, "id": rid, "status": status})


@bp.route("/nudges")
def api_nudges():
    from dashboard import nudges as nudge_mod
    world_id = (request.args.get("world_id") or "").strip() or None
    return jsonify({"nudges": _safe(lambda: nudge_mod.collect_nudges(world_id), [])})


@bp.route("/crm/contacts/<int:cid>/followup", methods=["POST"])
def api_contact_followup(cid):
    from datetime import datetime, timedelta
    from memory.sql_store import get_contact, update_contact
    data = request.get_json(silent=True) or {}
    contact = get_contact(cid)
    if not contact:
        return jsonify({"error": "contact not found"}), 404
    days = int(data.get("days") or 3)
    days = max(1, min(days, 90))
    followup_date = (datetime.now() + timedelta(days=days)).isoformat()
    update_contact(cid, next_followup_at=followup_date)
    return jsonify({"ok": True, "id": cid, "next_followup_at": followup_date, "days": days})


@bp.route("/crm/contacts", methods=["POST"])
def api_contacts_create():
    from memory.sql_store import add_contact
    from integrations import whatsapp as wa
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    try:
        priority = int(data.get("priority") or 3)
    except (TypeError, ValueError):
        priority = 3
    wa_on = bool(data.get("whatsapp_enabled"))
    company_id = data.get("company_id")
    if company_id is not None:
        try:
            company_id = int(company_id)
        except (TypeError, ValueError):
            company_id = None
    cid = add_contact(
        name=name,
        company=(data.get("company") or "").strip() or None,
        company_id=company_id,
        role=(data.get("role") or "").strip() or None,
        email=(data.get("email") or "").strip() or None,
        linkedin_url=(data.get("linkedin_url") or "").strip() or None,
        phone=(data.get("phone") or "").strip() or None,
        status=(data.get("status") or "prospect").strip(),
        priority=max(1, min(5, priority)),
        notes=(data.get("notes") or "").strip() or None,
        whatsapp_enabled=1 if wa_on else 0,
    )
    _safe(wa.sync_allowlist_to_bridge, None)
    return jsonify({"id": cid})


@bp.route("/crm/companies")
def api_companies_list():
    from memory.sql_store import get_all_companies, company_contact_counts, count_unlinked_contact_companies
    world_id = (request.args.get("world_id") or "").strip() or None
    status = (request.args.get("status") or "").strip() or None
    sector = (request.args.get("sector") or "").strip() or None
    include_unassigned = request.args.get("include_unassigned", "1") not in ("0", "false", "no")
    companies = _safe(
        lambda: get_all_companies(
            world_id=world_id, status=status, sector=sector, include_unassigned=include_unassigned,
        ),
        [],
    )
    counts = _safe(company_contact_counts, {})
    for co in companies:
        co["contact_count"] = counts.get(co["id"], 0)
    return jsonify({
        "companies": companies,
        "meta": {
            "unlinked_contact_companies": _safe(count_unlinked_contact_companies, 0),
        },
    })


@bp.route("/crm/companies/import-from-contacts", methods=["POST"])
def api_companies_import_from_contacts():
    from memory.sql_store import import_companies_from_contacts
    data = request.get_json(silent=True) or {}
    world_id = (data.get("world_id") or request.args.get("world_id") or "").strip() or None
    if world_id == "root":
        world_id = None
    result = _safe(lambda: import_companies_from_contacts(world_id), {"error": "import failed"})
    if result.get("error"):
        return jsonify(result), 500
    return jsonify(result)


@bp.route("/crm/companies", methods=["POST"])
def api_companies_create():
    from memory.sql_store import add_company
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    world_id = (data.get("world_id") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    if not world_id:
        return jsonify({"error": "world_id is required"}), 400
    cid = add_company(
        name=name,
        world_id=world_id,
        website=(data.get("website") or "").strip() or None,
        sector=(data.get("sector") or data.get("industry") or "").strip() or None,
        industry=(data.get("industry") or data.get("sector") or "").strip() or None,
        location=(data.get("location") or "").strip() or None,
        description=(data.get("description") or "").strip() or None,
        research_summary=(data.get("research_summary") or "").strip() or None,
        linkedin_url=(data.get("linkedin_url") or "").strip() or None,
        status=(data.get("status") or "prospect").strip(),
        notes=(data.get("notes") or "").strip() or None,
    )
    return jsonify({"id": cid})


@bp.route("/crm/companies/<int:cid>")
def api_companies_detail(cid):
    from memory.sql_store import get_company, get_company_contacts, company_contact_counts
    co = get_company(cid)
    if not co:
        return jsonify({"error": "company not found"}), 404
    counts = _safe(company_contact_counts, {})
    co["contact_count"] = counts.get(cid, 0)
    contacts = _safe(lambda: get_company_contacts(cid), [])
    return jsonify({"company": co, "contacts": contacts})


@bp.route("/crm/companies/<int:cid>", methods=["PATCH"])
def api_companies_update(cid):
    from memory.sql_store import get_company, update_company
    data = request.get_json(silent=True) or {}
    if not get_company(cid):
        return jsonify({"error": "company not found"}), 404
    allowed = {
        "name", "website", "industry", "sector", "size", "location", "description",
        "research_summary", "icp_score", "notes", "world_id", "linkedin_url", "status",
    }
    payload = {k: v for k, v in data.items() if k in allowed}
    if not payload:
        return jsonify({"error": "no valid fields"}), 400
    update_company(cid, **payload)
    return jsonify({"ok": True, "id": cid})


@bp.route("/crm/companies/<int:cid>/contacts")
def api_company_contacts(cid):
    from memory.sql_store import get_company, get_company_contacts
    if not get_company(cid):
        return jsonify({"error": "company not found"}), 404
    return jsonify({"contacts": _safe(lambda: get_company_contacts(cid), [])})


@bp.route("/crm/outreach/campaigns", methods=["GET"])
def api_outreach_campaigns_list():
    from memory.sql_store import list_campaigns
    world_id = (request.args.get("world_id") or "").strip() or None
    return jsonify({"campaigns": _safe(lambda: list_campaigns(world_id=world_id), [])})


@bp.route("/crm/outreach/campaigns", methods=["POST"])
def api_outreach_campaigns_create():
    from outreach import campaign as camp_mod
    data = request.get_json(silent=True) or {}
    result = camp_mod.create_campaign(
        world_id=(data.get("world_id") or "").strip(),
        company_ids=data.get("company_ids") or [],
        batch_size=data.get("batch_size") or 5,
        brief=(data.get("brief") or "").strip(),
        name=(data.get("name") or "").strip() or None,
    )
    if result.get("error"):
        return jsonify(result), 400
    return jsonify(result)


@bp.route("/crm/outreach/campaigns/<int:cid>")
def api_outreach_campaign_detail(cid):
    from memory.sql_store import get_campaign, list_campaign_drafts
    from outreach.campaign import get_review_queue
    camp = get_campaign(cid)
    if not camp:
        return jsonify({"error": "campaign not found"}), 404
    review = _safe(lambda: get_review_queue(cid), {})
    from outreach.campaign import get_running_job_for_campaign
    job = _safe(lambda: get_running_job_for_campaign(cid), None)
    return jsonify({
        "campaign": camp,
        "review": review,
        "drafts": _safe(lambda: list_campaign_drafts(cid), []),
        "job": job,
    })


@bp.route("/crm/outreach/campaigns/<int:cid>/start", methods=["POST"])
def api_outreach_campaign_start(cid):
    from memory.sql_store import get_campaign
    from outreach.campaign import start_campaign_job
    if not get_campaign(cid):
        return jsonify({"error": "campaign not found"}), 404
    job = start_campaign_job(cid)
    return jsonify({"job": job, "campaign_id": cid})


@bp.route("/crm/outreach/campaigns/<int:cid>/review")
def api_outreach_campaign_review(cid):
    from outreach.campaign import get_review_queue
    review = _safe(lambda: get_review_queue(cid), {})
    if review.get("error"):
        return jsonify(review), 404
    return jsonify(review)


@bp.route("/crm/outreach/drafts/<int:did>", methods=["PATCH"])
def api_outreach_draft_update(did):
    from memory.sql_store import get_draft, update_draft
    data = request.get_json(silent=True) or {}
    if not get_draft(did):
        return jsonify({"error": "draft not found"}), 404
    allowed = {"subject", "body"}
    payload = {k: v for k, v in data.items() if k in allowed}
    if not payload:
        return jsonify({"error": "no valid fields"}), 400
    update_draft(did, **payload)
    return jsonify({"ok": True, "id": did})


@bp.route("/crm/outreach/drafts/<int:did>/approve-send", methods=["POST"])
def api_outreach_draft_approve_send(did):
    from outreach.campaign import approve_and_send
    result = approve_and_send(did)
    if result.get("error"):
        return jsonify(result), 400
    return jsonify(result)


@bp.route("/crm/outreach/campaigns/<int:cid>/stats")
def api_outreach_campaign_stats(cid):
    from outreach.tracker import get_campaign_status
    stats = _safe(lambda: get_campaign_status(cid), {})
    if stats.get("error"):
        return jsonify(stats), 404
    return jsonify(stats)


@bp.route("/crm/outreach/campaigns/<int:cid>/companies/<int:co_id>/skip", methods=["POST"])
def api_outreach_skip_company(cid, co_id):
    from outreach.campaign import skip_company
    result = skip_company(cid, co_id)
    if result.get("error"):
        return jsonify(result), 400
    return jsonify(result)


@bp.route("/crm/outreach/drafts/<int:did>/skip", methods=["POST"])
def api_outreach_draft_skip(did):
    from outreach.campaign import skip_draft
    result = skip_draft(did)
    if result.get("error"):
        return jsonify(result), 400
    return jsonify(result)


@bp.route("/crm/outreach/campaigns/<int:cid>/dossier")
def api_outreach_campaign_dossier_get(cid):
    from outreach.campaign import get_campaign_dossier
    result = _safe(lambda: get_campaign_dossier(cid), {})
    if result.get("error"):
        return jsonify(result), 404
    return jsonify(result)


@bp.route("/crm/outreach/campaigns/<int:cid>/dossier", methods=["PATCH"])
def api_outreach_campaign_dossier_patch(cid):
    from outreach.campaign import save_campaign_dossier
    data = request.get_json(silent=True) or {}
    content = (data.get("dossier_md") or data.get("content") or "").strip()
    if not content:
        return jsonify({"error": "dossier_md required"}), 400
    result = save_campaign_dossier(cid, content)
    if result.get("error"):
        return jsonify(result), 400
    return jsonify(result)


@bp.route("/crm/outreach/drafts/<int:did>/ai-edit", methods=["POST"])
def api_outreach_draft_ai_edit(did):
    import asyncio
    from outreach.campaign import ai_edit_draft
    data = request.get_json(silent=True) or {}
    instruction = (data.get("instruction") or "").strip()
    if not instruction:
        return jsonify({"error": "instruction required"}), 400
    web = bool(data.get("web_search"))
    result = asyncio.run(ai_edit_draft(did, instruction, web_search_enabled=web))
    if result.get("error"):
        return jsonify(result), 400
    return jsonify(result)


@bp.route("/crm/outreach/campaigns/<int:cid>/companies/<int:co_id>/research", methods=["POST"])
def api_outreach_refresh_research(cid, co_id):
    import asyncio
    from outreach.campaign import refresh_company_research
    data = request.get_json(silent=True) or {}
    web = bool(data.get("web_search"))
    result = asyncio.run(refresh_company_research(cid, co_id, web_search_enabled=web))
    if result.get("error"):
        return jsonify(result), 400
    return jsonify(result)


@bp.route("/crm/contacts/<int:cid>", methods=["PATCH"])
def api_contacts_update(cid):
    from memory.sql_store import update_contact, get_contact
    from integrations import whatsapp as wa
    data = request.get_json(silent=True) or {}
    allowed = {
        "name", "company", "company_id", "role", "email", "status", "priority", "notes",
        "linkedin_url", "next_followup_at", "phone", "whatsapp_enabled",
    }
    payload = {k: v for k, v in data.items() if k in allowed}
    if not payload:
        return jsonify({"error": "no valid fields"}), 400
    if not get_contact(cid):
        return jsonify({"error": "contact not found"}), 404
    if "whatsapp_enabled" in payload:
        payload["whatsapp_enabled"] = 1 if payload["whatsapp_enabled"] else 0
    update_contact(cid, **payload)
    _safe(wa.sync_allowlist_to_bridge, None)
    return jsonify({"ok": True, "id": cid})


@bp.route("/memory/search")
def api_memory_search():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"results": []})
    from memory.vector_store import search_all
    return jsonify({"results": _safe(lambda: search_all(q, n_results=8), [])})


@bp.route("/tools")
def api_tools():
    from agent import registry
    from collections import Counter
    tools = registry.all_tools()
    by_cat = Counter(t.category for t in tools)
    return jsonify({
        "total": len(tools),
        "by_category": dict(by_cat),
        "tools": [{
            "name": t.name,
            "description": t.description,
            "category": t.category,
            "requires_approval": t.requires_approval,
        } for t in sorted(tools, key=lambda x: (x.category, x.name))],
    })


@bp.route("/activity")
def api_activity():
    import agent.trace as trace
    from agent import store
    return jsonify({
        "traces": _safe(lambda: trace.recent(25), []),
        "traces_full": _safe(lambda: trace.recent_full(15), []),
        "actions": _safe(lambda: store.recent_actions(30), []),
        "usage_history": _safe(lambda: store.usage_history(14), []),
    })


@bp.route("/history")
def api_history():
    from memory import agent_history
    world_id = (request.args.get("world_id") or "").strip() or None
    limit = min(int(request.args.get("limit") or 40), 100)
    return jsonify(_safe(lambda: agent_history.list_history(limit, world_id=world_id), {"sessions": [], "recent_runs": []}))


@bp.route("/history/sessions/<session_id>")
def api_history_session(session_id):
    from memory import agent_history
    detail = _safe(lambda: agent_history.get_session_detail(session_id), None)
    if not detail:
        return jsonify({"error": "session not found"}), 404
    return jsonify(detail)


@bp.route("/artifacts")
def api_artifacts():
    from memory import agent_history
    world_id = (request.args.get("world_id") or "").strip() or None
    session_id = (request.args.get("session_id") or "").strip() or None
    run_id = (request.args.get("run_id") or "").strip() or None
    limit = min(int(request.args.get("limit") or 50), 100)
    items = _safe(
        lambda: agent_history.list_artifacts(
            limit, session_id=session_id, run_id=run_id, world_id=world_id,
        ),
        [],
    )
    return jsonify({"artifacts": items})


@bp.route("/artifacts", methods=["POST"])
def api_artifacts_create():
    from memory import agent_history
    world_id = (request.form.get("world_id") or "").strip() or None
    if request.files and request.files.get("file"):
        f = request.files["file"]
        raw = f.read()
        if not raw:
            return jsonify({"error": "empty file"}), 400
        art = _safe(
            lambda: agent_history.create_artifact_from_upload(
                filename=f.filename or "upload.md",
                raw=raw,
                world_id=world_id,
            ),
            None,
        )
    else:
        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "Untitled").strip()
        content = data.get("content") or ""
        world_id = (data.get("world_id") or "").strip() or world_id
        art = _safe(
            lambda: agent_history.create_manual_artifact(
                title=title,
                content=content,
                world_id=world_id,
            ),
            None,
        )
    if not art:
        return jsonify({"error": "could not create document"}), 400
    art["download_url"] = f"/api/artifacts/{art['id']}/file"
    return jsonify({"artifact": art}), 201


@bp.route("/artifacts/<int:artifact_id>", methods=["PATCH"])
def api_artifact_update(artifact_id):
    from memory import agent_history
    data = request.get_json(silent=True) or {}
    updated = _safe(
        lambda: agent_history.update_artifact_meta(
            artifact_id,
            title=data.get("title"),
            world_id=data.get("world_id"),
        ),
        None,
    )
    if not updated:
        return jsonify({"error": "artifact not found"}), 404
    updated["download_url"] = f"/api/artifacts/{artifact_id}/file"
    return jsonify({"artifact": updated})


@bp.route("/artifacts/<int:artifact_id>/memory", methods=["POST"])
def api_artifact_memory(artifact_id):
    from memory import agent_history
    data = request.get_json(silent=True) or {}
    collection = (data.get("collection") or "documents").strip()
    result = _safe(
        lambda: agent_history.save_artifact_to_memory(artifact_id, collection=collection),
        {"ok": False, "error": "save failed"},
    )
    if not result.get("ok"):
        return jsonify(result), 400
    return jsonify(result)


@bp.route("/artifacts/<int:artifact_id>")
def api_artifact_detail(artifact_id):
    from memory import agent_history
    art = _safe(lambda: agent_history.get_artifact(artifact_id), None)
    if not art:
        return jsonify({"error": "artifact not found"}), 404
    art["download_url"] = f"/api/artifacts/{artifact_id}/file"
    return jsonify(art)


@bp.route("/artifacts/<int:artifact_id>/file")
def api_artifact_file(artifact_id):
    from memory import agent_history
    from flask import send_file
    path = _safe(lambda: agent_history.artifact_file_path(artifact_id), None)
    if not path:
        return jsonify({"error": "file not available"}), 404
    return send_file(path, as_attachment=True, download_name=os.path.basename(path))


@bp.route("/artifacts/<int:artifact_id>/content")
def api_artifact_content(artifact_id):
    from memory import agent_history
    text = _safe(lambda: agent_history.read_artifact_text(artifact_id), None)
    if text is None:
        return jsonify({"error": "content not available"}), 404
    art = agent_history.get_artifact(artifact_id) or {}
    return jsonify({"id": artifact_id, "title": art.get("title"), "content": text, "kind": art.get("kind")})


@bp.route("/artifacts/<int:artifact_id>/content", methods=["PUT"])
def api_artifact_content_save(artifact_id):
    from memory import agent_history
    data = request.get_json(silent=True) or {}
    content = data.get("content")
    if content is None:
        return jsonify({"error": "content is required"}), 400
    ok = _safe(lambda: agent_history.write_artifact_text(artifact_id, str(content)), False)
    if not ok:
        return jsonify({"error": "could not save"}), 400
    return jsonify({"ok": True, "id": artifact_id})


@bp.route("/live")
def api_live():
    from dashboard import agent_jobs
    return jsonify(agent_jobs.live_snapshot())


@bp.route("/chat/async", methods=["POST"])
def api_chat_async():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or data.get("task") or "").strip()
    if not message:
        return jsonify({"error": "message is required"}), 400
    from dashboard import agent_jobs

    specialist = (data.get("specialist") or "").strip()
    mode = "delegate" if specialist else "chat"
    job = agent_jobs.start_job(
        mode=mode,
        message=message,
        world_id=(data.get("world_id") or "").strip() or None,
        rag_mode=(data.get("rag_mode") or "auto").strip().lower() or "auto",
        specialist=specialist or "supervisor",
        session_id=(data.get("session_id") or "").strip() or None,
        attachments=data.get("attachments") or [],
    )
    return jsonify({"job": job})


@bp.route("/chat/jobs")
def api_chat_jobs():
    from dashboard import agent_jobs
    active = request.args.get("active", "").lower() in ("1", "true", "yes")
    return jsonify({"jobs": agent_jobs.list_jobs(active_only=active)})


@bp.route("/chat/jobs/<job_id>")
def api_chat_job(job_id):
    from dashboard import agent_jobs
    from agent import store

    job = agent_jobs.get_job(job_id)
    if not job:
        return jsonify({"error": "job not found"}), 404
    out = {"job": job}
    if job.get("status") in ("completed", "cancelled", "failed"):
        out["pending_approvals"] = store.list_pending_approvals()
    return jsonify(out)


@bp.route("/chat/jobs/<job_id>/cancel", methods=["POST"])
def api_chat_job_cancel(job_id):
    from dashboard import agent_jobs
    ok = agent_jobs.cancel_job(job_id)
    if not ok:
        return jsonify({"error": "job not running or not found"}), 404
    return jsonify({"ok": True, "job": agent_jobs.get_job(job_id)})


@bp.route("/agents")
def api_agents():
    from agent import subagent, registry
    from agent import skills_catalog
    specs = []
    for name in subagent.list_specialists():
        meta = subagent.specialist_meta(name)
        spec = subagent.SPECIALISTS[name]
        cats = spec["categories"]
        tools = [t for t in registry.all_tools() if t.category in cats]
        specs.append({
            **meta,
            "tool_count": len(tools),
        })
    live = _safe(lambda: __import__("dashboard.live_ops", fromlist=["snapshot"]).snapshot(), {})
    return jsonify({
        "supervisor": {
            "id": "supervisor",
            "label": "Supervisor",
            "role": "Aggregator — routes tasks, tracks parallel projects, orchestrates specialists",
            "status": "busy" if live.get("active") else "ready",
        },
        "specialists": specs,
        "skills": _safe(skills_catalog.list_skills, []),
        "mission": "aggregator",
        "total_tools": len(registry.all_tools()),
        "live": live,
    })


@bp.route("/agents/runs")
def api_agent_runs():
    import agent.trace as trace
    from agent import store
    runs = []
    for t in _safe(lambda: trace.recent_full(40), []):
        actor = t.get("actor") or ""
        if not actor.startswith("subagent:"):
            continue
        runs.append({
            "id": t.get("id"),
            "agent": actor.split(":", 1)[-1],
            "task": t.get("message", ""),
            "result": t.get("final", ""),
            "duration_s": t.get("duration_s", 0),
            "ts": t.get("ts"),
            "tools": [e.get("name") for e in t.get("events", []) if e.get("name")],
        })
    return jsonify({
        "runs": runs,
        "actions": _safe(lambda: store.recent_actions(25), []),
    })


@bp.route("/agents/delegate", methods=["POST"])
def api_delegate():
    data = request.get_json(silent=True) or {}
    specialist = (data.get("specialist") or "").strip()
    task = (data.get("task") or "").strip()
    world_id = (data.get("world_id") or "").strip() or None
    rag_mode = (data.get("rag_mode") or "auto").strip().lower() or "auto"
    session_id = (data.get("session_id") or "").strip() or None
    if not specialist or not task:
        return jsonify({"error": "specialist and task are required"}), 400
    from agent import subagent
    from dashboard import live_ops
    from memory import agent_history

    title = f"{specialist}: {task[:60]}" + ("…" if len(task) > 60 else "")
    session_id = agent_history.begin_turn(
        session_id=session_id,
        world_id=world_id,
        specialist=specialist,
        title=title,
    )
    agent_history.add_message(session_id, "user", task)

    async def _on_status(text: str):
        live_ops.set_phase(text)

    async def _go():
        live_ops.begin(f"subagent:{specialist}", task)
        try:
            return await subagent.run_subagent(
                specialist, task, actor="user", on_status=_on_status, world_id=world_id,
            )
        finally:
            live_ops.end()

    try:
        result = _run_async(_go())
    except Exception as e:
        agent_history.end_turn()
        logger.exception("delegate failed")
        return jsonify({"error": str(e)[:500]}), 500

    reply = ""
    if isinstance(result, dict):
        reply = str(result.get("result") or result.get("reply") or "")
    else:
        reply = str(result)
    run_id = agent_history.current_run_id()
    if reply:
        agent_history.add_message(session_id, "assistant", reply, run_id=run_id)
    agent_history.end_turn()

    if isinstance(result, dict):
        result["session_id"] = session_id
        result["run_id"] = run_id
        if reply and not result.get("reply"):
            result["reply"] = reply
        return jsonify(result)
    return jsonify({"reply": reply, "result": reply, "session_id": session_id, "run_id": run_id})


def _build_world_payload() -> dict:
    from memory import world_model
    from agent import about, registry, store
    from collections import Counter
    from dashboard import graph_viz
    from memory import worlds as hierarchical_worlds
    snap = _safe(lambda: world_model.build_snapshot(persist=False), {})
    tree = _safe(hierarchical_worlds.get_tree, {})
    cats = Counter(t.category for t in registry.all_tools())
    graph = _safe(
        lambda: graph_viz.build_world_graph(snap, store.list_goals("active"), tree),
        {},
    )
    return {
        "snapshot": snap,
        "worlds": tree,
        "tools_by_category": dict(sorted(cats.items(), key=lambda kv: -kv[1])),
        "total_tools": len(registry.all_tools()),
        "about": _safe(about.describe, {}),
        "graph": graph,
    }


@bp.route("/world")
def api_world():
    from dashboard import cache
    return jsonify(cache.get("api:world", 30.0, _build_world_payload))


@bp.route("/graph/runtime")
def api_graph_runtime():
    from agent import subagent
    from dashboard import graph_viz, live_ops
    live = live_ops.snapshot()
    specs = subagent.list_specialists()
    return jsonify(graph_viz.build_runtime_graph(live, specs))


@bp.route("/graph/world")
def api_graph_world():
    from memory import world_model
    from agent import store
    from dashboard import graph_viz
    from memory import worlds as hierarchical_worlds
    snap = _safe(lambda: world_model.build_snapshot(persist=False), {})
    goals = _safe(lambda: store.list_goals("active"), [])
    tree = _safe(hierarchical_worlds.get_tree, {})
    previews = {}
    root = tree.get("root")
    if root:
        previews[root["id"]] = _safe(
            lambda: hierarchical_worlds.snapshot_block(root["id"], max_chars=1600), ""
        )
    for child in tree.get("children") or []:
        cid = child.get("id")
        if cid:
            previews[cid] = _safe(
                lambda c=cid: hierarchical_worlds.snapshot_block(c, max_chars=1600), ""
            )
    return jsonify({
        "snapshot": snap,
        "worlds": tree,
        "graph": graph_viz.build_world_graph(snap, goals, tree),
        "hierarchy_graph": graph_viz.build_world_hierarchy_graph(tree),
        "world_previews": previews,
    })


def _build_graph_memory_payload() -> dict:
    from memory import graph as kg
    from memory.vector_store import collections_overview_light
    from dashboard import graph_viz
    kg_data = _safe(lambda: kg.export_graph(), {"entities": [], "relations": []})
    cols = _safe(collections_overview_light, [])
    return {
        "knowledge_graph": kg_data,
        "collections": cols,
        "graph": graph_viz.build_memory_graph(kg_data, cols),
    }


@bp.route("/graph/memory")
def api_graph_memory():
    from dashboard import cache
    return jsonify(cache.get("api:graph_memory", 60.0, _build_graph_memory_payload))


@bp.route("/notifications")
def api_notifications():
    from dashboard import notifications
    unread = request.args.get("unread") == "1"
    return jsonify({
        "items": notifications.list_items(50, unread_only=unread),
        "unread": notifications.unread_count(),
    })


@bp.route("/notifications/<item_id>/read", methods=["POST"])
def api_notification_read(item_id):
    from dashboard import notifications
    notifications.mark_read(item_id)
    return jsonify({"ok": True, "unread": notifications.unread_count()})


@bp.route("/notifications/read-all", methods=["POST"])
def api_notifications_read_all():
    from dashboard import notifications
    notifications.mark_all_read()
    return jsonify({"ok": True})


@bp.route("/agent/pause", methods=["POST"])
def api_agent_pause():
    """Toggle kill switch via env override in-process (session only)."""
    import os
    from config import config
    data = request.get_json(silent=True) or {}
    paused = bool(data.get("paused"))
    os.environ["AGENT_PAUSED"] = "true" if paused else "false"
    config.agent_paused = paused
    return jsonify({"agent_paused": paused})


@bp.route("/agent/config", methods=["POST"])
def api_agent_config():
    """Session-level autonomy / approval overrides (mirrors .env until restart)."""
    import os
    from config import config
    data = request.get_json(silent=True) or {}
    if "autonomy_level" in data:
        level = (data.get("autonomy_level") or "").strip().lower()
        if level not in ("cautious", "balanced", "autonomous"):
            return jsonify({"error": "autonomy_level must be cautious, balanced, or autonomous"}), 400
        os.environ["AUTONOMY_LEVEL"] = level
        config.autonomy_level = level
    if "auto_approve" in data:
        val = bool(data.get("auto_approve"))
        os.environ["AUTO_APPROVE"] = "true" if val else "false"
        config.auto_approve = val
    return jsonify({
        "autonomy_level": config.autonomy_level,
        "auto_approve": config.auto_approve,
        "agent_paused": config.agent_paused,
    })


@bp.route("/upload", methods=["POST"])
def api_upload():
    """Upload a document for the agent to read."""
    if "file" not in request.files:
        return jsonify({"error": "no file"}), 400
    f = request.files["file"]
    caption = (request.form.get("caption") or "").strip()
    raw = f.read()
    from integrations import documents
    extracted = documents.extract_text(raw, filename=f.filename or "upload")
    message = f"The founder uploaded '{f.filename}'. Notes: {caption or '(none)'}."
    if extracted:
        message += f"\n\n[DOCUMENT CONTENT]\n{extracted[:50000]}"
    from agent import core
    world_id = (request.form.get("world_id") or "").strip() or None
    reply = _run_async(core.run(message, actor="user", world_id=world_id))
    return jsonify({"reply": reply, "filename": f.filename})


@bp.route("/worlds")
def api_worlds_list():
    from memory import worlds as hierarchical_worlds
    return jsonify(hierarchical_worlds.get_tree())


@bp.route("/worlds", methods=["POST"])
def api_worlds_create():
    from memory import worlds as hierarchical_worlds
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    try:
        w = hierarchical_worlds.create_world(
            name=name,
            kind=(data.get("kind") or "project").strip(),
            description=(data.get("description") or "").strip(),
            context=(data.get("context") or "").strip(),
            template=(data.get("template") or "").strip() or None,
            github_repo=(data.get("github_repo") or "").strip(),
            repo_path=(data.get("repo_path") or "").strip(),
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"world": w, "tree": hierarchical_worlds.get_tree()})


@bp.route("/worlds/<world_id>", methods=["PATCH"])
def api_worlds_update(world_id):
    from memory import worlds as hierarchical_worlds
    data = request.get_json(silent=True) or {}
    w = _safe(lambda: hierarchical_worlds.update_world(world_id, **data), None)
    if not w:
        return jsonify({"error": "world not found"}), 404
    return jsonify({"world": w, "tree": hierarchical_worlds.get_tree()})


@bp.route("/worlds/<world_id>", methods=["DELETE"])
def api_worlds_delete(world_id):
    from memory import worlds as hierarchical_worlds
    try:
        ok = hierarchical_worlds.delete_world(world_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if not ok:
        return jsonify({"error": "world not found"}), 404
    return jsonify({"ok": True, "tree": hierarchical_worlds.get_tree()})


@bp.route("/world-templates")
def api_world_templates():
    from memory import world_templates
    return jsonify({"templates": world_templates.list_templates()})


@bp.route("/worlds/<world_id>/vault")
def api_world_vault(world_id):
    from memory import worlds as hierarchical_worlds
    from memory import knowledge_vault
    from memory.world_templates import template_for_kind
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    tpl = w.get("template") or template_for_kind(w.get("kind", "project"))
    structure = _safe(
        lambda: knowledge_vault.vault_structure(world_id, w.get("slug") or world_id, tpl, world=w),
        {},
    )
    from dashboard import graph_viz

    vault_graph = _safe(lambda: graph_viz.build_vault_graph(structure, world=w), {})
    return jsonify({"world": w, "vault": structure, "vault_graph": vault_graph})


@bp.route("/worlds/<world_id>/vault/documents")
def api_vault_documents_list(world_id):
    from memory import worlds as hierarchical_worlds
    from memory.vault_documents import list_documents
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    facet = (request.args.get("facet_id") or "").strip() or None
    return jsonify({"documents": _safe(lambda: list_documents(world_id, facet), [])})


@bp.route("/worlds/<world_id>/vault/documents", methods=["POST"])
def api_vault_documents_create(world_id):
    from memory import worlds as hierarchical_worlds
    from memory import vault_documents
    from memory.world_templates import template_for_kind
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    tpl = w.get("template") or template_for_kind(w.get("kind", "project"))
    slug = w.get("slug") or world_id

    if request.files and "file" in request.files:
        f = request.files["file"]
        raw = f.read()
        title = (request.form.get("title") or f.filename or "Document").strip()
        facet_id = (request.form.get("facet_id") or "docs").strip()
        description = (request.form.get("description") or "").strip()
        try:
            doc = vault_documents.create_document(
                world_id, slug, tpl, facet_id, title, description,
                file_bytes=raw, filename=f.filename or "upload.bin",
            )
        except (ValueError, RuntimeError) as e:
            return jsonify({"error": str(e)}), 400
        return jsonify({"document": doc})

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    facet_id = (data.get("facet_id") or "docs").strip()
    description = (data.get("description") or "").strip()
    text_content = data.get("content") or data.get("text_content")
    if text_content is None and title and description:
        text_content = f"# {title}\n\n{description}"
    try:
        doc = vault_documents.create_document(
            world_id, slug, tpl, facet_id, title, description,
            text_content=str(text_content) if text_content is not None else None,
            filename=(data.get("filename") or "").strip(),
        )
    except (ValueError, RuntimeError) as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"document": doc})


@bp.route("/worlds/<world_id>/vault/documents/<int:doc_id>", methods=["PATCH"])
def api_vault_documents_update(world_id, doc_id):
    from memory import worlds as hierarchical_worlds
    from memory import vault_documents
    from memory.world_templates import template_for_kind
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    doc = vault_documents.get_document(doc_id)
    if not doc or doc.get("world_id") != world_id:
        return jsonify({"error": "document not found"}), 404
    tpl = w.get("template") or template_for_kind(w.get("kind", "project"))
    data = request.get_json(silent=True) or {}
    try:
        updated = vault_documents.update_document(
            doc_id,
            title=data.get("title"),
            description=data.get("description"),
            facet_id=data.get("facet_id"),
            text_content=data.get("content"),
            template_id=tpl,
        )
    except (ValueError, RuntimeError) as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"document": updated})


@bp.route("/worlds/<world_id>/vault/documents/<int:doc_id>", methods=["DELETE"])
def api_vault_documents_delete(world_id, doc_id):
    from memory import worlds as hierarchical_worlds
    from memory import vault_documents
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    doc = vault_documents.get_document(doc_id)
    if not doc or doc.get("world_id") != world_id:
        return jsonify({"error": "document not found"}), 404
    vault_documents.delete_document(doc_id)
    return jsonify({"ok": True, "id": doc_id})


@bp.route("/worlds/<world_id>/vault/documents/<int:doc_id>/content")
def api_vault_documents_content(world_id, doc_id):
    from integrations import object_storage
    from memory import worlds as hierarchical_worlds
    from memory import vault_documents
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    doc = vault_documents.get_document(doc_id)
    if not doc or doc.get("world_id") != world_id:
        return jsonify({"error": "document not found"}), 404
    raw = object_storage.get_bytes(doc.get("storage_key") or "")
    if raw is None:
        return jsonify({"error": "content not found"}), 404
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        return jsonify({"error": "binary content — download only", "size": len(raw)}), 415
    return jsonify({"document": doc, "content": text})


@bp.route("/worlds/<world_id>/vault/ingest", methods=["POST"])
def api_world_vault_ingest(world_id):
    from memory import worlds as hierarchical_worlds
    from memory import knowledge_vault
    from memory.world_templates import template_for_kind
    data = request.get_json(silent=True) or {}
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    tpl = w.get("template") or template_for_kind(w.get("kind", "project"))
    slug = w.get("slug") or world_id
    path = (data.get("path") or "").strip()
    if not path:
        path = str(knowledge_vault.world_vault_path(world_id, slug))
    result = _safe(lambda: knowledge_vault.ingest_tree(path, world_id, slug, tpl), {"error": "ingest failed"})
    return jsonify(result)


@bp.route("/worlds/<world_id>/vault/link-repo", methods=["POST"])
def api_world_vault_link_repo(world_id):
    from memory import worlds as hierarchical_worlds
    from memory import knowledge_vault
    from memory.world_templates import template_for_kind
    data = request.get_json(silent=True) or {}
    repo_path = (data.get("repo_path") or "").strip()
    if not repo_path:
        return jsonify({"error": "repo_path is required"}), 400
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    tpl = w.get("template") or template_for_kind(w.get("kind", "project"))
    slug = w.get("slug") or world_id
    hierarchical_worlds.update_world(world_id, repo_path=repo_path)
    result = _safe(lambda: knowledge_vault.link_repo(world_id, slug, repo_path, tpl), {"error": "link failed"})
    return jsonify(result)


@bp.route("/vault/search")
def api_vault_search():
    from memory import knowledge_vault
    q = (request.args.get("q") or "").strip()
    world_id = (request.args.get("world_id") or "").strip() or None
    domain = (request.args.get("domain") or "").strip() or None
    if not q:
        return jsonify({"error": "q is required"}), 400
    hits = _safe(lambda: knowledge_vault.search_vault(q, world_id=world_id, domain=domain), [])
    return jsonify({"query": q, "hits": hits})


# ── GitHub OAuth + multi-repo linking ─────────────────────────────────────────


@bp.route("/github/status")
def api_github_status():
    from integrations import github_client
    from config import config
    user = None
    if github_client.is_connected():
        user = _safe(github_client.current_user, None)
    return jsonify({
        "connected": github_client.is_connected(),
        "oauth_configured": github_client.oauth_configured(),
        "user": {"login": user.get("login"), "name": user.get("name")} if user else None,
        "redirect_uri": config.github_redirect_uri,
    })


@bp.route("/github/auth/start")
def api_github_auth_start():
    from flask import redirect
    from integrations import github_client
    world_id = (request.args.get("world_id") or "").strip()
    state = json.dumps({"world_id": world_id}) if world_id else ""
    try:
        url = github_client.build_auth_url(state=state)
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400
    return redirect(url)


@bp.route("/github/callback")
def api_github_callback():
    from flask import redirect
    from integrations import github_client
    from config import config
    err = request.args.get("error")
    if err:
        return redirect(f"/?github_error={err}")
    code = (request.args.get("code") or "").strip()
    if not code:
        return redirect("/?github_error=missing_code")
    try:
        token = github_client.exchange_code(code)
        github_client.save_token(token)
    except Exception as e:
        return redirect(f"/?github_error={e}")
    raw_state = request.args.get("state") or ""
    world_id = ""
    if raw_state:
        try:
            world_id = json.loads(raw_state).get("world_id") or ""
        except json.JSONDecodeError:
            pass
    port = config.dashboard_port
    if world_id:
        return redirect(f"/worlds?world={world_id}&github=connected")
    return redirect("/worlds?github=connected")


@bp.route("/github/repos")
def api_github_repos():
    from integrations import github_client
    if not github_client.is_connected():
        return jsonify({"error": "GitHub not connected"}), 401
    q = (request.args.get("q") or "").strip().lower()
    repos = _safe(github_client.list_all_repos, [])
    items = [
        {
            "full_name": r.get("full_name"),
            "private": r.get("private"),
            "default_branch": r.get("default_branch") or "main",
            "html_url": r.get("html_url"),
            "description": (r.get("description") or "")[:200],
            "updated_at": r.get("updated_at"),
        }
        for r in repos
        if r.get("full_name")
    ]
    if q:
        items = [r for r in items if q in r["full_name"].lower() or q in (r.get("description") or "").lower()]
    return jsonify({"repos": items[:200]})


@bp.route("/worlds/<world_id>/repos")
def api_world_repos_list(world_id):
    from memory import worlds as hierarchical_worlds
    from memory import world_repos
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    return jsonify({"repos": _safe(lambda: world_repos.list_repos(world_id), [])})


@bp.route("/worlds/<world_id>/repos/<int:link_id>/files")
def api_world_repo_files(world_id, link_id):
    from memory import worlds as hierarchical_worlds
    from memory import world_repos
    from memory.vault_documents import (
        find_readme_document,
        is_markdown_path,
        list_documents_for_github_repo,
    )
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    link = world_repos.get_repo_link(link_id)
    if not link or link.get("world_id") != world_id:
        return jsonify({"error": "repo link not found"}), 404
    docs = _safe(lambda: list_documents_for_github_repo(world_id, link["full_name"]), [])
    readme = find_readme_document(docs)
    markdown_files = [
        d for d in docs
        if is_markdown_path(d.get("github_path") or d.get("filename") or "")
    ]
    return jsonify({
        "repo": link,
        "documents": docs,
        "readme": readme,
        "markdown_files": markdown_files,
    })


@bp.route("/worlds/<world_id>/repos", methods=["POST"])
def api_world_repos_connect(world_id):
    from integrations import github_client, github_sync
    from memory import worlds as hierarchical_worlds
    from memory import world_repos
    from memory.world_templates import template_for_kind
    if not github_client.is_connected():
        return jsonify({"error": "Connect GitHub first"}), 401
    data = request.get_json(silent=True) or {}
    full_name = (data.get("full_name") or "").strip()
    if not full_name:
        return jsonify({"error": "full_name (owner/repo) is required"}), 400
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    try:
        meta = github_client.get_repo(full_name)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    try:
        link = world_repos.add_repo(
            world_id,
            full_name,
            default_branch=meta.get("default_branch") or "main",
            private=bool(meta.get("private")),
            html_url=meta.get("html_url") or "",
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    tpl = w.get("template") or template_for_kind(w.get("kind", "project"))
    slug = w.get("slug") or world_id
    job = _safe(
        lambda: github_sync.start_repo_sync_job(
            world_id=world_id,
            world_slug=slug,
            template_id=tpl,
            full_name=full_name,
            branch=link.get("default_branch"),
            link_id=link["id"],
        ),
        {"error": "sync job failed", "status": "failed"},
    )
    return jsonify({"repo": link, "job": job})


@bp.route("/sync-jobs/<job_id>")
def api_sync_job_get(job_id):
    from memory import sync_jobs

    job = sync_jobs.public_view(job_id)
    if not job:
        return jsonify({"error": "job not found"}), 404
    return jsonify(job)


@bp.route("/sync-jobs/<job_id>/batch", methods=["POST"])
def api_sync_job_batch(job_id):
    from integrations import github_sync

    data = request.get_json(silent=True) or {}
    batch_size = int(data.get("batch_size") or github_sync.SYNC_BATCH_DEFAULT)
    batch_size = max(1, min(batch_size, 25))
    result = github_sync.process_sync_batch(job_id, batch_size=batch_size)
    if result.get("error") == "job not found":
        return jsonify(result), 404
    return jsonify(result)


@bp.route("/worlds/<world_id>/sync-jobs")
def api_world_sync_jobs(world_id):
    from memory import sync_jobs

    return jsonify({"jobs": sync_jobs.list_active_for_world(world_id)})


@bp.route("/worlds/<world_id>/repos/<int:link_id>", methods=["DELETE"])
def api_world_repos_disconnect(world_id, link_id):
    from memory import worlds as hierarchical_worlds
    from memory import world_repos
    from memory import vault_documents
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    link = world_repos.get_repo_link(link_id)
    if not link or link.get("world_id") != world_id:
        return jsonify({"error": "repo link not found"}), 404
    removed_docs = _safe(lambda: vault_documents.delete_documents_for_github_repo(world_id, link["full_name"]), 0)
    ok = world_repos.remove_repo(link_id, world_id)
    if not ok:
        return jsonify({"error": "repo link not found"}), 404
    return jsonify({"ok": True, "removed_documents": removed_docs})


@bp.route("/worlds/<world_id>/repos/<int:link_id>/sync", methods=["POST"])
def api_world_repos_sync(world_id, link_id):
    from integrations import github_sync
    from memory import worlds as hierarchical_worlds
    from memory import world_repos
    from memory.world_templates import template_for_kind
    w = hierarchical_worlds.get(world_id)
    if not w:
        return jsonify({"error": "world not found"}), 404
    link = world_repos.get_repo_link(link_id)
    if not link or link.get("world_id") != world_id:
        return jsonify({"error": "repo link not found"}), 404
    tpl = w.get("template") or template_for_kind(w.get("kind", "project"))
    slug = w.get("slug") or world_id
    job = _safe(
        lambda: github_sync.start_repo_sync_job(
            world_id=world_id,
            world_slug=slug,
            template_id=tpl,
            full_name=link["full_name"],
            branch=link.get("default_branch"),
            link_id=link_id,
        ),
        {"error": "sync job failed", "status": "failed"},
    )
    return jsonify({"job": job})


# ── WhatsApp (Baileys bridge) ─────────────────────────────────────────────────

@bp.route("/whatsapp/status")
def api_whatsapp_status():
    from integrations import whatsapp as wa
    if not wa.is_configured():
        return jsonify({"configured": False, "connected": False, "qr_pending": False})
    status = _safe(wa.get_status, {})
    status["configured"] = True
    return jsonify(status)


@bp.route("/whatsapp/qr")
def api_whatsapp_qr():
    from integrations import whatsapp as wa
    if not wa.is_configured():
        return jsonify({"error": "WhatsApp not configured"}), 400
    return jsonify(_safe(wa.get_qr, {}))


@bp.route("/whatsapp/messages")
def api_whatsapp_messages():
    from integrations import whatsapp as wa
    from memory.sql_store import get_contact, get_outreach_for_contact
    cid = request.args.get("contact_id", type=int)
    if not cid:
        return jsonify({"error": "contact_id required"}), 400
    contact = get_contact(cid)
    if not contact or not contact.get("whatsapp_enabled"):
        return jsonify({"error": "contact not allowlisted for WhatsApp"}), 403
    return jsonify({
        "messages": _safe(lambda: get_outreach_for_contact(cid, channel="whatsapp"), []),
    })


@bp.route("/whatsapp/send", methods=["POST"])
def api_whatsapp_send():
    """Manual send from dashboard — counts as user-approved."""
    from integrations import whatsapp as wa
    from memory.sql_store import log_outreach, match_contact_by_phone
    from integrations.phone import normalize_phone
    if not wa.is_configured():
        return jsonify({"error": "WhatsApp not configured"}), 400
    data = request.get_json(silent=True) or {}
    to = (data.get("to_e164") or data.get("to") or "").strip()
    body = (data.get("body") or "").strip()
    if not to or not body:
        return jsonify({"error": "to and body are required"}), 400
    e164 = wa.resolve_recipient(to) or normalize_phone(to)
    if not e164 or not wa.is_allowlisted(e164):
        return jsonify({"error": "recipient not on WhatsApp allowlist"}), 403
    token = wa.mint_send_token(e164, body)
    result = wa.send_message(e164, body, approval_token=token)
    if result.get("error") or result.get("success") is False:
        return jsonify(result), 502
    contact = match_contact_by_phone(e164)
    if contact:
        _safe(lambda: log_outreach(contact["id"], "whatsapp", "outbound", body=body[:2000]), None)
    return jsonify(result)
