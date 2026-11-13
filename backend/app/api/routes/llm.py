"""LLM provider configuration and key verification routes."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field

from app.config import settings
from app.services.llm.client import test_llm_connection

router = APIRouter()


class VerifyKeyRequest(BaseModel):
    provider: str = Field(default="gemini", description="AI provider: gemini, openai, or ollama")
    api_key: Optional[str] = Field(default=None, description="User-provided API key")
    model: Optional[str] = Field(default=None, description="Target model name")
    base_url: Optional[str] = Field(default=None, description="Optional custom base URL")


class VerifyKeyResponse(BaseModel):
    valid: bool
    provider: str
    model: Optional[str] = None
    latency_ms: Optional[int] = None
    message: str
    error: Optional[str] = None
    available_models: Optional[List[str]] = None


@router.post(
    "/verify-key",
    response_model=VerifyKeyResponse,
    summary="Validate user-supplied API key and model connectivity",
)
async def verify_api_key(payload: VerifyKeyRequest):
    """Test user's API key live against Google Gemini, OpenAI, or Ollama endpoints."""
    result = await test_llm_connection(
        provider=payload.provider,
        api_key=payload.api_key,
        model=payload.model,
        base_url=payload.base_url,
    )
    return VerifyKeyResponse(**result)


@router.get(
    "/providers",
    summary="List supported AI model providers and recommended presets",
)
async def get_providers():
    """Return available AI model providers, presets, and getting-started links."""
    return {
        "providers": [
            {
                "id": "gemini",
                "name": "Google Gemini",
                "badge": "Recommended • Free Tier Available",
                "description": "State-of-the-art multimodal reasoning, ultra-fast critique, and large context window.",
                "key_required": True,
                "key_placeholder": "AIzaSy...",
                "key_help_url": "https://aistudio.google.com/app/apikey",
                "key_help_text": "Get a free Google Gemini API key from Google AI Studio (no credit card required).",
                "default_model": settings.GEMINI_MODEL or "gemini-2.5-flash",
                "models": [
                    {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "badge": "Recommended • Fast & Smart", "is_default": True},
                    {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "badge": "Ultra-Low Latency"},
                    {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "badge": "Deep Strategic Reasoning"},
                    {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "badge": "Stable"},
                ],
            },
            {
                "id": "openai",
                "name": "OpenAI",
                "badge": "Popular",
                "description": "Standard cloud models powering GPT-4o and GPT-4o-mini.",
                "key_required": True,
                "key_placeholder": "sk-proj-...",
                "key_help_url": "https://platform.openai.com/api-keys",
                "key_help_text": "Create a secret API key in the OpenAI platform dashboard.",
                "default_model": settings.OPENAI_MODEL or "gpt-4o-mini",
                "models": [
                    {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "badge": "Fast & Economical", "is_default": True},
                    {"id": "gpt-4o", "name": "GPT-4o", "badge": "Flagship Reasoning"},
                    {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "badge": "Comprehensive"},
                ],
            },
            {
                "id": "ollama",
                "name": "Ollama (Local / Free)",
                "badge": "Offline • 100% Free",
                "description": "Runs local models entirely on your machine. Zero API keys or cloud costs required.",
                "key_required": False,
                "default_url": settings.OLLAMA_BASE_URL,
                "default_model": settings.OLLAMA_MODEL,
                "models": [
                    {"id": "gemma4:latest", "name": "Gemma 4", "badge": "Default Local", "is_default": True},
                    {"id": "llama3.2:latest", "name": "Llama 3.2", "badge": "Local Alternative"},
                    {"id": "mistral:latest", "name": "Mistral", "badge": "Local Alternative"},
                ],
            },
        ],
        "built_in_fallbacks_active": True,
        "note": "When no custom API key is supplied, the platform automatically uses local Ollama or deterministic heuristics."
    }
