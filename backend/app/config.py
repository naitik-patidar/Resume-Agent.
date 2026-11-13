import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Resume Rejection & Improvement Platform"
    API_V1_STR: str = "/api"

    # Base Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent

    # Detect Vercel / serverless read-only filesystem
    IS_SERVERLESS: bool = (
        os.environ.get("VERCEL") == "1"
        or os.environ.get("VERCEL_ENV") is not None
        or os.environ.get("AWS_LAMBDA_FUNCTION_NAME") is not None
    )

    DATA_DIR: Path = Path("/tmp/platform_data") if IS_SERVERLESS else BASE_DIR / "data"
    DATABASE_PATH: Path = DATA_DIR / "platform.db"
    UPLOAD_DIR: Path = DATA_DIR / "uploads"
    GENERATED_DIR: Path = DATA_DIR / "generated"

    # Ingestion constraints
    MAX_UPLOAD_BYTES: int = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx"}
    MIN_EXPERIENCE_CHARS: int = 100
    MIN_JOB_DESC_CHARS: int = 50

    # CORS configuration for embedding into existing website & Vercel
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # AI Provider Settings (Free-first development)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
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
        try:
            self.DATA_DIR.mkdir(parents=True, exist_ok=True)
            self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            self.GENERATED_DIR.mkdir(parents=True, exist_ok=True)
        except OSError:
            tmp_dir = Path("/tmp/platform_data")
            tmp_dir.mkdir(parents=True, exist_ok=True)
            (tmp_dir / "uploads").mkdir(parents=True, exist_ok=True)
            (tmp_dir / "generated").mkdir(parents=True, exist_ok=True)
            self.DATA_DIR = tmp_dir
            self.DATABASE_PATH = tmp_dir / "platform.db"
            self.UPLOAD_DIR = tmp_dir / "uploads"
            self.GENERATED_DIR = tmp_dir / "generated"


settings = Settings()
settings.ensure_directories()

