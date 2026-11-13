"""Asynchronous SQLite database session manager."""
import aiosqlite
from pathlib import Path
from typing import AsyncGenerator
from app.config import settings


SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


async def init_db() -> None:
    """Initialize database tables from schema.sql and apply safe migrations."""
    settings.ensure_directories()
    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        await db.executescript(schema_sql)
        for col, col_type in [
            ("llm_provider", "TEXT"),
            ("llm_model", "TEXT"),
            ("api_key_override", "TEXT"),
        ]:
            try:
                await db.execute(f"ALTER TABLE audit_sessions ADD COLUMN {col} {col_type};")
            except Exception:
                pass
        await db.commit()


async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    """Yield an async SQLite connection with foreign keys enabled."""
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.execute("PRAGMA foreign_keys = ON;")
        yield db
