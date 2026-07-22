"""Function-calling tools exposed to Gemini through Agent Kernel."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Awaitable, Callable

import httpx

from .config import MODEL_REGISTRY
from .memory import store


@dataclass
class Tool:
    name: str
    description: str
    parameters: dict[str, Any]
    handler: Callable[[dict[str, Any], dict[str, Any]], Awaitable[Any]]


async def _web_search(args: dict[str, Any], ctx: dict[str, Any]) -> dict[str, Any]:
    q = args["query"]
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get("https://duckduckgo.com/?format=json", params={"q": q})
    return {"query": q, "status": r.status_code}


async def _fetch_url(args: dict[str, Any], ctx: dict[str, Any]) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        r = await client.get(args["url"])
    return {"status": r.status_code, "text": r.text[:20_000]}


async def _remember(args: dict[str, Any], ctx: dict[str, Any]) -> dict[str, Any]:
    await store.remember(ctx["user_id"], args["key"], args["value"])
    return {"ok": True}


async def _recall(args: dict[str, Any], ctx: dict[str, Any]) -> dict[str, Any]:
    return {"value": await store.recall(ctx["user_id"], args["key"])}


async def _list_models(args: dict[str, Any], ctx: dict[str, Any]) -> dict[str, Any]:
    return {"models": [m.__dict__ for m in MODEL_REGISTRY.values()]}


TOOLS: dict[str, Tool] = {
    t.name: t
    for t in [
        Tool(
            "web_search",
            "Search the public web for a short answer.",
            {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
            _web_search,
        ),
        Tool(
            "fetch_url",
            "Fetch a URL and return its text content (truncated).",
            {"type": "object", "properties": {"url": {"type": "string"}}, "required": ["url"]},
            _fetch_url,
        ),
        Tool(
            "remember",
            "Store a value in the caller's long-term memory.",
            {
                "type": "object",
                "properties": {"key": {"type": "string"}, "value": {"type": "string"}},
                "required": ["key", "value"],
            },
            _remember,
        ),
        Tool(
            "recall",
            "Retrieve a value from the caller's long-term memory.",
            {"type": "object", "properties": {"key": {"type": "string"}}, "required": ["key"]},
            _recall,
        ),
        Tool(
            "list_models",
            "List available models in the registry.",
            {"type": "object", "properties": {}},
            _list_models,
        ),
    ]
}
