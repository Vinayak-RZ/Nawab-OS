"""Load skill markdown bodies for agent prompts."""
from __future__ import annotations

from pathlib import Path

_PROJECT_ROOT = Path(__file__).resolve().parents[1]
_SKILLS_ROOT = _PROJECT_ROOT / ".cursor" / "skills"


def load_skill_bodies(skill_ids: list[str], max_chars: int = 6000) -> str:
    """Read SKILL.md files for the given ids; truncate to max_chars total."""
    if not skill_ids:
        return ""
    parts: list[str] = []
    remaining = max_chars
    for sid in skill_ids:
        if remaining <= 0:
            break
        path = _SKILLS_ROOT / sid / "SKILL.md"
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8").strip()
        except OSError:
            continue
        if len(text) > remaining:
            text = text[: remaining - 20].rstrip() + "\n… (truncated)"
        parts.append(f"## Skill: {sid}\n{text}")
        remaining -= len(text)
    return "\n\n".join(parts)
