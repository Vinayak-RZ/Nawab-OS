import sqlite3
import os
import threading
from datetime import datetime, timedelta
from typing import Optional

# DB path is env-overridable so tests (and alternate deployments) can point at an
# isolated database instead of the live one.
DB_PATH = os.getenv("FOUNDER_OS_DB", "./data/founder_os.db")
os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)

_local = threading.local()


def _open_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA busy_timeout=5000")
    return conn


def get_conn():
    conn = getattr(_local, "conn", None)
    if conn is not None:
        try:
            conn.execute("SELECT 1")
        except sqlite3.ProgrammingError:
            conn = None
    if conn is None:
        conn = _open_conn()
        _local.conn = conn
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()

    c.executescript("""
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT,
        role TEXT,
        email TEXT,
        linkedin_url TEXT,
        phone TEXT,
        source TEXT,
        status TEXT DEFAULT 'prospect',
        priority INTEGER DEFAULT 3,
        notes TEXT,
        last_contacted_at TIMESTAMP,
        next_followup_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS outreach_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER REFERENCES contacts(id),
        channel TEXT,
        direction TEXT,
        subject TEXT,
        body TEXT,
        status TEXT DEFAULT 'sent',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        website TEXT,
        industry TEXT,
        size TEXT,
        location TEXT,
        description TEXT,
        research_summary TEXT,
        icp_score INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority INTEGER DEFAULT 3,
        due_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        tags TEXT,
        linked_contact_id INTEGER REFERENCES contacts(id),
        linked_company_id INTEGER REFERENCES companies(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
    _migrate_contacts(conn)
    _migrate_companies(conn)
    _migrate_outreach(conn)
    conn.close()


def _migrate_contacts(conn=None):
    own = conn is None
    if own:
        conn = get_conn()
    for stmt in (
        "ALTER TABLE contacts ADD COLUMN whatsapp_enabled INTEGER DEFAULT 0",
        "ALTER TABLE contacts ADD COLUMN company_id INTEGER REFERENCES companies(id)",
    ):
        try:
            conn.execute(stmt)
        except Exception:
            pass
    if own:
        conn.commit()
    _backfill_contact_company_ids(conn)
    if own:
        conn.close()


def _migrate_companies(conn=None):
    own = conn is None
    if own:
        conn = get_conn()
    for stmt in (
        "ALTER TABLE companies ADD COLUMN world_id TEXT",
        "ALTER TABLE companies ADD COLUMN sector TEXT",
        "ALTER TABLE companies ADD COLUMN linkedin_url TEXT",
        "ALTER TABLE companies ADD COLUMN status TEXT DEFAULT 'prospect'",
        "ALTER TABLE companies ADD COLUMN last_contacted_at TIMESTAMP",
    ):
        try:
            conn.execute(stmt)
        except Exception:
            pass
    if own:
        conn.commit()
        conn.close()


def _migrate_outreach(conn=None):
    own = conn is None
    if own:
        conn = get_conn()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS outreach_campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id TEXT NOT NULL,
        name TEXT NOT NULL,
        batch_size INTEGER DEFAULT 5,
        brief TEXT DEFAULT '',
        status TEXT DEFAULT 'created',
        strategy_json TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS outreach_campaign_companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL REFERENCES outreach_campaigns(id),
        company_id INTEGER NOT NULL REFERENCES companies(id),
        sort_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        research_json TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(campaign_id, company_id)
    );
    CREATE TABLE IF NOT EXISTS outreach_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL REFERENCES outreach_campaigns(id),
        company_id INTEGER NOT NULL REFERENCES companies(id),
        contact_id INTEGER REFERENCES contacts(id),
        channel TEXT NOT NULL,
        subject TEXT DEFAULT '',
        body TEXT DEFAULT '',
        status TEXT DEFAULT 'draft',
        personalization_notes TEXT DEFAULT '',
        error_message TEXT DEFAULT '',
        outreach_log_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    for stmt in (
        "ALTER TABLE outreach_log ADD COLUMN campaign_id INTEGER",
        "ALTER TABLE outreach_campaigns ADD COLUMN dossier_path TEXT DEFAULT ''",
        "ALTER TABLE outreach_campaigns ADD COLUMN template_json TEXT DEFAULT ''",
        "ALTER TABLE outreach_campaigns ADD COLUMN dossier_doc_id INTEGER",
    ):
        try:
            conn.execute(stmt)
        except Exception:
            pass
    if own:
        conn.commit()
        conn.close()


def _backfill_contact_company_ids(conn):
    """Match contacts.company text to companies.name when company_id is unset."""
    rows = conn.execute(
        "SELECT id, company FROM contacts WHERE company_id IS NULL AND company IS NOT NULL AND company != ''"
    ).fetchall()
    for row in rows:
        match = conn.execute(
            "SELECT id FROM companies WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1",
            (row["company"],),
        ).fetchone()
        if match:
            conn.execute("UPDATE contacts SET company_id = ? WHERE id = ?", (match["id"], row["id"]))
    conn.commit()


# ── CONTACTS ─────────────────────────────────────────────────────────────────

def add_contact(name, company=None, role=None, email=None, linkedin_url=None,
                phone=None, source=None, status="prospect", priority=3, notes=None,
                whatsapp_enabled: int = 0, company_id: int = None) -> int:
    from integrations.phone import normalize_phone
    phone = normalize_phone(phone) if phone else None
    wa = 1 if whatsapp_enabled and phone else 0
    if company_id:
        co = get_company(int(company_id))
        if co and not company:
            company = co.get("name")
    conn = get_conn()
    c = conn.cursor()
    c.execute("""INSERT INTO contacts (name, company, company_id, role, email, linkedin_url, phone, source,
                 status, priority, notes, whatsapp_enabled)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
              (name, company, company_id, role, email, linkedin_url, phone, source, status, priority, notes, wa))
    conn.commit()
    contact_id = c.lastrowid
    conn.close()
    return contact_id

