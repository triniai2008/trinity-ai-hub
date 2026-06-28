# All-Four Tracks Plan

Scope is large — I'll ship in 4 batches, one per turn. Confirm and I start with Batch 1 immediately.

## Batch 1 — Bug fixes + key rotation (this turn after approval)
- Rotate `LOVABLE_API_KEY` (the user-leaked HF + NVIDIA keys must be rotated by the user at HuggingFace/NVIDIA consoles — I'll re-link instructions).
- Chat "Something went wrong" — already patched `regenerate→sendMessage` in `chat.$chatId.tsx`; verify with Playwright against the live preview, fix any remaining crash path in `routes/api/chat.ts`.
- "New" buttons not working — audit all `New …` buttons (sidebar, modules) for missing `onClick` / dead navigation, wire to correct routes.
- Navigation errors between pages — check route guards in `_authenticated`, fix any broken `<Link to>` targets surfaced by tsgo.

## Batch 2 — NVIDIA + expanded HF model registry
- Add provider adapter `src/lib/providers/nvidia.ts` (build.nvidia.com OpenAI-compatible endpoint, uses `NVIDIA_API_KEY`).
- Add provider adapter `src/lib/providers/huggingface.ts` (Inference API, `HUGGINGFACE_API_KEY` with `HUGGINGFACE_API_KEY_BACKUP` fallback).
- Extend model registry (`src/lib/models/catalog.ts`) with the full HF list the user pasted (DeepSeek V3, Qwen3, Llama 4 Scout, Gemma 3, Mistral Small 3, DINOv2, Florence-2, SAM 2, TimesFM, Chronos, GraphSAGE, GAT, RT-2, etc.) tagged by modality/category. No per-model UI — they appear in the existing model picker.
- Wire router so chat backend can dispatch to NVIDIA / HF based on selected model id.

## Batch 3 — Trinity 14-step workflow engine
Replace the chat backend (`src/routes/api/chat.ts`) with a Trinity pipeline:
1. classify → 2. enhance prompt → 3. retrieve context → 4. plan → 5. route to model(s) → 6. parallel execute → 7. judge/score → 8. consensus → 9. verify facts → 10. tool calls → 11. self-critique → 12. optimize → 13. format → 14. stream.

Implemented as a streamable AI SDK chain with `streamText` + intermediate `data-stream` parts so the UI can show step progress. Configurable via `src/lib/trinity/config.ts`.

## Batch 4 — Student dashboard + Google Drive + PDF local storage
- Personalized dashboard route `/dashboard` reading `profiles.onboarding_answers` (add jsonb column via migration) — widgets: study goals, recommended modules, recent chats, upcoming, AI suggestions.
- Google Drive: per-user OAuth (Supabase Google provider already enabled). Add `drive.readonly` scope, store refresh token in `user_integrations` table, server fn `listDriveFiles`.
- PDF local storage: IndexedDB wrapper in `src/lib/pdf-store.ts` (Dexie), upload UI on dashboard, render with pdfjs-dist in viewer route.

## Technical notes
- All new server logic via `createServerFn` per stack rules.
- Each batch ends with a Playwright smoke check.
- Keys: `NVIDIA_API_KEY`, `HUGGINGFACE_API_KEY`, `HUGGINGFACE_API_KEY_BACKUP` already saved as secrets.

Reply **go** to start Batch 1, or tell me to re-order / drop a batch.
