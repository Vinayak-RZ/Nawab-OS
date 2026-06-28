"""Campaign dossier — one editable markdown file per outreach batch."""
from __future__ import annotations

import os
from datetime import datetime
from typing import Optional

from memory import knowledge_vault, worlds

DOSSIER_FACET = "sales"


def _knowledge_root() -> str:
    return os.getenv("KNOWLEDGE_VAULT_ROOT", "./data/knowledge")


def dossier_relpath(world_slug: str, campaign_id: int) -> str:
    return f"{world_slug}/outreach/campaign-{campaign_id}.md"


def dossier_abspath(world_slug: str, campaign_id: int) -> str:
    return os.path.join(_knowledge_root(), dossier_relpath(world_slug, campaign_id))


def _world_slug(world_id: str) -> str:
    """Resolve world slug; fall back to world_id if worlds DB unavailable."""
    if not world_id:
        return "unknown"
    try:
        w = worlds.get(world_id) or {}
        return w.get("slug") or world_id
    except Exception:
        return world_id


def read_dossier(world_id: str, campaign_id: int) -> str:
    slug = _world_slug(world_id)
    path = dossier_abspath(slug, campaign_id)
    if os.path.isfile(path):
        with open(path, encoding="utf-8") as f:
            return f.read()
    return ""


def write_dossier(world_id: str, campaign_id: int, content: str) -> str:
    slug = _world_slug(world_id)
    path = dossier_abspath(slug, campaign_id)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return dossier_relpath(slug, campaign_id)


def build_dossier_markdown(campaign: dict, companies: list[dict], brief: str = "") -> str:
    """Build campaign dossier from per-company research rows."""
    name = campaign.get("name") or f"Campaign #{campaign.get('id')}"
    lines = [
        f"# {name}",
        "",
        f"*Updated {datetime.now().strftime('%Y-%m-%d %H:%M')}*",
        "",
        "## Outreach brief",
        brief or campaign.get("brief") or "_No brief provided._",
        "",
        "## Companies in this batch",
        "",
    ]
    for i, row in enumerate(companies, start=1):
        co_name = row.get("company_name") or row.get("name") or "Company"
        sector = row.get("sector") or ""
        narrative = row.get("_narrative") or ""
        if not narrative:
            import json
            try:
                rj = json.loads(row.get("research_json") or "{}")
                narrative = rj.get("narrative") or rj.get("summary") or ""
            except Exception:
                narrative = ""
        lines.append(f"### {i}. {co_name}")
        if sector:
            lines.append(f"**Sector:** {sector}")
        lines.append("")
        lines.append(narrative or "_Research pending._")
        lines.append("")
        lines.append("---")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def ingest_dossier_to_vault(world_id: str, campaign_id: int, content: str, title: str) -> Optional[int]:
    """Optional vault mirror for Documents workspace (best-effort)."""
    try:
        from memory import vault_documents

        slug = _world_slug(world_id)
        w = {}
        try:
            w = worlds.get(world_id) or {}
        except Exception:
            pass
        tpl = w.get("template") or "startup"
        doc = vault_documents.create_document(
            world_id,
            slug,
            tpl,
            DOSSIER_FACET,
            title,
            description=f"Outreach campaign #{campaign_id} research dossier",
            text_content=content,
            filename=f"campaign-{campaign_id}.md",
        )
        return doc.get("id")
    except Exception:
        return None
