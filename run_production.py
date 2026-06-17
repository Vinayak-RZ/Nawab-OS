"""Production entrypoint — Gunicorn only (scheduler runs as separate systemd unit)."""
from __future__ import annotations

import os
import sys


def main() -> None:
    from memory.paths import ensure_data_dirs
    from dashboard.startup_checks import run_startup_checks

    ensure_data_dirs()
    run_startup_checks()

    host = os.getenv("WEB_HOST", "127.0.0.1")
    port = os.getenv("DASHBOARD_PORT", "8787")
    workers = os.getenv("GUNICORN_WORKERS", "2")
    threads = os.getenv("GUNICORN_THREADS", "4")
    worker_class = os.getenv("GUNICORN_WORKER_CLASS", "gthread")
    timeout = os.getenv("GUNICORN_TIMEOUT", "120")

    gunicorn = os.path.join(os.path.dirname(sys.executable), "gunicorn")
    if not os.path.isfile(gunicorn):
        raise FileNotFoundError("gunicorn")

    # Gunicorn replaces the current process (use venv binary, not PATH)
    os.execv(
        gunicorn,
        [
            gunicorn,
            "dashboard.app:app",
            f"--bind={host}:{port}",
            f"--workers={workers}",
            f"--worker-class={worker_class}",
            f"--threads={threads}",
            f"--timeout={timeout}",
            "--access-logfile=-",
            "--error-logfile=-",
            "--capture-output",
        ],
    )


if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError:
        print("gunicorn not found — run: pip install gunicorn", file=sys.stderr)
        sys.exit(1)
