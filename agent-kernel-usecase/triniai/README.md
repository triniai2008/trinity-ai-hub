# TriniAI — Agent Kernel Use Case

Drop-in use case for [Agent Kernel](https://github.com/agent-kernel/agent-kernel).
Do not modify the core framework — copy this whole folder to
`use-cases/triniai/` in your fork.

## Quick start

```bash
cd use-cases/triniai
cp .env.example .env
# fill in GEMINI_API_KEY (required) and any optional keys
pip install -r requirements.txt
python -m triniai.agent            # boots FastAPI on :8080
```

Test:

```bash
curl -N -X POST http://localhost:8080/v1/chat/stream \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"hi"}],"mode":"normal"}'
```

## Docker

```bash
docker build -t triniai-agent .
docker run -p 8080:8080 --env-file .env triniai-agent
```

## Wiring the TriniAI frontend

The React app talks to a Node.js gateway (TanStack Start server route
`/api/chat`). Set `AGENT_KERNEL_URL=http://localhost:8080` (or your deployed
URL) in the frontend's runtime secrets. The gateway proxies to
`${AGENT_KERNEL_URL}/v1/chat/stream`.

## Layout

```
use-cases/triniai/
├── agent.py         FastAPI entrypoint, HTTP + SSE
├── workflow.py      Trinity mode routing (normal/medium/high)
├── tools.py         Function-calling tools
├── memory.py        Optional Turso-backed long-term memory
├── prompts.py       System + judge prompts
├── config.py        Env-driven settings (pydantic)
├── requirements.txt
├── Dockerfile
├── .env.example
├── SPEC.md
└── tests/
```

## Extending

- Add a model: edit `config.MODEL_REGISTRY`.
- Add a tool: subclass `Tool` in `tools.py` and register it in `TOOLS`.
- Swap Gemini: implement a new provider in `providers/` and set
  `DEFAULT_PROVIDER`.

## Competition compliance

- Core untouched: no imports from `agent_kernel.*` are patched or
  monkey-patched; only public extension points are used.
- All state is external (env / DB / HTTP), so redeploying the use case is
  stateless.
