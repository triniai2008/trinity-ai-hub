# Engineering Technology Tutor (Agent Kernel use case)

End-to-end learning workflow for the Sri Lankan A/L Engineering Technology stream
(ET, SFT, ICT). Route: `/learn/tutor`.

## Flow

```text
Prompt / upload
  → File Agent      extract + clean + classify subject & topic
  → Study Agent     explain lesson, notes, exam-important points, concepts
  → Quiz Agent      syllabus-style MCQs from the same material
  → Judge Agent     deterministic grading + mistake coaching + weak areas
  → Planner Agent   revision plan for the days left until the exam
```

The Kernel (A3), Harness (A1) and Hermes (A2) stages run behind the scenes; the UI
only surfaces "Powered by Agent Kernel" plus the four student-facing stages.

## Models

Agents prefer DeepSeek: `nvidia-deepseek-r1` (NVIDIA NIM) → `hf-deepseek-v3`
(Hugging Face) → `deepseek-v3` (OpenRouter), with the Lovable AI Gateway
(`google/gemini-3.6-flash`) as last-resort fallback. Thinking mode decides whether a
reasoning model is spent on a step: `normal` = fast models, `medium` = reasoning for
teach/quiz, `high` = reasoning everywhere.

## Storage (Turso)

`src/lib/tutor/schema.server.ts`, created idempotently on first call:

| Table | Purpose |
| --- | --- |
| `tutor_documents` | Cleaned lesson material per user |
| `tutor_analyses` | Study Agent output (summary, explanation, notes, exam points) |
| `tutor_quizzes` | Generated questions incl. answer keys (never sent to the client) |
| `tutor_attempts` | Answers, per-question results, score, weak areas |
| `tutor_plans` | Planner Agent revision plans |

## Server functions

`src/lib/tutor/tutor.functions.ts` — all behind `requireSupabaseAuth`, scoped to the
verified `context.userId`:

- `teachDocument` — File Agent + Study Agent, persists document + analysis.
- `buildQuiz` — Quiz Agent; returns questions **without** the answer key.
- `submitQuiz` — grades server-side, stores the attempt, returns evaluation + plan.
- `listTutorSessions` — recent lessons with the latest score.

PDF text extraction runs in the browser with `pdfjs-dist`; only text reaches the
server. Scanned/image-only PDFs are rejected with a prompt to paste the text.
