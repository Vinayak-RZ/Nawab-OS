# Nawab OS — Current State

**Last updated:** 2026-06-13  
**Active branch:** `cursor/frontend-ux-overhaul-cb1c`  
**Base:** `cursor/github-repo-readme-viewer-cb1c` → `main`

---

## Branches on remote

| Branch | Status | PR |
|--------|--------|-----|
| `cursor/github-repo-readme-viewer-cb1c` | **Complete** — README viewer + synced markdown browse | [PR #1](https://github.com/Vinayak-RZ/Nawab-OS/pull/1) (draft) |
| `cursor/frontend-ux-overhaul-cb1c` | **In progress** — backend + CSS shell; JS wiring pending | Push this branch for local handoff |

---

## Shipped (README viewer branch — merged into UX branch)

### GitHub repo files in Worlds vault
- **Open README** per linked repo
- Collapsible list of synced markdown files
- **View** on vault document cards → existing MD dialog (`FOSMarkdown`)
- API: `GET /api/worlds/{world_id}/repos/{link_id}/files`

### Key files
- `dashboard/static/app.js` — `openVaultDocViewer`, `renderGithubReposPanel`, vault View buttons
- `memory/vault_documents.py` — `list_documents_for_github_repo`, `find_readme_document`
- `tests/test_github_repo_files.py`, `tests/test_dashboard_api.py::test_world_repo_files_endpoint`

---

## In progress (UX overhaul branch — this push)

### Backend — done in this branch
| Change | File |
|--------|------|
| Reminders from UI now schedule APScheduler jobs | `dashboard/api.py` — `POST /reminders` calls `schedule_reminder` |
| Reminder cancel/reschedule | `PATCH /api/reminders/{id}` |
| Proactive nudges API | `GET /api/nudges?world_id=` → `dashboard/nudges.py` |
| CRM follow-up scheduling | `POST /api/crm/contacts/{id}/followup` + `next_followup_at` on PATCH |
| Chat file attachments (vault docs) | `POST /api/chat/async` accepts `attachments[]`; `dashboard/agent_jobs.py` inlines file content into agent message |

### Nudges (`dashboard/nudges.py`)
Aggregates actionable items:
- Pending/overdue reminders
- CRM follow-ups due
- Pending approvals
- Active goals (top 5)
- Vault-derived lead nudges (synced GitHub docs mentioning leads + prospect contacts not contacted)

## In progress (UX overhaul — main branch)

### Frontend — wired in this push
| Feature | Status |
|---------|--------|
| Global progress bar + view skeletons | Done |
| Dashboard **Up Next** (`/api/nudges`) | Done |
| Dashboard dedup (no duplicate fleet/graph header) | Done |
| GitHub **folder tree** + Tag in agent | Done |
| Chat: specialist picker, vault attach, attachment chips | Done |
| CRM follow-up buttons, Goals reminder done/cancel | Done |
| Notifications open → view | Done |
| Vault loading skeletons, removed legacy slots overview | Done |

---

## Local setup (quick)

```bash
git clone https://github.com/Vinayak-RZ/Nawab-OS.git
cd Nawab-OS
git fetch origin
git checkout cursor/frontend-ux-overhaul-cb1c

python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit: DASHBOARD_PIN, GITHUB_*, AWS_S3_BUCKET optional

python main.py
# Open http://127.0.0.1:5000 (or port shown in logs)
```

### Env vars that matter for your features
- `DASHBOARD_PIN` — 6-digit gate (optional locally)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — repo link + sync in Worlds
- `AWS_S3_BUCKET` — omit to use `./data/vault-objects/` locally
- `QDRANT_*` — optional; memory search degrades gracefully if unset

### Skillfish (local Cursor only)
```bash
npx skillfish add affaan-m/everything-claude-code frontend-patterns
npx skillfish add anthropics/claude-plugins-official frontend-design
```
Failed in cloud agent environment; works on local Cursor.

---

## Test commands

```bash
python3 -m pytest tests/test_github_repo_files.py tests/test_dashboard_api.py -q
# After nudges tests added locally:
python3 -m pytest tests/test_nudges.py -q
```

---

## Architecture reminder

```
Worlds → Link GitHub → Sync jobs → vault_documents (SQLite) + S3/local payloads
                                              ↓
                                    MD viewer / (planned) chat attachments
Scheduler → reminders, follow-ups, heartbeat → notifications bell
Agent chat → POST /api/chat/async → agent_jobs → core.run()
```
