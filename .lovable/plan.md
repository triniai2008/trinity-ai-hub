
# TriniAI — Phased Build Plan

Your spec covers ~100 pages, 15+ modules, a multi-model AI router (Trinity 1.0), agents, MCPs, admin panel, moderation, Turso, Google Sheets sync, Capacitor, etc. That's a multi-month product, not a single build. Shipping it all at once would mean ~100 broken placeholder pages and no working core.

I'll build it in phases. **Phase 1** below is what I'll implement now — a real, usable foundation. Later phases are scoped but not built until you approve each.

---

## Phase 1 — Foundation & Chat (build now)

Goal: a working ChatGPT-style shell with real AI chat, auth, and the full navigation skeleton so every later module slots in cleanly.

**Design system**
- Black/white minimal theme (dark default, light toggle), Inter, thin borders, rounded corners, no gradients/glass
- Tokens in `src/styles.css`: `--background #0A0A0A`, sidebar `#111`, card `#1A1A1A`, border `#2A2A2A`, muted text `#A1A1AA`; light mirror
- Shadcn variants tuned to the system

**Shell & navigation**
- Root layout with collapsible desktop sidebar + mobile bottom nav (Home, Chat, Imagine, Code, More)
- "More" drawer for the remaining modules
- Command palette (⌘K), toast system, error boundary, skeletons, empty states
- Top bar: new chat, theme toggle, profile menu

**Auth (Lovable Cloud)**
- Enable Lovable Cloud
- Email/password + Google sign-in, `/auth` and `/reset-password`
- `profiles` table + trigger, `user_roles` table (user/vip/moderator/admin/super_admin) with `has_role()` security-definer

**Chat module (real, working)**
- New Chat, Chat History sidebar, rename/delete/pin/archive
- Streaming responses via Lovable AI Gateway (default `google/gemini-3-flash-preview`)
- Model selector (Gemini/GPT-5/Claude-equivalents from allowlist) + Thinking Mode selector (Normal/Medium/High — Phase 1 routes all to single model; multi-model judge lands in Phase 3)
- Markdown + code blocks (syntax highlight), copy, regenerate, edit prompt
- Conversation persistence in Cloud (`chats`, `messages` tables with RLS + GRANTs)

**Page stubs (navigable, labeled "Coming soon")**
- Imagine, Code, Explore, Agents, Models, MCP Hub, Workspace, Community, Learn, Notifications, Profile, Settings, Admin
- Each is a real route with proper `head()` metadata so navigation works end-to-end

**SEO**
- `sitemap.xml`, `robots.txt`, per-route titles/descriptions

---

## Phase 2 — Imagine + Settings + Profile
Image generation (gpt-image-2), history, prompt input, aspect ratio/style controls. Real Settings (appearance, AI, privacy, language). Real Profile (account, usage, subscription stub).

## Phase 3 — Trinity Router (multi-model)
High Thinking mode: fan out to N models in parallel, judge agent picks best, optional "show all responses" view. Memory engine (per-user facts table) + feedback like/dislike feeding `training_dataset`.

## Phase 4 — Code module
Monaco editor, file explorer, AI assist panel, live preview iframe, GitHub OAuth + push.

## Phase 5 — Explore (research)
Web search MCP, deep research agent, PDF reader, YouTube transcript, flashcards/quiz generation.

## Phase 6 — Workspace + Learn + Community
Notes (rich text), tasks, calendar, files. AI tutor, streaks, achievements. Teams, templates, leaderboard.

## Phase 7 — Models + MCP Hub + Agents pages
Model marketplace UI, BYO API keys (encrypted), Ollama bridge (local). MCP install flow + permissions. Agent config pages.

## Phase 8 — Admin panel + Moderation + Analytics
Role-gated `/admin/*`, user table, broadcasts, moderation queue, usage analytics charts, limits manager, backup/export.

## Phase 9 — Mobile (Capacitor) + Offline (IndexedDB sync)

---

## Technical notes
- Stack stays TanStack Start + Lovable Cloud (Supabase under the hood) — Turso/Cloudflare Workers in your spec are replaced by Lovable's managed equivalents unless you specifically want to self-host later
- Google Sheets sync deferred to Phase 8 (backup/export)
- All AI calls go through Lovable AI Gateway server functions; user-supplied API keys land in Phase 7
- Roles in dedicated `user_roles` table (never on profiles)

---

**Confirm to proceed with Phase 1**, or tell me to reshape (e.g. "skip auth, just chat" / "do Imagine in Phase 1 too" / "use Turso not Cloud").
