"""WhatsApp reply loop — allowlisted contacts only; approval required for every send."""
import logging
from datetime import datetime, timedelta

from config import config
from agent import store

logger = logging.getLogger(__name__)

_last_poll_cursor = None


def _msg_key(m: dict) -> str:
    mid = (m.get("id") or "").strip()
    if mid:
        return mid
    return f"{m.get('from_e164','')}|{m.get('timestamp','')}|{(m.get('body') or '')[:80]}"


async def _draft_reply(contact: dict, their_message: str) -> str:
    from llm import router
    name = contact.get("name") or "there"
    company = contact.get("company") or ""
    sys = (
        f"You are {config.my_name}, {config.my_role} at {config.company_name}. "
        f"{config.my_one_liner}\n"
        "Write a concise, warm WhatsApp reply (chat tone, not email).\n"
        "Rules: plain text only, 1-4 short sentences, address them by first name, "
        f"sign off as {config.my_name}. No subject line. Do not invent facts or commitments."
    )
    usr = (
        f"Reply on WhatsApp to {name}" + (f" at {company}" if company else "") + ".\n"
        f"Their message:\n{their_message}\n\nWrite my reply only."
    )
    body = await router.complete(
        [{"role": "system", "content": sys}, {"role": "user", "content": usr}],
        task_type="outreach", max_tokens=400,
    )
    return (body or "").strip()


async def _notify_reply(contact: dict, m: dict, draft: str, to_e164: str):
    from scheduler import jobs as scheduler
    from agent import approvals

    name = contact.get("name") or "Contact"
    company = contact.get("company") or "?"
    snippet = (m.get("body") or "")[:600]
    header = f"💬 *WhatsApp from {name}* ({company})\n\n{snippet}"

    if not draft:
        await scheduler.send_to_user(
            header + "\n\n_(I couldn't draft a reply — ask me to write one.)_"
        )
        return

    full = f"{header}\n\n✍️ *Suggested reply:*\n{draft}"

    q = approvals.enqueue("send_whatsapp", {
        "to_e164": to_e164,
        "body": draft,
        "contact_name": contact.get("name"),
    })
    aid = q.get("approval_id")
    if aid:
        await scheduler.send_approval_to_user(
            aid, f"{full}\n\n_Tap Approve to send this WhatsApp reply._"
        )
    else:
        await scheduler.send_to_user(f"{full}\n\n⚠️ {q.get('message', 'Could not queue the reply.')}")


async def process_whatsapp_replies(notify: bool = True, limit: int = 30) -> dict:
    """Poll bridge for allowlisted inbound; log, draft, queue approval — never auto-send."""
    global _last_poll_cursor
    from integrations import whatsapp as wa
    if not wa.is_configured():
        return {"configured": False, "processed": 0,
                "note": "WhatsApp not configured (set WHATSAPP_ENABLED + bridge env)."}

    wa.sync_allowlist_to_bridge()

    msgs = wa.fetch_inbound(since=_last_poll_cursor)
    if msgs and isinstance(msgs[0], dict) and msgs[0].get("error"):
        return {"configured": True, "processed": 0, "error": msgs[0]["error"]}

    from memory.sql_store import log_outreach, update_contact, match_contact_by_phone

    processed = []
    for m in msgs[:limit]:
        from_e164 = m.get("from_e164") or ""
        contact = match_contact_by_phone(from_e164)
        if not contact:
            continue

        key = _msg_key(m)
        if store.whatsapp_seen(key):
            continue
        store.mark_whatsapp_seen(key)

        if m.get("timestamp"):
            _last_poll_cursor = max(_last_poll_cursor or "", m["timestamp"])

        cid = contact["id"]
        body_in = m.get("body") or ""

        try:
            log_outreach(cid, "whatsapp", "inbound", body=body_in[:2000], status="received")
        except Exception as e:
            logger.error(f"[whatsapp_reply_loop] inbound log failed: {e}")

        try:
            updates = {"last_contacted_at": datetime.now().isoformat(),
                       "next_followup_at": (datetime.now() + timedelta(days=3)).isoformat()}
            if (contact.get("status") or "") in ("", "prospect", "contacted", "new"):
                updates["status"] = "responded"
            update_contact(cid, **updates)
        except Exception as e:
            logger.error(f"[whatsapp_reply_loop] contact update failed: {e}")

        try:
            draft = await _draft_reply(contact, body_in)
        except Exception as e:
            logger.error(f"[whatsapp_reply_loop] draft failed: {e}")
            draft = ""

        record = {
            "contact": contact.get("name"),
            "phone": from_e164,
            "drafted": bool(draft),
            "approval_only": True,
        }

        if notify:
            try:
                await _notify_reply(contact, m, draft, from_e164)
            except Exception as e:
                logger.error(f"[whatsapp_reply_loop] notify failed: {e}")

        processed.append(record)

    return {"configured": True, "processed": len(processed), "replies": processed}
