# Outreach campaigns

World-scoped batch outreach from CRM → **Outreach** tab.

## Flow

1. Select world, batch size (5/10/15/20), prospect companies, and a brief.
2. Background job: **research** (vault tree + web) → **strategy** (one LLM cohort plan) → **drafts** (email + WhatsApp per contact).
3. **Review console**: edit each draft, **Approve & Send** one message at a time (or Skip).

## Human-in-the-loop

- No auto-send for cold email or WhatsApp from the agent loop.
- CRM **Approve & Send** is the only send gate for campaign messages.
- Rate limits: `OUTREACH_EMAIL_COOLDOWN_S` (default 30), `OUTREACH_WA_COOLDOWN_S` (default 60).

## API

| Route | Purpose |
|-------|---------|
| `POST /api/crm/outreach/campaigns` | Create campaign |
| `POST /api/crm/outreach/campaigns/<id>/start` | Run research → strategy → draft |
| `GET /api/crm/outreach/campaigns/<id>/review` | Review queue |
| `PATCH /api/crm/outreach/drafts/<id>` | Edit draft |
| `POST /api/crm/outreach/drafts/<id>/approve-send` | Send one message |
| `GET /api/crm/outreach/campaigns/<id>/stats` | Progress stats |

## Module

`outreach/campaign.py` — orchestration, preflight, approve-send.
