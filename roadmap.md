# Trini AI roadmap

## Done
- Agent Kernel use-case package moved to `use-cases/triniai/` (was `agent-kernel-usecase/triniai/`)
- GLM 5.3 connected as primary model (`z-ai/glm-5.3` via OpenRouter, verified live)
- Context orchestration layer (`src/lib/trinity/context.server.ts`): language
  detection, profile/preferences, selective memory retrieval, safety rules,
  tone + language adaptation — used by `/api/chat` and `/api/agents/chat`
- Docs: `docs/context-orchestration.md`
- data.sql at project root; applied to the database (user_agents, agent_runs, seeded agents)
- Agents manager UI wired to /api/agents/chat (create, run, edit, delete)
- Supabase bearer token attached to /api/chat requests
- Bot admin account exists (bot@trinity.ai)
- Embedding-based memory search with `google/gemini-embedding-2`, indexed lookup,
  automatic backfill, model-version tracking, and lexical fallback

## Open
- Repository fork status is GitHub metadata — must be done in GitHub, not locally
- Deploy Python Agent Kernel to a real host, then set AGENT_KERNEL_URL to that base URL
- Image/video generation via Cloudflare Workers AI + R2 (needs Cloudflare token)
- Full ET syllabus module (units, lessons, topics, past papers, quizzes) backed by Turso
