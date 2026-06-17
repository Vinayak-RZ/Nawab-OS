/**
 * Nawab OS WhatsApp bridge — Baileys linked-device session.
 * Allowlist-filtered inbound; approval-token-gated outbound.
 */
import crypto from "crypto";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import pino from "pino";
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.WHATSAPP_BRIDGE_PORT || "3100", 10);
const HOST = process.env.WHATSAPP_BRIDGE_HOST || "127.0.0.1";
const SECRET = process.env.WHATSAPP_BRIDGE_SECRET || "";
const SESSION_DIR =
  process.env.WHATSAPP_SESSION_DIR ||
  path.resolve(__dirname, "../../data/whatsapp-session");

if (!SECRET) {
  console.error("[whatsapp-bridge] WHATSAPP_BRIDGE_SECRET is required");
  process.exit(1);
}

fs.mkdirSync(SESSION_DIR, { recursive: true });

const logger = pino({ level: process.env.LOG_LEVEL || "warn" });

/** @type {Set<string>} */
const allowlist = new Set();
/** @type {Array<object>} */
const inboundBuffer = [];
const MAX_BUFFER = 500;

let sock = null;
let qrRaw = null;
let connectionState = "close";
let linkedPhone = null;
let starting = false;

function normalizeE164(input) {
  if (!input) return null;
  const digits = String(input).replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return `+${digits}`;
}

function e164FromJid(jid) {
  if (!jid) return null;
  if (jid.endsWith("@g.us")) return null;
  if (jid.includes("broadcast") || jid === "status@broadcast") return null;
  const user = jid.split("@")[0].split(":")[0];
  return normalizeE164(user);
}

function jidFromE164(e164) {
  const n = normalizeE164(e164);
  if (!n) return null;
  return `${n.slice(1)}@s.whatsapp.net`;
}

function messageText(msg) {
  const m = msg.message;
  if (!m) return "";
  if (m.conversation) return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  if (m.imageMessage?.caption) return m.imageMessage.caption;
  if (m.videoMessage?.caption) return m.videoMessage.caption;
  return "";
}

function verifyApprovalToken(token, toE164, body) {
  if (!token) return false;
  const parts = token.split("|");
  if (parts.length !== 4) return false;
  const [to, bodyHash, expiryStr, sig] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (!expiry || Date.now() / 1000 > expiry) return false;
  const normalized = normalizeE164(toE164);
  if (normalizeE164(to) !== normalized) return false;
  const expectedHash = crypto.createHash("sha256").update(body || "").digest("hex").slice(0, 16);
  if (bodyHash !== expectedHash) return false;
  const payload = `${to}|${bodyHash}|${expiryStr}`;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

function authMiddleware(req, res, next) {
  if (req.headers["x-bridge-secret"] !== SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

async function startSocket() {
  if (starting) return;
  starting = true;
  try {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    sock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      keepAliveIntervalMs: 25000,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        qrRaw = qr;
        connectionState = "qr";
      }
      if (connection === "open") {
        connectionState = "open";
        qrRaw = null;
        linkedPhone = sock?.user?.id ? e164FromJid(sock.user.id) : linkedPhone;
        console.log("[whatsapp-bridge] connected", linkedPhone || "");
      }
      if (connection === "close") {
        connectionState = "close";
        const code = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = code !== DisconnectReason.loggedOut;
        console.log("[whatsapp-bridge] disconnected", code, shouldReconnect ? "reconnecting" : "logged out");
        sock = null;
        if (shouldReconnect) {
          setTimeout(() => {
            starting = false;
            startSocket();
          }, 5000);
        }
      }
    });

    sock.ev.on("messages.upsert", ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (msg.key.fromMe) continue;
        const jid = msg.key.remoteJid;
        if (!jid || jid.endsWith("@g.us")) continue;
        if (jid.includes("broadcast") || jid === "status@broadcast") continue;

        const fromE164 = e164FromJid(jid);
        if (!fromE164 || !allowlist.has(fromE164)) continue;

        const text = messageText(msg);
        if (!text) continue;

        const entry = {
          id: msg.key.id || `${jid}|${msg.messageTimestamp}`,
          from_e164: fromE164,
          body: text.slice(0, 4000),
          timestamp: new Date((msg.messageTimestamp || Date.now() / 1000) * 1000).toISOString(),
        };
        inboundBuffer.push(entry);
        if (inboundBuffer.length > MAX_BUFFER) inboundBuffer.shift();
      }
    });
  } catch (e) {
    console.error("[whatsapp-bridge] start failed", e);
    setTimeout(() => {
      starting = false;
      startSocket();
    }, 8000);
  } finally {
    starting = false;
  }
}

const app = express();
app.use(express.json({ limit: "64kb" }));
app.use(authMiddleware);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/status", (_req, res) => {
  res.json({
    connected: connectionState === "open",
    qr_pending: connectionState === "qr" && !!qrRaw,
    linked_phone: linkedPhone,
    allowlist_size: allowlist.size,
  });
});

app.get("/qr", async (_req, res) => {
  if (!qrRaw) {
    return res.json({ qr_pending: false, qr_data_url: null });
  }
  try {
    const dataUrl = await QRCode.toDataURL(qrRaw, { margin: 1, width: 280 });
    res.json({ qr_pending: true, qr_data_url: dataUrl });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/allowlist", (req, res) => {
  const phones = req.body?.phones;
  if (!Array.isArray(phones)) {
    return res.status(400).json({ error: "phones array required" });
  }
  allowlist.clear();
  for (const p of phones) {
    const n = normalizeE164(p);
    if (n) allowlist.add(n);
  }
  res.json({ ok: true, count: allowlist.size });
});

app.get("/messages", (req, res) => {
  const since = req.query.since;
  let msgs = inboundBuffer;
  if (since) {
    msgs = inboundBuffer.filter((m) => m.timestamp > since);
  }
  res.json({ messages: msgs });
});

app.post("/send", async (req, res) => {
  const { to_e164, body } = req.body || {};
  const token = req.headers["x-approval-token"];
  if (!to_e164 || !body) {
    return res.status(400).json({ error: "to_e164 and body required" });
  }
  const normalized = normalizeE164(to_e164);
  if (!normalized || !allowlist.has(normalized)) {
    return res.status(403).json({ error: "recipient not on allowlist" });
  }
  if (!verifyApprovalToken(token, normalized, body)) {
    return res.status(403).json({ error: "valid approval token required" });
  }
  if (!sock || connectionState !== "open") {
    return res.status(503).json({ error: "whatsapp not connected" });
  }
  const jid = jidFromE164(normalized);
  try {
    const sent = await sock.sendMessage(jid, { text: body });
    res.json({ success: true, message_id: sent?.key?.id });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`[whatsapp-bridge] listening on http://${HOST}:${PORT}`);
  startSocket();
});
