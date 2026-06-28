import json
import os
import tempfile
from unittest.mock import AsyncMock, patch

import pytest


def _mock_world(wid):
    return {"id": wid, "slug": wid, "kind": "project", "template": "startup"}


@pytest.fixture
def isolated_db(monkeypatch):
    import memory.sql_store as sql_store

    with tempfile.TemporaryDirectory() as tmp:
        db_path = os.path.join(tmp, "test.db")
        monkeypatch.setattr(sql_store, "DB_PATH", db_path)
        if hasattr(sql_store._local, "conn"):
            del sql_store._local.conn
        sql_store.init_db()
        yield sql_store


def test_create_campaign_validates_batch(isolated_db):
    from outreach import campaign as camp

    wid = "test-world"
    isolated_db.add_company("Acme", world_id=wid)
    co_id = isolated_db.get_all_companies(world_id=wid)[0]["id"]

    with patch("memory.worlds.resolve_world_id", return_value=wid), patch(
        "memory.worlds.get", return_value=_mock_world(wid)
    ):
        bad = camp.create_campaign(wid, [co_id], batch_size=7, brief="hi")
        assert bad.get("error")

        ok = camp.create_campaign(wid, [co_id], batch_size=5, brief="hi")
        assert ok.get("campaign_id")


def test_approve_send_preflight_gmail(isolated_db, monkeypatch):
    from outreach import campaign as camp
    from config import config

    monkeypatch.setattr(config, "gmail_address", "")
    monkeypatch.setattr(config, "gmail_app_password", "")

    wid = "w1"
    cid = isolated_db.add_contact("Jane", email="jane@acme.com")
    co_id = isolated_db.add_company("Acme", world_id=wid)
    camp_id = isolated_db.create_campaign(wid, "Test", [co_id], 5, "brief")
    draft_id = isolated_db.create_outreach_draft(
        camp_id, co_id, cid, "email", subject="Hi", body="Body",
    )

    result = camp.approve_and_send(draft_id)
    assert result.get("error")
    draft = isolated_db.get_draft(draft_id)
    assert draft["status"] == "failed"


def test_campaign_pipeline_mocks_llm(isolated_db):
    import asyncio
    from outreach import campaign as camp

    wid = "w-pipe"
    co_id = isolated_db.add_company("Beta Co", world_id=wid, sector="Manufacturing")
    isolated_db.add_contact("Bob", email="bob@beta.com", company_id=co_id)

    with patch("memory.worlds.resolve_world_id", return_value=wid), patch(
        "memory.worlds.get", return_value=_mock_world(wid)
    ):
        created = camp.create_campaign(wid, [co_id], 5, "energy savings pitch")
        camp_id = created["campaign_id"]

        async def _run():
            with patch.object(camp, "web_search", return_value=[{"title": "News", "snippet": "Beta expanded"}]):
                with patch.object(camp, "complete", new_callable=AsyncMock) as mock_llm:
                    mock_llm.return_value = json.dumps({
                        "narrative": "Beta Co is a manufacturer.",
                        "summary": "Expansion news",
                    })
                    with patch("specialists.outreach_agent.draft_email_for_campaign", new_callable=AsyncMock) as de:
                        de.return_value = {"subject": "Quick question", "body": "Hi Bob", "personalization_notes": ""}
                        with patch("specialists.outreach_agent.draft_whatsapp_for_campaign", new_callable=AsyncMock):
                            camp.run_research_phase(camp_id)
                            mock_llm.return_value = json.dumps({
                                "cohort_label": "Mfg SMBs",
                                "framing_rules": ["lead with cost"],
                                "email_tone": "direct",
                                "whatsapp_tone": "short",
                            })
                            await camp.run_strategy_phase(camp_id)
                            mock_llm.return_value = json.dumps({
                                "email_subject": "Energy savings",
                                "email_body": "Hi — quick note on energy costs.",
                                "whatsapp_body": "Hi — energy question?",
                            })
                            await camp.run_template_phase(camp_id)
                            await camp.run_draft_phase(camp_id)

        asyncio.run(_run())

    drafts = isolated_db.list_campaign_drafts(camp_id)
    assert len(drafts) >= 1
    review = camp.get_review_queue(camp_id)
    assert review.get("current_company_id") == co_id


def test_rate_limit_gate(isolated_db):
    from outreach import campaign as camp
    import time

    camp._last_send_at["email"] = time.time()
    msg = camp._rate_limit_gate("email")
    assert msg and "Rate limit" in msg


def test_import_companies_from_contacts(isolated_db):
    isolated_db.add_contact("Alice", company="Acme Ltd", email="a@acme.com")
    isolated_db.add_contact("Bob", company="Acme Ltd", email="b@acme.com")
    isolated_db.add_contact("Carol", company="Beta Inc", email="c@beta.com")

    assert isolated_db.count_unlinked_contact_companies() == 2

    result = isolated_db.import_companies_from_contacts(world_id="venture-a")
    assert result["created"] == 2
    assert result["linked_contacts"] == 3

    companies = isolated_db.get_all_companies(world_id="venture-a")
    assert len(companies) == 2
    counts = isolated_db.company_contact_counts()
    assert sum(counts.values()) == 3


def test_get_all_companies_includes_unassigned_world(isolated_db):
    isolated_db.add_company("Legacy Co", world_id=None)
    isolated_db.add_company("Venture Co", world_id="venture-b")

    scoped = isolated_db.get_all_companies(world_id="venture-b", include_unassigned=True)
    names = {c["name"] for c in scoped}
    assert "Venture Co" in names
    assert "Legacy Co" in names

    strict = isolated_db.get_all_companies(world_id="venture-b", include_unassigned=False)
    assert len(strict) == 1
    assert strict[0]["name"] == "Venture Co"
