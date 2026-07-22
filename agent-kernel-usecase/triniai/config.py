"""Environment-driven settings for the TriniAI use case.

Never hardcode secrets. All values come from the process environment.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Literal


ThinkingMode = Literal["normal", "medium", "high"]


@dataclass(frozen=True)
class ModelSpec:
    id: str
    provider: Literal["gemini", "openrouter", "huggingface", "nvidia"]
    tier: Literal["fast", "balanced", "premium"] = "balanced"
    max_tokens: int = 4096


# The registry is the single source of truth for available models.
# The React app never talks to providers directly, so this list *is* the
# effective catalog exposed via GET /v1/models.
MODEL_REGISTRY: dict[str, ModelSpec] = {
    "gemini-1.5-flash": ModelSpec("gemini-1.5-flash", "gemini", "fast", 8192),
    "gemini-1.5-pro":   ModelSpec("gemini-1.5-pro", "gemini", "premium", 8192),
    "gemini-2.0-flash": ModelSpec("gemini-2.0-flash", "gemini", "balanced", 8192),
}


@dataclass(frozen=True)
class Settings:
    host: str = field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    port: int = field(default_factory=lambda: int(os.getenv("PORT", "8080")))

    default_provider: str = field(default_factory=lambda: os.getenv("DEFAULT_PROVIDER", "gemini"))
    default_model: str = field(default_factory=lambda: os.getenv("DEFAULT_MODEL", "gemini-1.5-flash"))

    gemini_api_key: str | None = field(default_factory=lambda: os.getenv("GEMINI_API_KEY"))
    openrouter_api_key: str | None = field(default_factory=lambda: os.getenv("OPENROUTER_API_KEY"))
    huggingface_api_key: str | None = field(default_factory=lambda: os.getenv("HUGGINGFACE_API_KEY"))
    nvidia_api_key: str | None = field(default_factory=lambda: os.getenv("NVIDIA_API_KEY"))

    turso_url: str | None = field(default_factory=lambda: os.getenv("TURSO_URL"))
    turso_token: str | None = field(default_factory=lambda: os.getenv("TURSO_AUTH_TOKEN"))

    gateway_shared_secret: str | None = field(
        default_factory=lambda: os.getenv("GATEWAY_SHARED_SECRET")
    )

    # Latency budgets per mode, in seconds.
    budgets: dict[str, float] = field(
        default_factory=lambda: {"normal": 3.0, "medium": 8.0, "high": 20.0}
    )


settings = Settings()
