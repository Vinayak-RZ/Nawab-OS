# Knowledge tree (navigate-then-fetch)

Per-world retrieval for agents and outreach research without full-repo vector chunking.

## Pattern

1. **`vault_outline(world_id)`** — cheap tree: facets → files with `doc_id`, title, 1–3 line summary.
2. **`read_vault_file(doc_id)`** — full file on demand (50k char cap, world-scoped).
3. Optional **`query_vault`** — semantic jump to relevant catalog entries (title + description only).

## Summaries

- Stored in `vault_documents.description`.
- Generated at ingest/upload via `summarize_document_text()` (heuristic: heading + first lines).
- GitHub sync uses the same helper after import.

## Tools

Registered in `agent/tools/vault_tools.py` under category `research`. Available to outreach, leads, market, and vault specialists.

## Visual tree

World vault graph (`build_vault_graph`) includes `summary` on document nodes for hover/inspect in the UI.
