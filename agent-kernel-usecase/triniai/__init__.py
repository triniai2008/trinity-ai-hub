"""TriniAI — Agent Kernel use case.

Public re-exports for convenience.
"""
from .config import MODEL_REGISTRY, settings  # noqa: F401
from .workflow import ChatEvent, ChatRequest, run  # noqa: F401

__all__ = ["MODEL_REGISTRY", "settings", "ChatEvent", "ChatRequest", "run"]
__version__ = "1.0.0"
