
# TriniAI Phase 2 — Trinity 1.0 Brain + Multi-Provider + Turso + External Supabase

This is a multi-turn build. I'll do it in 4 staged sub-phases so each one is testable. Below is the full plan; I'll execute Stage A on approval, then Stage B/C/D in follow-up turns.

## Secrets (stored, ready)
EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_PUBLISHABLE_KEY, EXTERNAL_SUPABASE_DB_URL, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, HUGGINGFACE_API_KEY, OPENROUTER_API_KEY. LOVABLE_API_KEY already present.

---

## Stage A — Foundations (this turn after approval)

### A1. External Supabase swap (auth + Postgres)
- Rewrite `.env` → point VITE_SUPABASE_* + SUPABASE_* at `frnntlkjycxgwblbuhqo`.
- Re-run our migrations (profiles, user_roles + enum, chats, messages, has_role, handle_new_user trigger) against the new project via a one-shot SQL script the user runs (we can't auto-migrate an external Supabase from Lovable Cloud tools).
- Regenerate `src/integrations/supabase/types.ts` manually or keep current shape since schema is identical.
- **Known loss**: Google OAuth via `@lovable.dev/cloud-auth-js` broker stops working. User must configure Google provider directly in their Supabase dashboard → Auth → Providers, with redirect URL `https://<preview>/auth/callback`. Email/password keeps working.

### A2. Turso DB layer
- `bun add @libsql/client`.
- New `src/integrations/turso/client.server.ts` (server-only, service-role-equivalent).
- New migrations file `turso/schema.sql` with full mirror tables:
  `users, profiles, chats, messages, memories, projects, files, notifications, models, agents, api_keys, feedback, usage_logs, moderation_logs, training_dataset, mcp_connections, settings`.
- Idempotent bootstrap server fn `ensureTursoSchema()` that runs `CREATE TABLE IF NOT EXISTS` on cold start.
- Write-through pattern: Supabase = source of truth for auth/chats/messages; Turso receives async mirror writes for `memories, usage_logs, feedback, training_dataset, moderation_logs, mcp_connections, settings` (the Trinity-specific tables Supabase doesn't have).
- Read pattern: Trinity-only tables read directly from Turso.

### A3. Fix routing runtime error
Quietly fix the "Expected to find a match below the root match in SPA mode" invariant (likely a missing `<Outlet />` in a parent or a stale route in `routeTree.gen.ts` after the 100-route scaffold).

---

## Stage B — Trinity 1.0 Router (next turn)

### B1. Provider abstraction
```
src/lib/trinity/providers/
  openrouter.server.ts   // primary, fetch-based, supports all listed text models
  huggingface.server.ts  // fallback, Inference API
  ollama.server.ts       // local, base URL from user setting, optional
  lovable.server.ts      // existing gateway, kept as 4th fallback
```
Each exports `streamChat({ model, messages, signal })` returning an AI-SDK-compatible stream.

### B2. Model registry (`src/lib/trinity/models.ts`)
Typed catalog of every model in your spec (DeepSeek V3, Qwen 3, Gemma 3, Llama, Mistral, Phi, GPT, Claude, Gemini, DeepSeek/Qwen Coder, FLUX, SDXL, SD, Wan, CogVideoX, LTX, Whisper, MusicGen, Kokoro, Piper, Stable Audio, Hunyuan3D, TripoSR) with: id, provider, capability tags (chat/code/math/writing/research/image/video/audio/3D), priority, premium flag.

### B3. Router (`src/lib/trinity/router.server.ts`)
Pure function `route(task, mode, userPrefs) → ModelPlan`:
- Detects task type (chat/code/math/writing/research/image/video/voice/3D) from message + system hint.
- Normal mode → 1 model (highest priority available for task).
- Medium → 3-5 models from priority list.
- High → all enabled models for the task.

### B4. Updated `/api/chat` route
- Calls `route()` → gets `ModelPlan`.
- Normal: streams the single model directly.
- Medium/High: runs models in parallel with `Promise.allSettled`, then hands to Judge.

### B5. Judge agent (`src/lib/trinity/judge.server.ts`)
Uses a fast model (Gemini 3 Flash or GPT-5-mini) with a strict JSON-output prompt scoring each response on accuracy/reasoning/creativity/code-quality/hallucination/length. Returns winner index.

### B6. Consensus engine (High mode only)
Synthesizes the top-3 judged responses into one final answer via Claude/GPT.

---

## Stage C — Agents + MCP Routing (turn 3)

- `src/lib/trinity/agents/` — coding, research, image, video, voice, memory, planner. Each is a system-prompt + tool-set + preferred model.
- MCP router: reads `mcp_connections` table, hands tool calls to right MCP server (Canva, GitHub, Figma, Drive, Search, Browser). Uses AI SDK's MCP client per the `ai-sdk-mcp-client` guidance.
- Memory engine: writes user prefs to `memories` table after each chat; injects top-N into system prompt.
- Feedback learning: 👍/👎 buttons already roughed in — wire to `feedback` + `training_dataset` tables.

---

## Stage D — Error/fallback + image/video/voice/3D (turn 4)

- `src/lib/trinity/fallback.server.ts` — provider chain `User Key → OpenRouter → HF → Ollama → cached → friendly error`, with retry strategy 1s/3s/5s.
- Hook into every provider call. Surface user-friendly messages, never raw stack traces.
- Image module: FLUX (HF) → SDXL → SD fallback. Wire `/imagine` page.
- Video: Wan (HF/Replicate) → CogVideoX → LTX.
- Voice: Kokoro → Piper fallback (HF Inference).
- 3D: Hunyuan3D → TripoSR.
- Whisper STT endpoint for `/chat/voice`.
- Logging: every model call writes to `usage_logs` (Turso).

---

## Technical specifics

### Stage A files touched
- **edit** `.env` (rewrite Supabase vars)
- **edit** `src/integrations/supabase/client.ts` — no change needed, reads from env
- **create** `src/integrations/turso/client.server.ts`
- **create** `src/integrations/turso/schema.ts` (TS schema constants + bootstrap)
- **create** `src/lib/turso-mirror.functions.ts` (server fns for memory/feedback/usage writes)
- **edit** `package.json` + `bun.lock` (add `@libsql/client`)
- **investigate + fix** routing invariant (likely `chat.tsx` or a layout missing `<Outlet />`)

### What you'll need to do manually after Stage A
1. In your external Supabase dashboard → SQL editor, run the migration SQL I'll output (copy/paste).
2. In external Supabase → Auth → Providers → enable Email, and enable Google with your own OAuth client ID/secret. Set Site URL to your preview URL.
3. Set redirect URLs in Supabase Auth settings.

I'll output the exact SQL and dashboard steps at the end of Stage A.

### What stays the same
- All 100 route files
- Existing chat UI / model selector / thinking-mode UI
- Tailwind theme + module sidebar architecture

---

## Risks I'm flagging
- **External Supabase migration is one-way and manual.** Once we switch `.env`, the Lovable Cloud Supabase data (your existing test chats) won't be visible. Confirm you don't need to export it first.
- **Google OAuth requires your own setup** in the new project — not 1-click anymore.
- **OpenRouter/HF cost**: Medium/High modes hit 3-7 models per message. Watch the bill. I'll add a per-user daily cap via `daily_limit` field.
- **Turso schema drift**: Trinity tables only live in Turso; if Turso goes down, those features degrade (memory/logs disabled, chat still works).

---

Reply **"go A"** to start Stage A. Or tell me to adjust scope/order.
