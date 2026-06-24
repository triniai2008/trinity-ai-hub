# PART 3 — Frontend Components, Workflows & Interactions

This is a very large scope (hundreds of components across 15+ modules). To ship something coherent rather than a thin stub of everything, I'll build in **3 waves**. Each wave leaves the app fully usable.

---

## Wave 1 — Shell, Chat, Common Primitives (this turn)

The core experience users actually touch first.

**Root layout polish**
- Top navbar with: global search trigger (⌘K), theme switcher, notification bell, profile menu, breadcrumbs
- Command palette (`cmdk`) — navigate any route, switch model, new chat, quick actions
- Toast system (sonner — already present)
- Global ErrorBoundary + standard EmptyState component
- Skeleton primitives + LoadingDots

**Chat experience (the heart of the app)**
- AI Elements installed: `conversation`, `message`, `prompt-input`, `shimmer`, `tool`, `code-block`
- User bubble / Assistant message (no bg) with proper markdown + syntax highlighting
- Message actions: Copy, Regenerate, Edit Prompt, Retry, Continue, Share
- Model badge + Thinking badge on each assistant message
- Model selector + Thinking-mode selector in composer (Normal / Medium / High)
- Typing indicator using Shimmer "Thinking…"
- Multi-response viewer (Medium/High shows candidates + judge winner)
- Citations block, Image/Video/Audio inline viewers
- Chat sidebar: Folders, Pinned, Search chats, History

**Common components** (single shared file `src/components/common.tsx`)
- EmptyState, SectionHeader, StatCard, LoadingDots, Skeleton presets

**Modals**
- New Chat, Rename, Delete, Share, Export, Clear History, Logout, Connect API Key, Upload File

---

## Wave 2 — Imagine, Code, Models, Agents, MCP (next prompt)

- Imagine: prompt input + style/aspect/resolution selectors, history grid, preview/download/share, generation queue
- Code: file explorer, editor (Monaco), AI assistant panel, terminal, live preview, diff viewer, GitHub panel
- Models: install/cloud/local/upload pages with enable toggles, temperature, duplicate, perf stats
- Agents: per-agent card pages with stats + run-now
- MCP: marketplace, connection status, permissions, logs

## Wave 3 — Workspace, Learn, Community, Admin, Profile, Settings (final prompt)

- Workspace: notes editor, docs, tasks, calendar, files, tags, archive
- Learn: tutor, flashcards, quiz, mind maps, streaks, achievements
- Community: teams, templates, comments, likes, leaderboard
- Admin: dashboard, users, analytics, moderation, broadcast, training dataset
- Profile + Settings: account, security, devices, sessions, preferences, all settings pages

---

## Design constraints (applied to all waves)

- **Theme**: Black & white, minimal, ChatGPT/Claude/Cursor-inspired
- **Tokens only**: no hard-coded colors; use `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary/primary-foreground`
- **No glassmorphism / heavy effects**
- **Animations**: fade, slide, shimmer, skeleton — nothing more
- **Mobile first**: bottom nav stays, sidebar collapses on `<md`
- **Accessibility**: shadcn primitives, aria-labels on icon buttons, focus-visible rings
- **AI Elements gate**: chat surface built on the AI Elements registry, not hand-rolled bubbles

---

## Technical notes

- `bun add cmdk react-markdown remark-gfm rehype-highlight` (markdown + syntax highlight for chat)
- Install AI Elements: `bunx ai-elements@latest add conversation message prompt-input shimmer tool code-block`
- New files (Wave 1 only):
  - `src/components/command-palette.tsx`
  - `src/components/theme-switcher.tsx`
  - `src/components/notification-bell.tsx`
  - `src/components/profile-menu.tsx`
  - `src/components/breadcrumbs.tsx`
  - `src/components/common.tsx` (EmptyState, StatCard, LoadingDots, SectionHeader)
  - `src/components/error-boundary.tsx`
  - `src/components/chat/*` (Composer, Message, ModelBadge, ThinkingBadge, MultiResponseViewer, MessageActions)
  - `src/components/modals/*` (NewChat, Rename, Delete, Share, Export)
- Updates: `src/routes/__root.tsx` (navbar + command palette), `src/components/app-sidebar.tsx`, `src/routes/chat.$chatId.tsx`, `src/routes/chat.index.tsx`

---

## What I need from you

1. **Confirm wave 1 scope above** — or tell me to compress all 3 waves into one (it will be shallower per page).
2. **Command palette**: include AI actions (Generate image, Start research) or navigation only?
3. **Chat composer extras**: attachments + voice input button visible in wave 1, or wave 2?

Reply with anything (or just "go") and I'll start Wave 1.
