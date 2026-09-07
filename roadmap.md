# Trini AI roadmap

## Done
- data.sql at project root; applied to the database (user_agents, agent_runs, seeded agents)
- Agents manager UI wired to /api/agents/chat (create, run, edit, delete)
- RAG personalization in /api/agents/chat and /api/chat (all paths)
- Supabase bearer token attached to /api/chat requests
- Bot admin account exists (bot@trinity.ai)

## Open
- GLM 5.2 as default model — waiting for base URL, API key and OpenRouter model id
- Deploy Python Agent Kernel to a real host, then set AGENT_KERNEL_URL to that base URL
- Full ET syllabus module (units, lessons, topics, past papers, quizzes) backed by Turso
