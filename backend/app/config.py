"""Application configuration and environment settings."""
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Resume Rejection & Improvement Platform"
    API_V1_STR: str = "/api"

    # Base Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    DATABASE_PATH: Path = DATA_DIR / "platform.db"
    UPLOAD_DIR: Path = DATA_DIR / "uploads"
    GENERATED_DIR: Path = DATA_DIR / "generated"

    # Ingestion constraints
    MAX_UPLOAD_BYTES: int = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx"}
    MIN_EXPERIENCE_CHARS: int = 100
    MIN_JOB_DESC_CHARS: int = 50

    # CORS configuration for embedding into existing website
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # AI Provider Settings (Free-first development)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "gemma4:latest"

    # Orchestrator & Rate Limiting
    MAX_RETRIES: int = 3
    BACKOFF_BASE_SECONDS: float = 2.0
    MAX_BACKOFF_SECONDS: float = 30.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def ensure_directories(self) -> None:
        """Create storage directories if they do not exist."""
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.GENERATED_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_directories()
