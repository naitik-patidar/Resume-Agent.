"""Vercel Serverless Function entry point mounting the FastAPI application."""
import os
import sys
from pathlib import Path

# Set VERCEL environment variable for serverless /tmp database handling
os.environ["VERCEL"] = "1"

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
