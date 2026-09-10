"""Trinity 1.0 workflow: classify → route → execute → judge → stream.

Implemented on top of Agent Kernel's public extension points. The core
framework is not modified; this module wraps it.
"""
from __future__ import annotations

import asyncio
import json
import time
from dataclasses import dataclass
from typing import AsyncIterator

from .config import MODEL_REGISTRY, ThinkingMode, settings
from .prompts import JUDGE, SYSTEM

# Agent Kernel public API. Keep imports narrow so an upstream refactor of
# internals doesn't ripple in.
try:
    from agent_kernel import Agent, Message  # type: ignore
    from agent_kernel.providers import gemini  # type: ignore
except ImportError:  # pragma: no cover - allows local dev without the core installed
    Agent = Message = gemini = None  # type: ignore


@dataclass
class ChatRequest:
    messages: list[dict]
    mode: ThinkingMode = "normal"
    model: str | None = None
    user_id: str = "anon"
    metadata: dict | None = None


@dataclass
class ChatEvent:
    event: str  # "step" | "token" | "done" | "error"
    data: dict


def _pick_models(mode: ThinkingMode, override: str | None) -> list[str]:
    if override and override in MODEL_REGISTRY:
        return [override]
    catalog = list(MODEL_REGISTRY.keys())
    if mode == "normal":
        return [settings.default_model]
    if mode == "medium":
        return catalog[: min(3, len(catalog))]
    return catalog  # high = full ensemble


def _make_agent(model_id: str):
    if Agent is None:
        raise RuntimeError(
            "agent_kernel is not installed. Run this use case from inside "
            "your Agent Kernel fork so the core package is importable."
        )
    return Agent(
        provider=gemini(api_key=settings.gemini_api_key, model=model_id),
        system_prompt=SYSTEM,
    )


async def _run_one(model_id: str, messages: list[dict]) -> str:
    agent = _make_agent(model_id)
    reply = await agent.arun([Message(**m) for m in messages])
    return reply.content if hasattr(reply, "content") else str(reply)


async def _judge(question: str, candidates: list[str]) -> int:
    """Return the winning index. Falls back to 0 on parse failure."""
    if len(candidates) == 1:
        return 0
    agent = _make_agent(settings.default_model)
    payload = json.dumps({"question": question, "candidates": candidates})
    reply = await agent.arun([Message(role="user", content=f"{JUDGE}\n\n{payload}")])
    text = reply.content if hasattr(reply, "content") else str(reply)
    try:
        return int(json.loads(text)["winner_index"])
    except Exception:
        return 0


async def run(req: ChatRequest) -> AsyncIterator[ChatEvent]:
    started = time.perf_counter()
    yield ChatEvent("step", {"step": "classify", "status": "done"})

    picks = _pick_models(req.mode, req.model)
    yield ChatEvent("step", {"step": "route", "status": "done", "models": picks})

    # Parallel fan-out with a per-mode budget.
    budget = settings.budgets[req.mode]
    tasks = [asyncio.create_task(_run_one(m, req.messages)) for m in picks]
    try:
        answers = await asyncio.wait_for(asyncio.gather(*tasks), timeout=budget)
    except asyncio.TimeoutError:
        answers = [t.result() for t in tasks if t.done() and not t.exception()]
        if not answers:
            yield ChatEvent("error", {"message": "All candidate models timed out"})
            return

    yield ChatEvent("step", {"step": "execute", "status": "done", "count": len(answers)})

    question = next(
        (m["content"] for m in reversed(req.messages) if m.get("role") == "user"), ""
    )
    winner_idx = await _judge(question, answers) if req.mode != "normal" else 0
    winning = answers[winner_idx]
    yield ChatEvent("step", {"step": "judge", "status": "done", "winner": winner_idx})

    # Token-stream the winning answer to the client.
    for chunk in _chunk(winning, 40):
        yield ChatEvent("token", {"delta": chunk})

    yield ChatEvent(
        "done",
        {
            "model": picks[winner_idx],
            "candidates": len(answers),
            "duration_ms": int((time.perf_counter() - started) * 1000),
        },
    )


def _chunk(text: str, size: int):
    for i in range(0, len(text), size):
        yield text[i : i + size]