def update_contact(contact_id: int, **kwargs):
    if "phone" in kwargs and kwargs["phone"]:
        from integrations.phone import normalize_phone
        kwargs["phone"] = normalize_phone(kwargs["phone"])
    if "whatsapp_enabled" in kwargs:
        kwargs["whatsapp_enabled"] = 1 if kwargs["whatsapp_enabled"] else 0
        if kwargs["whatsapp_enabled"]:
            row = get_contact(contact_id)
            if not row or not row.get("phone"):
                kwargs["whatsapp_enabled"] = 0
    if "company_id" in kwargs and kwargs["company_id"]:
        co = get_company(int(kwargs["company_id"]))
        if co:
            kwargs.setdefault("company", co.get("name"))
    kwargs["updated_at"] = datetime.now().isoformat()
    conn = get_conn()
    sets = ", ".join(f"{k} = ?" for k in kwargs)
    conn.execute(f"UPDATE contacts SET {sets} WHERE id = ?", (*kwargs.values(), contact_id))
    conn.commit()
    conn.close()

def get_contact(contact_id: int) -> Optional[dict]:
    conn = get_conn()
    row = conn.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def search_contacts(query: str) -> list:
    conn = get_conn()
    q = f"%{query}%"
    rows = conn.execute(
        "SELECT * FROM contacts WHERE name LIKE ? OR company LIKE ? OR role LIKE ? OR email LIKE ? ORDER BY updated_at DESC",
        (q, q, q, q)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_contacts_needing_followup() -> list:
    conn = get_conn()
    now = datetime.now().isoformat()
    rows = conn.execute(
        "SELECT * FROM contacts WHERE next_followup_at <= ? AND status NOT IN ('closed', 'dead') ORDER BY next_followup_at ASC",
        (now,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_pipeline_summary() -> dict:
    conn = get_conn()
    rows = conn.execute("SELECT status, COUNT(*) as count FROM contacts GROUP BY status").fetchall()
    conn.close()
    return {r["status"]: r["count"] for r in rows}

def get_all_contacts() -> list:
    conn = get_conn()
    rows = conn.execute("SELECT * FROM contacts ORDER BY updated_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_whatsapp_allowlist() -> list:
    """CRM contacts explicitly allowed for WhatsApp read/write."""
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM contacts WHERE whatsapp_enabled = 1 AND phone IS NOT NULL AND phone != ''"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def match_contact_by_phone(e164: str) -> Optional[dict]:
    from integrations.phone import normalize_phone, phones_match
    target = normalize_phone(e164)
    if not target:
        return None
    for c in get_whatsapp_allowlist():
        if phones_match(c.get("phone") or "", target):
            return c
    return None


def get_outreach_for_contact(contact_id: int, channel: str = None, limit: int = 50) -> list:
    conn = get_conn()
    if channel:
        rows = conn.execute(
            """SELECT * FROM outreach_log WHERE contact_id = ? AND channel = ?
               ORDER BY sent_at DESC LIMIT ?""",
            (contact_id, channel, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM outreach_log WHERE contact_id = ? ORDER BY sent_at DESC LIMIT ?",
            (contact_id, limit),
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ── OUTREACH LOG ──────────────────────────────────────────────────────────────

def log_outreach(contact_id: int, channel: str, direction: str,
                 subject: str = None, body: str = None, status: str = "sent",
                 campaign_id: int = None) -> int:
    conn = get_conn()
    c = conn.cursor()
    c.execute("""INSERT INTO outreach_log (contact_id, channel, direction, subject, body, status, sent_at, campaign_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
              (contact_id, channel, direction, subject, body, status, datetime.now().isoformat(), campaign_id))
    conn.commit()
    log_id = c.lastrowid
    conn.close()
    return log_id

def get_recent_outreach(days: int = 7) -> list:
    conn = get_conn()
    cutoff = (datetime.now() - timedelta(days=days)).isoformat()
    rows = conn.execute(
        """SELECT ol.*, c.name as contact_name, c.company
           FROM outreach_log ol
           LEFT JOIN contacts c ON ol.contact_id = c.id
           WHERE ol.sent_at >= ?
           ORDER BY ol.sent_at DESC""",
        (cutoff,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ── COMPANIES ─────────────────────────────────────────────────────────────────

COMPANY_STATUSES = ("prospect", "contacted", "responded", "meeting_set", "closed", "dead")


def add_company(name, website=None, industry=None, size=None, location=None,
                description=None, research_summary=None, icp_score=None, notes=None,
                world_id=None, sector=None, linkedin_url=None, status="prospect") -> int:
    conn = get_conn()
    c = conn.cursor()
    c.execute("""INSERT INTO companies (
        name, website, industry, size, location, description, research_summary, icp_score, notes,
        world_id, sector, linkedin_url, status, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
              (name, website, industry, size, location, description, research_summary, icp_score, notes,
               world_id, sector or industry, linkedin_url, status or "prospect", datetime.now().isoformat()))
    conn.commit()
    company_id = c.lastrowid
    conn.close()
    return company_id


def get_company(company_id: int) -> Optional[dict]:
    conn = get_conn()
    row = conn.execute("SELECT * FROM companies WHERE id = ?", (company_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def update_company(company_id: int, **kwargs):
    allowed = {
        "name", "website", "industry", "size", "location", "description", "research_summary",
        "icp_score", "notes", "world_id", "sector", "linkedin_url", "status", "last_contacted_at",
    }
    payload = {k: v for k, v in kwargs.items() if k in allowed}
    if not payload:
        return
    if "sector" in payload and payload["sector"] and "industry" not in payload:
        payload["industry"] = payload["sector"]
    payload["updated_at"] = datetime.now().isoformat()
    conn = get_conn()
    sets = ", ".join(f"{k} = ?" for k in payload)
    conn.execute(f"UPDATE companies SET {sets} WHERE id = ?", (*payload.values(), company_id))
    conn.commit()
    conn.close()


def get_all_companies(world_id: str = None, status: str = None, sector: str = None,
                      include_unassigned: bool = True) -> list:
    conn = get_conn()
    q = "SELECT * FROM companies WHERE 1=1"
    params: list = []
    if world_id:
        if include_unassigned:
            q += " AND (world_id = ? OR world_id IS NULL OR world_id = '')"
        else:
            q += " AND world_id = ?"
        params.append(world_id)
    if status:
        q += " AND status = ?"
        params.append(status)
    if sector:
        q += " AND (sector = ? OR industry = ?)"
        params.extend([sector, sector])
    q += " ORDER BY updated_at DESC"
    rows = conn.execute(q, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def count_unlinked_contact_companies() -> int:
    """Contacts with company text but no company_id FK."""
    conn = get_conn()
    row = conn.execute(
        """SELECT COUNT(DISTINCT LOWER(TRIM(company))) AS n FROM contacts
           WHERE company_id IS NULL AND company IS NOT NULL AND TRIM(company) != ''"""
    ).fetchone()
    conn.close()
    return int(row["n"]) if row else 0


def import_companies_from_contacts(world_id: str = None) -> dict:
    """Create company rows from unique contact.company text and link contacts."""
    conn = get_conn()
    rows = conn.execute(
        """SELECT company, COUNT(*) AS n FROM contacts
           WHERE company_id IS NULL AND company IS NOT NULL AND TRIM(company) != ''
           GROUP BY LOWER(TRIM(company)), company"""
    ).fetchall()
    created = 0
    linked = 0
    now = datetime.now().isoformat()
    for row in rows:
        name = (row["company"] or "").strip()
        if not name:
            continue
        existing = conn.execute(
            "SELECT id FROM companies WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1",
            (name,),
        ).fetchone()
        if existing:
            co_id = existing["id"]
        else:
            cur = conn.execute(
                """INSERT INTO companies (name, world_id, status, updated_at, created_at)
                   VALUES (?, ?, 'prospect', ?, ?)""",
                (name, world_id, now, now),
            )
            co_id = cur.lastrowid
            created += 1
        updated = conn.execute(
            """UPDATE contacts SET company_id = ?, updated_at = ?
               WHERE company_id IS NULL AND LOWER(TRIM(company)) = LOWER(TRIM(?))""",
            (co_id, now, name),
        ).rowcount
        linked += updated
    conn.commit()
    conn.close()
    return {"created": created, "linked_contacts": linked}


def get_company_contacts(company_id: int) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM contacts WHERE company_id = ? ORDER BY updated_at DESC",
        (company_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def company_contact_counts() -> dict:
    conn = get_conn()
    rows = conn.execute(
        "SELECT company_id, COUNT(*) as n FROM contacts WHERE company_id IS NOT NULL GROUP BY company_id"
    ).fetchall()
    conn.close()
    return {r["company_id"]: r["n"] for r in rows}


def search_companies(query: str) -> list:
    conn = get_conn()
    q = f"%{query}%"
    rows = conn.execute(
        "SELECT * FROM companies WHERE name LIKE ? OR industry LIKE ? OR sector LIKE ? ORDER BY updated_at DESC",
        (q, q, q)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── OUTREACH CAMPAIGNS ────────────────────────────────────────────────────────

def create_campaign(world_id: str, name: str, company_ids: list, batch_size: int, brief: str = "") -> int:
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.now().isoformat()
    cur.execute(
        """INSERT INTO outreach_campaigns (world_id, name, batch_size, brief, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'created', ?, ?)""",
        (world_id, name, batch_size, brief or "", now, now),
    )
    campaign_id = cur.lastrowid
    for i, cid in enumerate(company_ids):
        cur.execute(
            """INSERT INTO outreach_campaign_companies (campaign_id, company_id, sort_order, status, created_at, updated_at)
               VALUES (?, ?, ?, 'pending', ?, ?)""",
            (campaign_id, int(cid), i, now, now),
        )
    conn.commit()
    conn.close()
    return campaign_id


def get_campaign(campaign_id: int) -> Optional[dict]:
    conn = get_conn()
    row = conn.execute("SELECT * FROM outreach_campaigns WHERE id = ?", (campaign_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def list_campaigns(world_id: str = None, limit: int = 30) -> list:
    conn = get_conn()
    if world_id:
        rows = conn.execute(
            "SELECT * FROM outreach_campaigns WHERE world_id = ? ORDER BY created_at DESC LIMIT ?",
            (world_id, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM outreach_campaigns ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_campaign(campaign_id: int, **kwargs):
    allowed = {"name", "brief", "status", "strategy_json", "batch_size", "dossier_path", "template_json", "dossier_doc_id"}
    payload = {k: v for k, v in kwargs.items() if k in allowed}
    if not payload:
        return
    payload["updated_at"] = datetime.now().isoformat()
    conn = get_conn()
    sets = ", ".join(f"{k} = ?" for k in payload)
    conn.execute(f"UPDATE outreach_campaigns SET {sets} WHERE id = ?", (*payload.values(), campaign_id))
    conn.commit()
    conn.close()


def get_campaign_companies(campaign_id: int) -> list:
    conn = get_conn()
    rows = conn.execute(
        """SELECT cc.*, c.name as company_name, c.sector, c.status as company_status,
                  c.research_summary, c.website, c.world_id
           FROM outreach_campaign_companies cc
           JOIN companies c ON cc.company_id = c.id
           WHERE cc.campaign_id = ?
           ORDER BY cc.sort_order ASC, cc.id ASC""",
        (campaign_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_campaign_company(cc_id: int, **kwargs):
    allowed = {"status", "research_json", "sort_order"}
    payload = {k: v for k, v in kwargs.items() if k in allowed}
    if not payload:
        return
    payload["updated_at"] = datetime.now().isoformat()
    conn = get_conn()
    sets = ", ".join(f"{k} = ?" for k in payload)
    conn.execute(f"UPDATE outreach_campaign_companies SET {sets} WHERE id = ?", (*payload.values(), cc_id))
    conn.commit()
    conn.close()


def create_outreach_draft(campaign_id: int, company_id: int, contact_id: int, channel: str,
                          subject: str = "", body: str = "", personalization_notes: str = "",
                          status: str = "draft") -> int:
    conn = get_conn()
    cur = conn.cursor()
    now = datetime.now().isoformat()
    cur.execute(
        """INSERT INTO outreach_drafts
           (campaign_id, company_id, contact_id, channel, subject, body, status,
            personalization_notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (campaign_id, company_id, contact_id, channel, subject or "", body or "", status,
         personalization_notes or "", now, now),
    )
    conn.commit()
    draft_id = cur.lastrowid
    conn.close()
    return draft_id


def get_draft(draft_id: int) -> Optional[dict]:
    conn = get_conn()
    row = conn.execute("SELECT * FROM outreach_drafts WHERE id = ?", (draft_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def list_campaign_drafts(campaign_id: int, company_id: int = None) -> list:
    conn = get_conn()
    if company_id:
        rows = conn.execute(
            """SELECT d.*, c.name as contact_name, c.email, c.phone, c.whatsapp_enabled,
                      co.name as company_name
               FROM outreach_drafts d
               LEFT JOIN contacts c ON d.contact_id = c.id
               LEFT JOIN companies co ON d.company_id = co.id
               WHERE d.campaign_id = ? AND d.company_id = ?
               ORDER BY d.id ASC""",
            (campaign_id, company_id),
        ).fetchall()
    else:
        rows = conn.execute(
            """SELECT d.*, c.name as contact_name, c.email, c.phone, c.whatsapp_enabled,
                      co.name as company_name
               FROM outreach_drafts d
               LEFT JOIN contacts c ON d.contact_id = c.id
               LEFT JOIN companies co ON d.company_id = co.id
               WHERE d.campaign_id = ?
               ORDER BY d.company_id, d.id ASC""",
            (campaign_id,),
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_draft(draft_id: int, **kwargs):
    allowed = {
        "subject", "body", "status", "personalization_notes", "error_message", "outreach_log_id",
    }
    payload = {k: v for k, v in kwargs.items() if k in allowed}
    if not payload:
        return
    payload["updated_at"] = datetime.now().isoformat()
    conn = get_conn()
    sets = ", ".join(f"{k} = ?" for k in payload)
    conn.execute(f"UPDATE outreach_drafts SET {sets} WHERE id = ?", (*payload.values(), draft_id))
    conn.commit()
    conn.close()

# ── TASKS ─────────────────────────────────────────────────────────────────────

def add_task(title: str, description: str = None, priority: int = 3, due_at: str = None) -> int:
    conn = get_conn()
    c = conn.cursor()
    c.execute("INSERT INTO tasks (title, description, priority, due_at) VALUES (?, ?, ?, ?)",
              (title, description, priority, due_at))
    conn.commit()
    task_id = c.lastrowid
    conn.close()
    return task_id

def get_pending_tasks() -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM tasks WHERE status = 'pending' ORDER BY priority ASC, due_at ASC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def complete_task(task_id: int):
    conn = get_conn()
    conn.execute("UPDATE tasks SET status = 'done', completed_at = ? WHERE id = ?",
                 (datetime.now().isoformat(), task_id))
    conn.commit()
    conn.close()

# ── NOTES ─────────────────────────────────────────────────────────────────────

def add_note(content: str, tags: str = None, contact_id: int = None, company_id: int = None) -> int:
    conn = get_conn()
    c = conn.cursor()
    c.execute("INSERT INTO notes (content, tags, linked_contact_id, linked_company_id) VALUES (?, ?, ?, ?)",
              (content, tags, contact_id, company_id))
    conn.commit()
    note_id = c.lastrowid
    conn.close()
    return note_id

def get_recent_notes(limit: int = 20) -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM notes ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Run on import
init_db()
