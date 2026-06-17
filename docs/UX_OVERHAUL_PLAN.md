# UX Overhaul Plan — Nawab OS

**Goal:** Better loading UX, discoverable capabilities, GitHub repo tree + tag-in-agent, proactive nudges — **without changing the design theme** (Rosso Corsa / dark canvas per `DESIGN.md`).

**Continue on branch:** `cursor/frontend-ux-overhaul-cb1c`  
**Read first:** `docs/CURRENT_STATE.md`

---

## Phase 1 — Loading & feedback (frontend)

**Objective:** Replace “whole page goes dim and dead” with visible progress.

### Work items
1. Update `setViewLoading(on, { progress })` in `app.js`:
   - Show/hide `#global-progress`
   - Toggle `is-indeterminate` class (CSS already in `app.css`)
2. Add `renderViewSkeleton(view)` — use `.skeleton`, `.skeleton-card`, `.skeleton-grid`
3. In `render()`: if `state._viewLoading`, render skeleton for current view instead of full content
4. Vault panel: replace text “Loading…” with skeleton cards
5. Keep `ops-stack` progress for GitHub sync (already works)

### Expected outcome
Navigation feels responsive; users see structure while data loads.

### Files
- `dashboard/static/app.js`
- `dashboard/static/app.css` (minor tweaks only if needed)

---

## Phase 2 — Dashboard cleanup + Up Next

**Objective:** Remove dead space; surface what needs attention.

### Remove / consolidate
- Drop duplicate `command-header` (operator panel already has quick actions)
- Remove full-width “Agent fleet” duplicate (detail lives on Agents page)
- Remove dashboard runtime graph (keep on Chat + Agents)
- Remove vault “All slots overview” `<details>` legacy block

### Add
- `renderUpNext()` — `GET /api/nudges?world_id={current}`
- Render on Control center above charts
- Each nudge: title, body, action button → `goView(action)` or open vault doc

### Files
- `dashboard/static/app.js`
- `dashboard/nudges.py` (extend kinds if needed)

---

## Phase 3 — GitHub repo tree + tag in agent

**Objective:** See repo **folder structure**; open files; attach to agent chat.

### Work items
1. `buildGithubPathTree(docs)` — group `github_path` by directory
2. `renderGithubTree(node, worldId)` — nested `<details>` per folder
3. Per file actions:
   - **View** → `openVaultDocViewer`
   - **Tag in agent** → `tagVaultDocInChat(doc)` → adds to `state._chatAttachments`, `goView('chat')`
4. Optionally fetch `GET /api/worlds/{id}/repos/{link_id}/files` on expand (API exists; UI currently reads vault facets only)

### Chat attachment flow
```javascript
state._chatAttachments = [{ type: 'vault', doc_id, title, path }];
// In chatPayload / startAgentJob:
attachments: state._chatAttachments
// Clear after send
```

Backend already inlines attached vault file content in `agent_jobs._enrich_message`.

### Files
- `dashboard/static/app.js`
- `dashboard/static/app.css` (`.github-tree` exists)

---

## Phase 4 — Chat & capability discovery

**Objective:** Use platform features without hunting through nav.

### Chat composer
- Inline `#chat-specialist-select` (reuse `populateSpecialistSelect` pattern)
- **Attach from vault** button → modal/picker of synced docs for active world
- Capability strip on empty state: CRM, Goals, Outreach, Vault, Documents → `goView` or prefill message

### Agents page
- CRM/Vault tabs → link cards to full views instead of duplicate data

### Files
- `dashboard/static/app.js`
- `dashboard/static/index.html` (optional dialog for vault picker)

---

## Phase 5 — CRM, Goals, Notifications

### CRM
- Per contact: **Follow up in 3d / 7d** → `POST /api/crm/contacts/{id}/followup`
- Follow-ups list: **Open in CRM** + schedule buttons

### Goals
- Reminder rows: **Done** / **Cancel** → `PATCH /api/reminders/{id}`

### Notifications
- `data-notif-action` → approvals / crm / goals
- `POST /api/notifications/{id}/read` on click

### Files
- `dashboard/static/app.js`
- `dashboard/api.py` (notification read already exists)

---

## Phase 6 — Tests & polish

| Test | Covers |
|------|--------|
| `tests/test_nudges.py` | `collect_nudges`, vault lead nudge |
| `tests/test_dashboard_api.py` | `GET /nudges`, `PATCH /reminders`, followup POST |
| Manual | GitHub tree, tag-in-chat, Up Next panel |

---

## Priority order (if time-boxed)

```
P0  Phase 1 (loading) + Phase 3 (GitHub tree + tag)
P1  Phase 2 (Up Next) + Phase 5 (reminder/CRM fixes in UI)
P2  Phase 4 (chat discovery) + dashboard dedup
P3  Phase 6 tests + notification deep links
```

---

## Non-goals (this overhaul)

- Design theme / color token changes
- S3 bucket browser (use synced vault registry)
- Live GitHub API tree before sync (sync-first is fine)
- Replacing vanilla JS with React

---

## Risks

| Risk | Mitigation |
|------|------------|
| Large `app.js` edits | Small commits per phase |
| Attachment size in chat | Already truncated at 14k chars in `agent_jobs` |
| Nudges false positives on “leads” keyword | Tune regex or require prospect count > 0 (already does) |

---

## Handoff checklist for local dev

- [ ] Checkout `cursor/frontend-ux-overhaul-cb1c`
- [ ] `pip install -r requirements.txt && pip install pytest`
- [ ] Copy `.env` with GitHub OAuth for Worlds testing
- [ ] Run `python main.py`, verify `/api/nudges` returns JSON when logged in
- [ ] Start Phase 1 in `app.js` (progress bar + skeletons)
- [ ] Install skillfish skills in local Cursor if desired
