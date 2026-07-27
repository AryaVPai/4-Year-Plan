import sqlite3
import datetime
from contextlib import contextmanager

DB_PATH = "plans.db"


def init_db():
    """Run once at startup — creates tables if they don't exist."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                created_at TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS plans_cache (
                cache_key TEXT PRIMARY KEY,
                college TEXT,
                location TEXT,
                major TEXT,
                concentration TEXT,
                plan_text TEXT,
                created_at TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS saved_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_identifier TEXT,
                college TEXT,
                location TEXT,
                major TEXT,
                concentration TEXT,
                plan_text TEXT,
                created_at TEXT,
                updated_at TEXT
            )
        """)
        conn.commit()


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
    finally:
        conn.close()


def make_cache_key(college: str, location: str, major: str, concentration: str = None) -> str:
    """
    Location is part of the cache key — Purdue West Lafayette and Purdue Indianapolis
    must never share a cached plan, since their requirements can differ.
    """
    parts = [college.strip().lower(), location.strip().lower(), major.strip().lower()]
    if concentration:
        parts.append(concentration.strip().lower())
    return ":".join(parts)


# ───────────────────────────────
# Users
# ───────────────────────────────

def create_user(first_name: str, last_name: str, email: str, username: str, hashed_password: str) -> bool:
    now = datetime.datetime.now().isoformat()
    with get_db() as conn:
        try:
            conn.execute(
                """INSERT INTO users (first_name, last_name, email, username, hashed_password, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (first_name, last_name, email, username, hashed_password, now)
            )
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False  # username or email already taken


def get_user_by_username(username: str):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, first_name, last_name, email, username, hashed_password FROM users WHERE username = ?",
            (username,)
        ).fetchone()
    if not row:
        return None
    return {
        "id": row[0],
        "first_name": row[1],
        "last_name": row[2],
        "email": row[3],
        "username": row[4],
        "hashed_password": row[5],
    }


# ───────────────────────────────
# Cache (shared across ALL users)
# ───────────────────────────────

def get_cached_plan(college: str, location: str, major: str, concentration: str = None, max_age_days: int = 90):
    """Returns the cached plan text if one exists and isn't stale, else None."""
    key = make_cache_key(college, location, major, concentration)
    with get_db() as conn:
        row = conn.execute(
            "SELECT plan_text, created_at FROM plans_cache WHERE cache_key = ?", (key,)
        ).fetchone()

    if not row:
        return None

    plan_text, created_at = row
    created = datetime.datetime.fromisoformat(created_at)
    age_days = (datetime.datetime.now() - created).days

    if age_days > max_age_days:
        return None  # stale — caller should regenerate

    return plan_text


def save_cached_plan(college: str, location: str, major: str, concentration: str, plan_text: str):
    key = make_cache_key(college, location, major, concentration)
    now = datetime.datetime.now().isoformat()
    with get_db() as conn:
        conn.execute(
            """INSERT INTO plans_cache (cache_key, college, location, major, concentration, plan_text, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(cache_key) DO UPDATE SET plan_text=excluded.plan_text, created_at=excluded.created_at""",
            (key, college, location, major, concentration, plan_text, now),
        )
        conn.commit()


# ───────────────────────────────
# Saved plans (per user)
# ───────────────────────────────

def save_user_plan(user_identifier: str, college: str, location: str, major: str, concentration: str, plan_text: str) -> int:
    now = datetime.datetime.now().isoformat()
    with get_db() as conn:
        cursor = conn.execute(
            """INSERT INTO saved_plans (user_identifier, college, location, major, concentration, plan_text, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_identifier, college, location, major, concentration, plan_text, now, now),
        )
        conn.commit()
        return cursor.lastrowid


def update_user_plan(plan_id: int, plan_text: str):
    now = datetime.datetime.now().isoformat()
    with get_db() as conn:
        conn.execute(
            "UPDATE saved_plans SET plan_text = ?, updated_at = ? WHERE id = ?",
            (plan_text, now, plan_id),
        )
        conn.commit()


def get_user_plans(user_identifier: str):
    with get_db() as conn:
        rows = conn.execute(
            """SELECT id, college, location, major, concentration, plan_text, updated_at
               FROM saved_plans WHERE user_identifier = ? ORDER BY updated_at DESC""",
            (user_identifier,),
        ).fetchall()

    return [
        {
            "id": r[0],
            "college": r[1],
            "location": r[2],
            "major": r[3],
            "concentration": r[4],
            "plan_text": r[5],
            "updated_at": r[6],
        }
        for r in rows
    ]


def get_user_plan_by_id(plan_id: int):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, college, location, major, concentration, plan_text FROM saved_plans WHERE id = ?",
            (plan_id,),
        ).fetchone()

    if not row:
        return None
    return {
        "id": row[0],
        "college": row[1],
        "location": row[2],
        "major": row[3],
        "concentration": row[4],
        "plan_text": row[5],
    }