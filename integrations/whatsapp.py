"""WhatsApp bridge client — talks to the local Baileys sidecar.

Inbound is allowlist-filtered at the bridge; Python re-checks before any DB write.
Outbound requires a short-lived HMAC approval token (or dashboard user session).
"""
import hashlib
import hmac
import logging
import time
from typing import Optional

import requests

from config import config
from integrations.phone import normalize_phone
from memory.sql_store import get_whatsapp_allowlist, match_contact_by_phone

logger = logging.getLogger(__name__)

_BRIDGE_TIMEOUT = 12


def is_configured() -> bool:
    return bool(
        config.whatsapp_enabled
        and config.whatsapp_bridge_url
        and config.whatsapp_bridge_secret
    )


def _headers(extra: dict = None) -> dict:
    h = {"X-Bridge-Secret": config.whatsapp_bridge_secret}
    if extra:
        h.update(extra)
    return h


def _get(path: str, params: dict = None) -> dict:
    if not is_configured():
        return {"error": "WhatsApp not configured"}
    try:
        r = requests.get(
            f"{config.whatsapp_bridge_url}{path}",
            headers=_headers(),
            params=params or {},
            timeout=_BRIDGE_TIMEOUT,
        )
        r.raise_for_status()
        return r.json()
    except Exception as e:
        logger.warning(f"[whatsapp] GET {path} failed: {e}")
        return {"error": str(e)}


def _post(path: str, payload: dict, extra_headers: dict = None) -> dict:
    if not is_configured():
        return {"error": "WhatsApp not configured"}
    try:
        r = requests.post(
            f"{config.whatsapp_bridge_url}{path}",
            json=payload,
            headers=_headers(extra_headers),
            timeout=_BRIDGE_TIMEOUT,
        )
        r.raise_for_status()
        return r.json()
    except Exception as e:
        logger.warning(f"[whatsapp] POST {path} failed: {e}")
        return {"error": str(e)}


def get_status() -> dict:
    data = _get("/status")
    if "error" not in data:
        data["allowlist_count"] = len(get_whatsapp_allowlist())
    return data


def get_qr() -> dict:
    return _get("/qr")


def sync_allowlist_to_bridge() -> dict:
    phones = []
    for c in get_whatsapp_allowlist():
        p = normalize_phone(c.get("phone") or "")
        if p:
            phones.append(p)
    return _post("/allowlist", {"phones": phones})


def fetch_inbound(since: str = None) -> list:
    params = {}
    if since:
        params["since"] = since
    data = _get("/messages", params)
    if data.get("error"):
        return [{"error": data["error"]}]
    msgs = data.get("messages") or []
    out = []
    for m in msgs:
        from_e164 = normalize_phone(m.get("from_e164") or "")
        if not from_e164 or not is_allowlisted(from_e164):
            continue
        out.append(m)
    return out


def is_allowlisted(e164: str) -> bool:
    return match_contact_by_phone(e164) is not None


def mint_send_token(to_e164: str, body: str, ttl_sec: int = 120) -> str:
    """HMAC token the bridge verifies before sending."""
    secret = config.whatsapp_bridge_secret.encode()
    to_e164 = normalize_phone(to_e164) or to_e164
    body_hash = hashlib.sha256((body or "").encode()).hexdigest()[:16]
    expiry = int(time.time()) + ttl_sec
    payload = f"{to_e164}|{body_hash}|{expiry}"
    sig = hmac.new(secret, payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}|{sig}"


def send_message(to_e164: str, body: str, approval_token: str = None) -> dict:
    to_e164 = normalize_phone(to_e164)
    if not to_e164:
        return {"success": False, "error": "Invalid phone number"}
    if not is_allowlisted(to_e164):
        return {"success": False, "error": "Number not on WhatsApp allowlist"}
    token = approval_token or mint_send_token(to_e164, body)
    return _post(
        "/send",
        {"to_e164": to_e164, "body": body},
        extra_headers={"X-Approval-Token": token},
    )


def resolve_recipient(to: str) -> Optional[str]:
    """E.164 or CRM contact name → E.164 if allowlisted."""
    raw = (to or "").strip()
    if not raw:
        return None
    if raw.startswith("+") or raw.isdigit():
        e164 = normalize_phone(raw)
        return e164 if e164 and is_allowlisted(e164) else None
    from memory.sql_store import search_contacts
    for c in search_contacts(raw):
        if c.get("whatsapp_enabled") and c.get("phone"):
            if raw.lower() in (c.get("name") or "").lower():
                return normalize_phone(c["phone"])
    return None
