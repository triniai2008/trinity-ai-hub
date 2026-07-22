# TriniAI — Agent Kernel Use Case Specification

**Use-case ID:** `triniai`
**Framework:** Agent Kernel (unchanged core)
**Runtime:** Python 3.11+
**Default LLM:** Google Gemini 1.5 Pro / Flash (configurable)

## Purpose

TriniAI is an AI Operating System that unifies chat, imagine, code, research,
agents and MCP tools. This use-case exposes the orchestration layer
("Trinity 1.0") through Agent Kernel so the TriniAI React frontend (via a
Node.js gateway) can call one stable HTTP contract regardless of which
underlying model or tool answers.

## Boundaries

- Does **not** modify Agent Kernel core (`agent_kernel/*`).
- Lives entirely under `use-cases/triniai/`.
- All configuration comes from env vars — no hardcoded secrets.
- All I/O is HTTP + SSE; no direct calls from the React app to model providers.

## HTTP Contract (served by Agent Kernel)

| Method | Path                    | Purpose                                  |
| ------ | ----------------------- | ---------------------------------------- |
| GET    | `/health`               | Liveness probe                           |
| POST   | `/v1/chat`              | Non-streaming chat completion (JSON)     |
| POST   | `/v1/chat/stream`       | SSE stream of `token`, `step`, `done`    |
| POST   | `/v1/tools/{tool}`      | Invoke a named tool                      |
| GET    | `/v1/models`            | Effective model registry                 |

### Request body (`/v1/chat*`)

```json
{
  "messages": [{"role": "user", "content": "..."}],
  "mode": "normal | medium | high",
  "model": "gemini-1.5-pro",          // optional, overrides router
  "user_id": "supabase-uuid",         // opaque; used for memory scoping
  "metadata": { "chat_id": "..." }
}
```

### SSE events

```
event: step   data: {"step": "classify", "status": "done"}
event: token  data: {"delta": "Hello"}
event: done   data: {"model": "gemini-1.5-pro", "tokens": 128, "duration_ms": 900}
event: error  data: {"message": "..."}
```

## Thinking Modes

| Mode   | Fan-out                | Judge      | Latency budget |
| ------ | ---------------------- | ---------- | -------------- |
| normal | 1 model                | none       | ≤ 3 s          |
| medium | 3–5 models in parallel | LLM judge  | ≤ 8 s          |
| high   | full ensemble          | consensus  | ≤ 20 s         |

## Tools

Registered via `tools.py` and exposed to Gemini via function-calling:
`web_search`, `fetch_url`, `remember`, `recall`, `list_models`.

## Memory

Long-term memory is optional. Backed by Turso (libSQL) when
`TURSO_URL` is set; otherwise a no-op in-process dict.

## Non-goals

- Multi-tenant billing.
- Direct WebSocket transport (SSE only for v1).
- Fine-tuning pipelines.
