import asyncio

import pytest

from agent import policy, registry, store, whatsapp_reply_loop
from memory import sql_store


class _FakeTool:
    def __init__(self, name, requires_approval=False):
        self.name = name
        self.requires_approval = requires_approval


def test_send_whatsapp_always_requires_approval(monkeypatch):
    from config import config
    monkeypatch.setattr(config, "auto_approve", True)
    monkeypatch.setattr(config, "autonomy_level", "autonomous")
    tool = _FakeTool("send_whatsapp", requires_approval=True)
    assert policy.decide(tool, {}) == "approve"


def test_send_email_always_requires_approval_for_cold_outreach(monkeypatch):
    from config import config
    monkeypatch.setattr(config, "auto_approve", True)
    monkeypatch.setattr(config, "autonomy_level", "autonomous")
    tool = _FakeTool("send_email", requires_approval=True)
    assert policy.decide(tool, {}) == "approve"
