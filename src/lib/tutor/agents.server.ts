// Agent Kernel use case: Engineering Technology tutor agents. Server-only.
//
//   File Agent  → extract + classify the uploaded lesson material
//   Study Agent → explain, structure notes, mark exam-important points
//   Quiz Agent  → generate syllabus-style questions
//   Judge Agent → grade free/MCQ answers, explain mistakes, detect weak areas
//   Planner     → build the next revision plan from the detected weaknesses
//
// Every agent runs through the Trinity router so provider fallback
// (NVIDIA → Hugging Face → OpenRouter → Lovable gateway) is preserved.
import { generateText, type LanguageModel } from "ai";
import { buildModel } from "@/lib/trinity/router.server";
import { getModel, type ThinkingMode } from "@/lib/trinity/models";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const REASONING = ["nvidia-deepseek-r1", "hf-deepseek-v3", "deepseek-v3"];
const FAST = ["hf-deepseek-v3", "deepseek-v3", "nvidia-deepseek-r1"];

function gatewayFallback(): LanguageModel | null {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;
  return createLovableAiGatewayProvider(key)("google/gemini-3.6-flash");
}

function pick(ids: string[]): { model: LanguageModel; label: string } {
  for (const id of ids) {
    const def = getModel(id);
    if (!def) continue;
    const built = buildModel(def);
    if (built) return { model: built, label: def.label };
  }
  const fb = gatewayFallback();
  if (!fb) throw new Error("no_model_available");
  return { model: fb, label: "Lovable AI" };
}

/** Thinking mode decides whether we spend a reasoning model on the task. */
function modelFor(mode: ThinkingMode, heavy: boolean) {
  if (mode === "normal") return pick(FAST);
  if (mode === "high" || heavy) return pick(REASONING);
  return pick(heavy ? REASONING : FAST);
}

function parseJson<T>(text: string): T | null {
  const fenced = text.replace(/```json|```/g, "");
  const start = fenced.search(/[[{]/);
  if (start === -1) return null;
  const slice = fenced.slice(start);
  for (let end = slice.length; end > 1; end--) {
    const candidate = slice.slice(0, end).trim();
    if (!/[\]}]$/.test(candidate)) continue;
    try {
      return JSON.parse(candidate) as T;
    } catch {
      /* keep shrinking */
    }
  }
  return null;
}

async function jsonAgent<T>(
  model: LanguageModel,
  system: string,
  prompt: string,
): Promise<T | null> {
  const { text } = await generateText({
    model,
    system: `${system}\n\nRespond with STRICT JSON only. No prose, no markdown fences.`,
    prompt,
    temperature: 0.2,
  });
  return parseJson<T>(text);
}

/** Keep prompts inside a safe budget for small-context providers. */
function clip(text: string, max = 14000) {
  return text.length <= max ? text : `${text.slice(0, max)}\n...[truncated]`;
}

// ────────────────────────────── File Agent ──────────────────────────────

export interface DocFacts {
  subject: string;
  topic: string;
  keywords: string[];
  clean_excerpt: string;
}

export async function fileAgent(raw: string, mode: ThinkingMode): Promise<DocFacts> {
  const { model } = modelFor(mode, false);
  const out = await jsonAgent<DocFacts>(
    model,
    `You are the File Agent of TriniAI, working on Sri Lankan G.C.E. A/L Engineering Technology material (ET, SFT, ICT).
Read the raw extracted document text, drop headers/footers/page numbers/OCR noise, and classify it.
Schema: {"subject":"ET|SFT|ICT|Other","topic":"short lesson title","keywords":["..."],"clean_excerpt":"the cleaned, most relevant 1500-3000 characters of teaching content"}`,
    clip(raw),
  );
  return {
    subject: out?.subject || "Other",
    topic: out?.topic || "Uploaded lesson",
    keywords: Array.isArray(out?.keywords) ? out!.keywords.slice(0, 12) : [],
    clean_excerpt: out?.clean_excerpt?.trim() || clip(raw, 4000),
  };
}

// ────────────────────────────── Study Agent ─────────────────────────────

export interface StudyOutput {
  summary: string;
  explanation: string;
  notes: string[];
  exam_points: string[];
  concepts: { term: string; meaning: string }[];
}

export async function studyAgent(
  facts: DocFacts,
  studentContext: string,
  mode: ThinkingMode,
): Promise<{ out: StudyOutput; model: string }> {
  const { model, label } = modelFor(mode, true);
  const out = await jsonAgent<StudyOutput>(
    model,
    `You are the Study Agent of TriniAI, an Engineering Technology teacher for Sri Lankan A/L students.
Teach the lesson in simple English, using short sentences and concrete examples. Include formulas where relevant.
Schema: {"summary":"2-3 sentences","explanation":"markdown explanation, 400-900 words, with headings and examples","notes":["revision note", "..."],"exam_points":["exam-important point", "..."],"concepts":[{"term":"","meaning":""}]}`,
    `Subject: ${facts.subject}\nTopic: ${facts.topic}\nStudent context: ${studentContext || "none"}\n\nLesson material:\n"""\n${clip(facts.clean_excerpt)}\n"""`,
  );
  return {
    out: {
      summary: out?.summary || "",
      explanation: out?.explanation || "",
      notes: Array.isArray(out?.notes) ? out!.notes : [],
      exam_points: Array.isArray(out?.exam_points) ? out!.exam_points : [],
      concepts: Array.isArray(out?.concepts) ? out!.concepts : [],
    },
    model: label,
  };
}

