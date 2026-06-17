"""E.164 phone normalization for CRM and WhatsApp allowlist."""
import os
import re
from typing import Optional

_DEFAULT_REGION = (os.getenv("WHATSAPP_DEFAULT_REGION") or "GB").upper()

# Strip everything except digits and leading +
_NON_DIGIT = re.compile(r"[^\d+]")


def normalize_phone(raw: str, default_region: str = None) -> Optional[str]:
    """Return E.164 (+digits) or None if invalid."""
    if not raw or not str(raw).strip():
        return None
    s = _NON_DIGIT.sub("", str(raw).strip())
    if not s:
        return None

    if s.startswith("+"):
        digits = s[1:]
    elif s.startswith("00"):
        digits = s[2:]
    else:
        region = (default_region or _DEFAULT_REGION).upper()
        if s.startswith("0") and region == "GB":
            digits = "44" + s[1:]
        else:
            digits = s

    digits = re.sub(r"\D", "", digits)
    if len(digits) < 10 or len(digits) > 15:
        return None
    return f"+{digits}"


def phones_match(a: str, b: str) -> bool:
    na = normalize_phone(a)
    nb = normalize_phone(b)
    return bool(na and nb and na == nb)
