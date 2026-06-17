# WhatsApp integration (Baileys bridge)

Personal WhatsApp via **Linked Devices** (same approach as [OpenClaw](https://docs.openclaw.ai/channels/whatsapp)). This is **not** the official WhatsApp Business API. Meta may restrict accounts that use unofficial clients.

## What Nawab does

- **Allowlist only**: only CRM contacts with **Allow WhatsApp** enabled and a valid phone are synced to the bridge. Other chats are dropped in memory — never stored in SQLite or vector memory.
- **Approval only**: every outbound message requires your explicit approval (Telegram Approve/Reject or dashboard manual send). `AUTO_APPROVE` and `autonomous` autonomy do **not** bypass this for WhatsApp.

## Setup

### 1. Environment

In `.env`:

```env
WHATSAPP_ENABLED=true
WHATSAPP_BRIDGE_URL=http://127.0.0.1:3100
WHATSAPP_BRIDGE_SECRET=<long-random-string>
WHATSAPP_ALWAYS_REQUIRE_APPROVAL=true
```

Use the **same** `WHATSAPP_BRIDGE_SECRET` for the bridge process.

### 2. Start the bridge (Node 20+)

```bash
cd services/whatsapp-bridge
npm install
export WHATSAPP_BRIDGE_SECRET=<same-as-env>
export WHATSAPP_SESSION_DIR=../../data/whatsapp-session
npm start
```

The bridge binds `127.0.0.1:3100` only — not exposed publicly.

### 3. Link WhatsApp

1. Open Nawab **Settings → WhatsApp**
2. Scan the QR with your phone: WhatsApp → Linked devices → Link a device
3. In **CRM**, add contacts with a **phone** number and enable **Allow WhatsApp**

### 4. EC2 (systemd)

Copy `deploy/aws/nawab-whatsapp-bridge.service` to `/etc/systemd/system/`, set `Environment=WHATSAPP_BRIDGE_SECRET=...`, then:

```bash
sudo systemctl enable --now nawab-whatsapp-bridge
```

## Architecture

```
WhatsApp ↔ Baileys bridge (Node) ↔ integrations/whatsapp.py ↔ CRM / reply loop / agent tools
```

Allowlist is pushed from CRM on contact changes and every 5 minutes. Inbound is polled every minute when enabled.

## Agent tools

- `save_whatsapp_contact` — save phone + enable allowlist
- `send_whatsapp` — always queued for approval
- `list_whatsapp_threads` — recent logged WhatsApp messages
- `check_whatsapp_replies_now` — manual poll + draft replies

## Risks

- Unofficial WhatsApp Web protocol — account restriction possible
- Session may drop — re-scan QR from Settings
- A dedicated phone number (not your main personal line) is recommended when possible