// ────────────────────────────── Quiz Agent ──────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer_index: number;
  concept: string;
  explanation: string;
}

export async function quizAgent(
  facts: DocFacts,
  count: number,
  mode: ThinkingMode,
): Promise<{ questions: QuizQuestion[]; model: string }> {
  const { model, label } = modelFor(mode, true);
  const out = await jsonAgent<{ questions: QuizQuestion[] }>(
    model,
    `You are the Quiz Agent of TriniAI. Write A/L Engineering Technology MCQs in the style of past papers.
Every question must be answerable from the lesson material. Exactly 4 options each.
Schema: {"questions":[{"question":"","options":["","","",""],"answer_index":0,"concept":"the concept tested","explanation":"why the answer is correct"}]}`,
    `Write ${count} questions.\nSubject: ${facts.subject}\nTopic: ${facts.topic}\n\nLesson material:\n"""\n${clip(facts.clean_excerpt, 9000)}\n"""`,
  );
  const questions = (out?.questions ?? [])
    .filter((q) => q?.question && Array.isArray(q.options) && q.options.length >= 2)
    .slice(0, count)
    .map((q, i) => ({
      id: `q${i + 1}`,
      question: String(q.question),
      options: q.options.slice(0, 4).map(String),
      answer_index: Math.max(0, Math.min(q.options.length - 1, Number(q.answer_index) || 0)),
      concept: q.concept ? String(q.concept) : facts.topic,
      explanation: q.explanation ? String(q.explanation) : "",
    }));
  return { questions, model: label };
}

// ───────────────────────── Judge / Evaluation Agent ─────────────────────

export interface GradedAnswer {
  id: string;
  correct: boolean;
  concept: string;
  chosen: number;
  correctIndex: number;
  feedback: string;
}

export interface Evaluation {
  results: GradedAnswer[];
  score: number;
  total: number;
  weakAreas: string[];
  coaching: string;
}

/** Grading is deterministic; the model only writes the mistake explanations. */
export async function judgeAgent(
  questions: QuizQuestion[],
  answers: Record<string, number>,
  mode: ThinkingMode,
): Promise<Evaluation> {
  const results: GradedAnswer[] = questions.map((q) => {
    const chosen = answers[q.id] ?? -1;
    const correct = chosen === q.answer_index;
    return {
      id: q.id,
      correct,
      concept: q.concept,
      chosen,
      correctIndex: q.answer_index,
      feedback: correct ? "Correct." : q.explanation,
    };
  });

  const score = results.filter((r) => r.correct).length;
  const weakAreas = Array.from(
    new Set(results.filter((r) => !r.correct).map((r) => r.concept)),
  ).slice(0, 8);

  let coaching = "";
  if (weakAreas.length > 0) {
    try {
      const { model } = modelFor(mode, false);
      const wrong = results
        .filter((r) => !r.correct)
        .map((r) => {
          const q = questions.find((x) => x.id === r.id)!;
          return `Q: ${q.question}\nStudent chose: ${q.options[r.chosen] ?? "no answer"}\nCorrect: ${q.options[r.correctIndex]}`;
        })
        .join("\n\n");
      const { text } = await generateText({
        model,
        system:
          "You are the Evaluation Agent of TriniAI. In under 150 words of plain markdown, explain what misunderstanding caused these mistakes and how the student should fix it. Be encouraging and specific.",
        prompt: wrong,
        temperature: 0.3,
      });
      coaching = text.trim();
    } catch {
      coaching = "";
    }
  }

  return { results, score, total: questions.length, weakAreas, coaching };
}

// ───────────────────────────── Planner Agent ────────────────────────────

export interface StudyPlanDay {
  day: string;
  focus: string;
  tasks: string[];
  minutes: number;
}

export interface StudyPlan {
  headline: string;
  next_topic: string;
  days: StudyPlanDay[];
}

export async function plannerAgent(
  facts: DocFacts,
  evaluation: Evaluation,
  daysAvailable: number,
  mode: ThinkingMode,
): Promise<StudyPlan> {
  const { model } = modelFor(mode, false);
  const out = await jsonAgent<StudyPlan>(
    model,
    `You are the Planner Agent of TriniAI. Build a realistic revision plan for an A/L Engineering Technology student.
Schema: {"headline":"one line","next_topic":"what to revise first","days":[{"day":"Day 1","focus":"","tasks":["",""],"minutes":60}]}`,
    `Subject: ${facts.subject}\nTopic: ${facts.topic}\nQuiz score: ${evaluation.score}/${evaluation.total}\nWeak areas: ${evaluation.weakAreas.join(", ") || "none"}\nDays until exam: ${daysAvailable}`,
  );
  const fallbackFocus = evaluation.weakAreas[0] ?? facts.topic;
  return {
    headline: out?.headline || `Revise ${fallbackFocus} first`,
    next_topic: out?.next_topic || fallbackFocus,
    days: Array.isArray(out?.days) && out!.days.length > 0
      ? out!.days.slice(0, 14).map((d, i) => ({
          day: d.day || `Day ${i + 1}`,
          focus: d.focus || fallbackFocus,
          tasks: Array.isArray(d.tasks) ? d.tasks : [],
          minutes: Number(d.minutes) || 45,
        }))
      : [
          {
            day: "Day 1",
            focus: fallbackFocus,
            tasks: ["Re-read the revision notes", "Redo the failed questions"],
            minutes: 45,
          },
        ],
  };
}
