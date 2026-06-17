import asyncio

import pytest

from agent import store, whatsapp_reply_loop
from memory import sql_store


def test_non_allowlisted_inbound_not_stored(monkeypatch):
    cid = sql_store.add_contact(name="Jane", phone="+447911123456", whatsapp_enabled=0)

    fake_msgs = [{
        "id": "wa-msg-1",
        "from_e164": "+447911123456",
        "body": "Hello",
        "timestamp": "2026-01-01T12:00:00",
    }]

    from integrations import whatsapp as wa
    monkeypatch.setattr(wa, "is_configured", lambda: True)
    monkeypatch.setattr(wa, "sync_allowlist_to_bridge", lambda: {"ok": True})
    monkeypatch.setattr(wa, "fetch_inbound", lambda since=None: fake_msgs)

    res = asyncio.run(whatsapp_reply_loop.process_whatsapp_replies(notify=False))
    assert res["processed"] == 0
    rows = sql_store.get_outreach_for_contact(cid, channel="whatsapp")
    assert len(rows) == 0


def test_allowlisted_inbound_stored_and_deduped(monkeypatch):
    cid = sql_store.add_contact(
        name="Jane", phone="+447911123456", whatsapp_enabled=1, status="contacted",
    )

    fake_msgs = [{
        "id": "wa-msg-2",
        "from_e164": "+447911123456",
        "body": "Sounds good",
        "timestamp": "2026-01-02T12:00:00",
    }]

    from integrations import whatsapp as wa
    monkeypatch.setattr(wa, "is_configured", lambda: True)
    monkeypatch.setattr(wa, "sync_allowlist_to_bridge", lambda: {"ok": True})
    monkeypatch.setattr(wa, "fetch_inbound", lambda since=None: fake_msgs)

    async def fake_draft(contact, msg):
        return "Great, talk soon."

    monkeypatch.setattr(whatsapp_reply_loop, "_draft_reply", fake_draft)

    res = asyncio.run(whatsapp_reply_loop.process_whatsapp_replies(notify=False))
    assert res["processed"] == 1
    assert res["replies"][0]["approval_only"] is True

    rows = sql_store.get_outreach_for_contact(cid, channel="whatsapp")
    assert len(rows) == 1
    assert rows[0]["direction"] == "inbound"

    contact = sql_store.get_contact(cid)
    assert contact["status"] == "responded"

    res2 = asyncio.run(whatsapp_reply_loop.process_whatsapp_replies(notify=False))
    assert res2["processed"] == 0
