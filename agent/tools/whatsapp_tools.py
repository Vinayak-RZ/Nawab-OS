"""WhatsApp tools — send always approval-gated; allowlist enforced."""
from agent.registry import register
from integrations import whatsapp as wa
from memory.sql_store import log_outreach, match_contact_by_phone, add_contact, update_contact, search_contacts
from integrations.phone import normalize_phone


@register(
    name="send_whatsapp",
    description="Send a WhatsApp message to an allowlisted CRM contact. "
                "ALWAYS requires your approval before sending. Provide E.164 (+…) or contact name.",
    parameters={
        "type": "object",
        "properties": {
            "to": {"type": "string", "description": "E.164 phone or CRM contact name"},
            "to_e164": {"type": "string", "description": "E.164 phone (alternative to to)"},
            "body": {"type": "string"},
            "contact_name": {"type": "string", "description": "CRM name for logging"},
        },
        "required": ["body"],
    },
    requires_approval=True,
    category="outreach",
)
async def send_whatsapp(to: str = None, to_e164: str = None, body: str = "", contact_name: str = None):
    recipient = to_e164 or to
    if not recipient:
        return {"success": False, "error": "to or to_e164 is required"}
    e164 = wa.resolve_recipient(recipient) or normalize_phone(recipient)
    if not e164:
        return {"success": False, "error": "Could not resolve allowlisted phone number"}
    if not wa.is_allowlisted(e164):
        return {"success": False, "error": "Number not on WhatsApp allowlist — enable in CRM first"}
    token = wa.mint_send_token(e164, body)
    result = wa.send_message(e164, body, approval_token=token)
    if result.get("success"):
        contact = match_contact_by_phone(e164)
        if not contact and contact_name:
            for c in search_contacts(contact_name):
                if c.get("whatsapp_enabled"):
                    contact = c
                    break
        if contact:
            try:
                log_outreach(contact["id"], "whatsapp", "outbound", body=body[:2000])
            except Exception:
                pass
    return result


@register(
    name="save_whatsapp_contact",
    description="Save or update a CRM contact with a phone number and enable WhatsApp for them.",
    parameters={
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "phone": {"type": "string", "description": "Phone in any common format"},
            "company": {"type": "string"},
            "contact_id": {"type": "integer", "description": "Update existing contact by id"},
        },
        "required": ["name", "phone"],
    },
    category="crm",
)
async def save_whatsapp_contact(name: str, phone: str, company: str = None, contact_id: int = None):
    e164 = normalize_phone(phone)
    if not e164:
        return {"error": "Invalid phone number"}
    if contact_id:
        update_contact(contact_id, phone=e164, whatsapp_enabled=1, name=name)
        if company:
            update_contact(contact_id, company=company)
        wa.sync_allowlist_to_bridge()
        return {"ok": True, "id": contact_id, "phone": e164, "whatsapp_enabled": True}
    cid = add_contact(name=name, company=company, phone=e164, whatsapp_enabled=1)
    wa.sync_allowlist_to_bridge()
    return {"ok": True, "id": cid, "phone": e164, "whatsapp_enabled": True}


@register(
    name="list_whatsapp_threads",
    description="Recent WhatsApp messages logged for allowlisted CRM contacts.",
    parameters={
        "type": "object",
        "properties": {
            "contact_name": {"type": "string"},
            "days": {"type": "integer", "default": 7},
        },
    },
    category="crm",
)
async def list_whatsapp_threads(contact_name: str = None, days: int = 7):
    from memory.sql_store import get_recent_outreach, get_whatsapp_allowlist
    rows = [r for r in get_recent_outreach(days=days) if r.get("channel") == "whatsapp"]
    if contact_name:
        q = contact_name.lower()
        rows = [r for r in rows if q in (r.get("contact_name") or "").lower()]
    allowlisted = {c["id"] for c in get_whatsapp_allowlist()}
    rows = [r for r in rows if r.get("contact_id") in allowlisted]
    return {"threads": rows[:30]}


@register(
    name="check_whatsapp_replies_now",
    description="Poll WhatsApp for new messages from allowlisted contacts, draft replies, "
                "and queue them for your approval (never auto-sends).",
    parameters={"type": "object", "properties": {}},
    category="perception",
)
async def check_whatsapp_replies_now():
    from agent import whatsapp_reply_loop
    return await whatsapp_reply_loop.process_whatsapp_replies(notify=True)
