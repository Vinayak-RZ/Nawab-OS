import asyncio

import pytest

from agent import whatsapp_reply_loop
from memory import sql_store


def test_reply_loop_never_auto_sends(monkeypatch):
    """WhatsApp loop must only enqueue approval — no direct send path."""
    sql_store.add_contact(name="Bob", phone="+12025550199", whatsapp_enabled=1)

    sent = []

    async def fake_send(*args, **kwargs):
        sent.append(True)
        return {"success": True}

    from integrations import whatsapp as wa
    monkeypatch.setattr(wa, "is_configured", lambda: True)
    monkeypatch.setattr(wa, "sync_allowlist_to_bridge", lambda: {})
    monkeypatch.setattr(wa, "fetch_inbound", lambda since=None: [{
        "id": "wa-99",
        "from_e164": "+12025550199",
        "body": "Hi",
        "timestamp": "2026-06-01T10:00:00",
    }])
    monkeypatch.setattr(wa, "send_message", fake_send)

    async def fake_draft(contact, msg):
        return "Reply text"

    monkeypatch.setattr(whatsapp_reply_loop, "_draft_reply", fake_draft)

    queued = []

    def fake_enqueue(tool, args, risk_note=""):
        queued.append((tool, args))
        return {"approval_id": 42}

    from agent import approvals
    monkeypatch.setattr(approvals, "enqueue", fake_enqueue)

    asyncio.run(whatsapp_reply_loop.process_whatsapp_replies(notify=True))

    assert not sent
    assert queued
    assert queued[0][0] == "send_whatsapp"
