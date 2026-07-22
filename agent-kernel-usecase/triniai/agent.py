"""FastAPI entrypoint for the TriniAI use case.

Serves the HTTP contract described in SPEC.md. Streams SSE for
/v1/chat/stream. No provider secrets ever leave this process.
"""
from __future__ import annotations

import json
from typing import Any

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from .config import MODEL_REGISTRY, settings
from .tools import TOOLS
from .workflow import ChatRequest, run

app = FastAPI(title="TriniAI Agent Kernel", version="1.0.0")


class ChatBody(BaseModel):
    messages: list[dict[str, Any]]
    mode: str = "normal"
    model: str | None = None
    user_id: str = "anon"
    metadata: dict[str, Any] = Field(default_factory=dict)


def _authorize(header: str | None) -> None:
    """Optional shared-secret between the Node gateway and this service."""
    expected = settings.gateway_shared_secret
    if not expected:
        return
    if header != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="unauthorized")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/v1/models")
async def models() -> dict[str, Any]:
    return {"models": [m.__dict__ for m in MODEL_REGISTRY.values()]}


@app.post("/v1/chat")
async def chat(body: ChatBody, authorization: str | None = Header(default=None)) -> JSONResponse:
    _authorize(authorization)
    req = ChatRequest(**body.model_dump())
    parts: list[str] = []
    meta: dict[str, Any] = {}
    async for ev in run(req):
        if ev.event == "token":
            parts.append(ev.data["delta"])
        elif ev.event == "done":
            meta = ev.data
        elif ev.event == "error":
            raise HTTPException(status_code=502, detail=ev.data["message"])
    return JSONResponse({"content": "".join(parts), **meta})


@app.post("/v1/chat/stream")
async def chat_stream(body: ChatBody, authorization: str | None = Header(default=None)):
    _authorize(authorization)
    req = ChatRequest(**body.model_dump())

    async def sse():
        async for ev in run(req):
            yield f"event: {ev.event}\ndata: {json.dumps(ev.data)}\n\n"

    return StreamingResponse(sse(), media_type="text/event-stream")


@app.post("/v1/tools/{tool_name}")
async def invoke_tool(
    tool_name: str, request: Request, authorization: str | None = Header(default=None)
) -> JSONResponse:
    _authorize(authorization)
    tool = TOOLS.get(tool_name)
    if tool is None:
        raise HTTPException(status_code=404, detail=f"unknown tool: {tool_name}")
    body = await request.json()
    ctx = {"user_id": body.get("user_id", "anon")}
    result = await tool.handler(body.get("args", {}), ctx)
    return JSONResponse({"tool": tool_name, "result": result})


if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run("triniai.agent:app", host=settings.host, port=settings.port, reload=False)
