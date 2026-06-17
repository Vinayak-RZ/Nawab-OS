"""Standalone APScheduler process for production (separate from Gunicorn workers)."""
from __future__ import annotations

import asyncio
import logging
import sys

from memory.paths import ensure_data_dirs, subpath


def main() -> None:
    ensure_data_dirs()
    log_file = subpath("logs", "scheduler.log")
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(log_file, encoding="utf-8"),
        ],
    )
    from scheduler.jobs import start_scheduler

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    start_scheduler(None)
    logging.getLogger(__name__).info("Scheduler started (standalone)")
    loop.run_forever()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
