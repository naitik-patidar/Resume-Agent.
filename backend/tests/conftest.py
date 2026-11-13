"""Pytest fixtures for testing FastAPI backend and SQLite database."""
import asyncio
import os
import tempfile
from pathlib import Path
import pytest
import pytest_asyncio
import aiosqlite
from httpx import AsyncClient, ASGITransport

from app.config import settings
from app.db.session import init_db
from app.main import app


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_test_db(tmp_path: Path):
    """Use a temporary database file for test isolation."""
    test_db = tmp_path / "test_platform.db"
    test_uploads = tmp_path / "uploads"
    test_generated = tmp_path / "generated"

    settings.DATABASE_PATH = test_db
    settings.DATA_DIR = tmp_path
    settings.UPLOAD_DIR = test_uploads
    settings.GENERATED_DIR = test_generated
    settings.ensure_directories()

    await init_db()
    yield
    # Cleanup
    if test_db.exists():
        test_db.unlink(missing_ok=True)


@pytest_asyncio.fixture
async def client():
    """Async HTTP test client bound to FastAPI application."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
