"""API router unifying all platform routes."""
from fastapi import APIRouter
from app.api.routes import resume, experience, job, status, audit, rewriter, download


api_router = APIRouter()

# Candidate input routes
api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
api_router.include_router(experience.router, prefix="/experience", tags=["experience"])

# Job description route
api_router.include_router(job.router, prefix="/job-description", tags=["job-description"])

# Audit & Report routes
api_router.include_router(audit.router, prefix="/resume", tags=["audit"])

# Rewriter & Verification routes
api_router.include_router(rewriter.router, prefix="/resume", tags=["rewriter"])

# Document Export route
api_router.include_router(download.router, prefix="/resume", tags=["download"])

# Status & session route
api_router.include_router(status.router, prefix="/resume", tags=["status"])
