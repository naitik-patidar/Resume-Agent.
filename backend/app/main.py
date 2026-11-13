"""Main FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event to initialize database and storage on startup."""
    await init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Professional multi-agent resume rejection, auditing, and truthful improvement platform.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for embeddable frontend integration and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.vercel\.app)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["system"])
@app.get("/api/health", tags=["system"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": "1.0.0"}
