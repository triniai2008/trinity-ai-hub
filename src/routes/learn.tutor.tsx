import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  BookOpen,
  Brain,
  CalendarClock,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teachDocument, buildQuiz, submitQuiz } from "@/lib/tutor/tutor.functions";

export const Route = createFileRoute("/learn/tutor")({
  head: () => ({
    meta: [
      { title: "ET Tutor — IGON AI Learning Engine" },
      {
        name: "description",
        content:
          "Upload an Engineering Technology lesson and let the Agent Kernel teach it, quiz you, find your weak areas and plan your revision.",
      },
      { property: "og:title", content: "ET Tutor — IGON AI Learning Engine" },
      {
        property: "og:description",
        content: "Learn, test and plan A/L Engineering Technology revision with TriniAI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorPage,
});

type Mode = "normal" | "medium" | "high";

interface Lesson {
  documentId: string;
  subject: string;
  topic: string;
  summary: string;
  explanation: string;
  notes: string[];
  exam_points: string[];
  concepts: { term: string; meaning: string }[];
}

interface Quiz {
  quizId: string;
  questions: { id: string; question: string; options: string[] }[];
}

type Result = Awaited<ReturnType<typeof submitQuiz>>;

const STAGES = [
  { key: "file", label: "File Agent", hint: "Extract & classify" },
  { key: "study", label: "Study Agent", hint: "Teach the lesson" },
  { key: "quiz", label: "Quiz Agent", hint: "Test understanding" },
  { key: "plan", label: "Planner Agent", hint: "Fix weak areas" },
] as const;

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 40); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((it) => ("str" in it ? (it as { str: string }).str : ""))
        .join(" "),
    );
  }
  return pages.join("\n\n");
}

