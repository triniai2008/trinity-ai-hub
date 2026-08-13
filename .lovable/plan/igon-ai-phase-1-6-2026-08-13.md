# IGON AI — Phase 1.6

A specialized Sri Lankan A/L Engineering Technology learning engine layered on the existing TriniAI shell. Scoped so v1 is genuinely usable end-to-end; the heaviest content pipelines land as follow-ups.

## Scope for v1

In:
- Learn module rebuilt around 3 subjects: ET, SFT, ICT.
- Syllabus tree: Subject → Unit → Lesson → Topic, with seeded starter content (English first; Sinhala/Tamil fields present but empty).
- Topic study view: notes, definitions, formula sheet, flashcards, MCQs, AI Tutor scoped to that topic.
- AI Tutor pinned to the student's current subject/unit/lesson/topic and mastery level.
- Exam Mode: MCQ + structured practice, timed option, instant marking, stored report.
- Resource library per topic: uploads (PDF/DOCX/PPTX/TXT/images), YouTube links, personal notes.
- Analytics: completion %, average quiz score, weak/strong topics, exam readiness score.
- Personalized daily/weekly study plan generated from analytics.
- Career guidance: top degree programmes, certifications, skills, and an A/L → career roadmap.

Deferred (shown as clearly-labelled upcoming cards):
- Video transcription and teacher-uploaded video hosting.
- Full Sinhala/Tamil content translation.
- Complete past-paper corpus and marking-scheme parsing (a few seeded references only).

## Screens

```text
/learn                                  Subject picker (ET / SFT / ICT)
/learn/$subject                         Overview, units, progress widgets
/learn/$subject/$unit                   Lesson list
/learn/$subject/$unit/$lesson           Lesson overview + topics
/learn/$subject/$unit/$lesson/$topic    Study view: Notes | Flashcards | Quiz | Tutor | Resources
/learn/exam                             Exam mode: pick → run → report
/learn/plan                             Daily / weekly study plan
/learn/analytics                        Cross-subject dashboard
/learn/career                           Career guidance roadmap
```

The existing Learn stub pages are replaced by these.

## Data model (Turso)

New tables, additive to the current schema file: `subjects`, `units`, `lessons`, `topics`, `resources`, `past_papers`, `model_papers`, `quizzes`, `flashcards`, `videos`, `student_notes`, `study_sessions`, `revision_history`, plus `topic_progress` for per-student mastery.

Content tables carry a `lang` column (default `en`) so other languages drop in later without a redesign. Every stream-specific row hangs off `subjects.stream`, so adding Bio/Maths streams later is data, not code.

## Server logic

New server functions under `src/lib/learn/`, all authenticated, all deriving `user_id` from the verified session rather than the client:

- syllabus reads (subjects, units, lessons, topics)
- progress + mastery updates, weak-topic detection, exam-readiness score
- quiz start/submit with server-side grading
- flashcard scheduling (lightweight spaced repetition)
- personal notes save/load
- resource listing, link add, file upload to a private storage bucket
- study-plan generation and career recommendations via the existing AI gateway

## AI Tutor behaviour

The tutor is prompted as an A/L Engineering Technology teacher: it follows the Sri Lankan syllabus and exam terminology, answers in marking-scheme style, uses worked examples, and always knows which unit/lesson/topic the student is on and how strong they are on it. Off-syllabus questions get a short answer then a nudge back.

## Scoring

- Completion % = completed topics / total topics.
- Quiz average = mean score across quiz sessions.
- Exam readiness = 40% completion + 40% quiz average + 20% flashcard retention.
- Weak topics = lowest mastery with at least one attempt.

## Seed content

A one-time seed inserts the 3 subjects, ~4 units each with real syllabus unit titles, 2–3 lessons per unit, a topic per lesson with definitions and formulas, plus 3 MCQs and 3 flashcards per topic and a couple of official past-paper references per subject. Enough to demo every screen with real content.

## Navigation

Sidebar Learn entry becomes: Subjects, Exam Mode, Study Plan, Analytics, Career. The home dashboard gains a "Continue learning" card pointing at the last topic touched.

## Guardrails

- No changes to auth, the Trinity model router, MCP, or the admin area.
- No new AI providers; tutor, plan, and career use the existing gateway.
- Uploads go to a private bucket with per-owner access rules.
- Architecture stays stream-agnostic so future streams are added as data.

## Build order

1. Schema additions, storage bucket, seed script.
2. Server functions.
3. Routes and shared components (subject cards, topic tabs, quiz runner, flashcard deck, tutor panel, plan view, career roadmap, analytics grid).
4. Sidebar + home wiring, remove old stubs.
5. Signed-in smoke test: ET → unit → 3-question MCQ → report.
