import os
import tempfile

from memory import knowledge_vault as kv
from memory import vault_documents as vd


def test_summarize_document_text_heading_and_paragraph():
    text = "# Market overview\n\nIndian SMB manufacturers face rising energy costs.\n\nMore detail here."
    s = vd.summarize_document_text(text)
    assert "Market overview" in s
    assert "energy" in s.lower()


def test_vault_outline_shape():
    with tempfile.TemporaryDirectory() as tmp:
        os.environ["KNOWLEDGE_VAULT_ROOT"] = tmp
        os.environ["VAULT_OBJECT_ROOT"] = tmp
        os.environ.pop("AWS_S3_BUCKET", None)
        vd.init_vault_documents_db()
        tpl = "startup"
        kv.ensure_world_structure("w-outline", "w-outline", tpl)
        doc = vd.create_document(
            "w-outline",
            "w-outline",
            tpl,
            "clients",
            "ICP doc",
            "SMB manufacturers seeking analytics",
            text_content="# ICP\n\nTarget SMBs in manufacturing.",
        )
        outline = kv.vault_outline("w-outline", "w-outline", tpl)
        assert outline["world_id"] == "w-outline"
        assert len(outline["facets"]) >= 1
        all_files = [f for facet in outline["facets"] for f in facet.get("files") or []]
        assert any(f.get("doc_id") == doc["id"] for f in all_files)
        matched = next(f for f in all_files if f.get("doc_id") == doc["id"])
        assert matched.get("summary")


def test_read_vault_file_size_cap_and_world_scope():
    with tempfile.TemporaryDirectory() as tmp:
        os.environ["VAULT_OBJECT_ROOT"] = tmp
        os.environ.pop("AWS_S3_BUCKET", None)
        vd.init_vault_documents_db()
        body = "x" * 60000
        doc = vd.create_document(
            "w-read",
            "w-read",
            "startup",
            "notes",
            "Big doc",
            "summary",
            text_content=body,
        )
        full = kv.read_vault_file(doc["id"], world_id="w-read", max_chars=50000)
        assert full.get("content")
        assert full.get("truncated") is True
        assert len(full["content"]) == 50000

        wrong_world = kv.read_vault_file(doc["id"], world_id="other-world")
        assert wrong_world.get("error")