function TutorPage() {
  const teach = useServerFn(teachDocument);
  const makeQuiz = useServerFn(buildQuiz);
  const grade = useServerFn(submitQuiz);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [studentContext, setStudentContext] = useState("");
  const [mode, setMode] = useState<Mode>("medium");
  const [days, setDays] = useState(7);

  const [stage, setStage] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback(async (file: File) => {
    setStage("file");
    try {
      const text = file.type === "application/pdf" ? await extractPdfText(file) : await file.text();
      if (text.trim().length < 40) {
        toast.error("No readable text found", {
          description: "This looks like a scanned document. Paste the lesson text instead.",
        });
        return;
      }
      setContent(text.trim());
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      toast.success("Document read", { description: `${text.length.toLocaleString()} characters` });
    } catch {
      toast.error("Could not read that file");
    } finally {
      setStage(null);
    }
  }, [title]);

  async function runTeach() {
    if (content.trim().length < 40) {
      toast.error("Add the lesson content first");
      return;
    }
    setStage("study");
    setLesson(null);
    setQuiz(null);
    setResult(null);
    try {
      const out = await teach({
        data: {
          title: title.trim() || "Untitled lesson",
          content: content.trim(),
          source: "upload",
          studentContext: studentContext.trim() || undefined,
          mode,
        },
      });
      setLesson(out as Lesson);
    } catch (err) {
      toast.error("The tutor could not process this lesson", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setStage(null);
    }
  }

  async function runQuiz() {
    if (!lesson) return;
    setStage("quiz");
    setResult(null);
    setAnswers({});
    try {
      const out = await makeQuiz({ data: { documentId: lesson.documentId, count: 5, mode } });
      setQuiz(out as Quiz);
    } catch (err) {
      toast.error("Quiz generation failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setStage(null);
    }
  }

  async function runGrade() {
    if (!quiz) return;
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error("Answer every question first");
      return;
    }
    setStage("plan");
    try {
      const out = await grade({
        data: { quizId: quiz.quizId, answers, daysUntilExam: days, mode },
      });
      setResult(out);
    } catch (err) {
      toast.error("Evaluation failed", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setStage(null);
    }
  }

  const busy = stage !== null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Engineering Technology Tutor
          </h1>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="size-3" /> Powered by Agent Kernel
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Upload a lesson, get it taught in plain English, take a syllabus-style quiz, and receive a
          revision plan built from your weak areas.
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-4">
        {STAGES.map((s) => {
          const done =
            (s.key === "file" && content.length > 0) ||
            (s.key === "study" && !!lesson) ||
            (s.key === "quiz" && !!quiz) ||
            (s.key === "plan" && !!result);
          const active = stage === s.key;
          return (
            <div
              key={s.key}
              className={`rounded-lg border p-3 text-sm transition-colors ${
                active ? "border-primary bg-primary/5" : done ? "border-primary/40" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {active ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : done ? (
                  <CheckCircle2 className="text-primary size-3.5" />
                ) : (
                  <Brain className="text-muted-foreground size-3.5" />
                )}
                {s.label}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{s.hint}</p>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" /> Lesson material
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Lesson title (e.g. Unit 3 — Mechanisms)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
              >
                <Upload className="mr-2 size-4" /> Upload PDF or notes
              </Button>
            </div>
          </div>

          <Textarea
            placeholder="Or paste the lesson text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-40"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Your level / weak spots (optional)"
              value={studentContext}
              onChange={(e) => setStudentContext(e.target.value)}
            />
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal — fastest</SelectItem>
                <SelectItem value="medium">Medium — balanced</SelectItem>
                <SelectItem value="high">High — deep reasoning</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              max={90}
              value={days}
              onChange={(e) => setDays(Number(e.target.value) || 7)}
              aria-label="Days until exam"
            />
          </div>

          <Button onClick={runTeach} disabled={busy} className="w-full sm:w-auto">
            {stage === "study" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <BookOpen className="mr-2 size-4" />
            )}
            Teach me this lesson
          </Button>
        </CardContent>
      </Card>

      {lesson && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              <Badge>{lesson.subject}</Badge>
              {lesson.topic}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {lesson.summary && <p className="text-muted-foreground text-sm">{lesson.summary}</p>}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{lesson.explanation}</ReactMarkdown>
            </div>

            {lesson.concepts.length > 0 && (
              <>
                <Separator />
                <div className="grid gap-2 sm:grid-cols-2">
                  {lesson.concepts.map((c) => (
                    <div key={c.term} className="rounded-md border p-3 text-sm">
                      <div className="font-medium">{c.term}</div>
                      <p className="text-muted-foreground">{c.meaning}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {lesson.exam_points.length > 0 && (
              <div className="bg-muted/40 rounded-lg border p-4">
                <div className="mb-2 text-sm font-medium">Exam-important points</div>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {lesson.exam_points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.notes.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-medium">Revision notes</div>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {lesson.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={runQuiz} disabled={busy} variant="secondary">
              {stage === "quiz" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Brain className="mr-2 size-4" />
              )}
              Test my understanding
            </Button>
          </CardContent>
        </Card>
      )}

      {quiz && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {quiz.questions.map((q, qi) => {
              const graded = result?.evaluation.results.find((r) => r.id === q.id);
              return (
                <div key={q.id} className="space-y-2">
                  <div className="text-sm font-medium">
                    {qi + 1}. {q.question}
                  </div>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => {
                      const selected = answers[q.id] === oi;
                      const isCorrect = graded && graded.correctIndex === oi;
                      const isWrongPick = graded && graded.chosen === oi && !graded.correct;
                      return (
                        <button
                          key={oi}
                          type="button"
                          disabled={!!result}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                          className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                            isCorrect
                              ? "border-primary bg-primary/10"
                              : isWrongPick
                                ? "border-destructive bg-destructive/10"
                                : selected
                                  ? "border-primary bg-muted"
                                  : "hover:bg-muted/60"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {graded && !graded.correct && graded.feedback && (
                    <p className="text-muted-foreground flex gap-2 text-xs">
                      <XCircle className="text-destructive mt-0.5 size-3.5 shrink-0" />
                      {graded.feedback}
                    </p>
                  )}
                </div>
              );
            })}

            {!result && (
              <Button onClick={runGrade} disabled={busy}>
                {stage === "plan" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 size-4" />
                )}
                Submit answers
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4" /> Your result and revision plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Score {result.evaluation.score}/{result.evaluation.total}
                </span>
                <span className="text-muted-foreground">
                  {Math.round((result.evaluation.score / Math.max(1, result.evaluation.total)) * 100)}%
                </span>
              </div>
              <Progress
                value={(result.evaluation.score / Math.max(1, result.evaluation.total)) * 100}
              />
            </div>

            {result.evaluation.weakAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.evaluation.weakAreas.map((w) => (
                  <Badge key={w} variant="destructive">
                    {w}
                  </Badge>
                ))}
              </div>
            )}

            {result.evaluation.coaching && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result.evaluation.coaching}</ReactMarkdown>
              </div>
            )}

            <Separator />
            <div>
              <div className="text-sm font-medium">{result.plan.headline}</div>
              <p className="text-muted-foreground text-sm">Start with: {result.plan.next_topic}</p>
            </div>
            <div className="grid gap-2">
              {result.plan.days.map((d, i) => (
                <div key={i} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between font-medium">
                    <span>
                      {d.day} — {d.focus}
                    </span>
                    <span className="text-muted-foreground text-xs">{d.minutes} min</span>
                  </div>
                  <ul className="text-muted-foreground mt-1 list-disc space-y-0.5 pl-5">
                    {d.tasks.map((t, ti) => (
                      <li key={ti}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
