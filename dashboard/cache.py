"""In-process TTL cache for expensive read-only API payloads (per Gunicorn worker)."""
from __future__ import annotations

import threading
import time
from typing import Any, Callable

_lock = threading.Lock()
_store: dict[str, tuple[float, Any]] = {}


def get(key: str, ttl: float, factory: Callable[[], Any]) -> Any:
    """Return cached value for key or call factory and cache for ttl seconds."""
    now = time.monotonic()
    with _lock:
        hit = _store.get(key)
        if hit is not None and now - hit[0] < ttl:
            return hit[1]
    value = factory()
    with _lock:
        _store[key] = (now, value)
    return value


def invalidate(prefix: str = "") -> None:
    with _lock:
        if not prefix:
            _store.clear()
            return
        for key in list(_store):
            if key.startswith(prefix):
                del _store[key]
