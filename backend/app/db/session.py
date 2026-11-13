"""Asynchronous SQLite database session manager."""
import aiosqlite
from pathlib import Path
from typing import AsyncGenerator
from app.config import settings


SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


async def init_db() -> None:
    """Initialize database tables from schema.sql."""
    settings.ensure_directories()
    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        await db.executescript(schema_sql)
        await db.commit()


async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    """Yield an async SQLite connection with foreign keys enabled."""
    async with aiosqlite.connect(settings.DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        await db.execute("PRAGMA foreign_keys = ON;")
        yield db
