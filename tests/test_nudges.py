import os
import tempfile

from agent import store
from dashboard import nudges


def test_collect_nudges_includes_reminder(monkeypatch):
    db_path = tempfile.mktemp(suffix=".db")
    monkeypatch.setenv("FOUNDER_OS_DB", db_path)
    store.init_agent_db()
    rid = store.add_reminder("Call investor", "2099-01-01T09:00:00")
    items = nudges.collect_nudges()
    assert any(n["kind"] == "reminder" and n["meta"]["reminder_id"] == rid for n in items)


def test_vault_lead_nudge_when_prospects_exist(monkeypatch):
    import tempfile as tf

    from memory import vault_documents as vd
    from memory.sql_store import add_contact, init_db

    with tf.TemporaryDirectory() as tmp:
        os.environ["VAULT_OBJECT_ROOT"] = tmp
        db_path = tf.mktemp(suffix=".db")
        monkeypatch.setenv("FOUNDER_OS_DB", db_path)
        init_db()
        vd.init_vault_documents_db()
        add_contact(name="Alice Lead", company="Acme", status="prospect")
        vd.upsert_github_document(
            world_id="w-nudge",
            world_slug="w-nudge",
            template_id="startup",
            facet_id="docs",
            title="GTM",
            description="Generated 12 leads from outreach",
            filename="README.md",
            file_bytes=b"# Leads\n",
            source_ref="github:o/r:README.md",
            github_repo="o/r",
            github_path="README.md",
        )
        lead_nudges = nudges._vault_lead_nudges("w-nudge")
        assert lead_nudges
        assert lead_nudges[0]["kind"] == "vault_leads"
