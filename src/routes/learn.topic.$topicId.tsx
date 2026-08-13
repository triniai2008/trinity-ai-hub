import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getTopic, getQuiz, submitQuiz, markTopic } from "@/lib/learn/learn.functions";

export const Route = createFileRoute("/learn/topic/$topicId")({
  head: () => ({
    meta: [
      { title: "Topic study — IGON AI" },
      { name: "description", content: "Notes, definitions, formulas, flashcards and a graded quiz for this A/L topic." },
      { property: "og:title", content: "Topic study — IGON AI" },
      { property: "og:description", content: "Study notes, flashcards and quizzes for the A/L Technology stream." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TopicPage,
});

function TopicPage() {
  const { topicId } = Route.useParams();
  const [tab, setTab] = useState<"study" | "cards" | "quiz">("study");
  const topic = useQuery({ queryKey: ["learn", "topic", topicId], queryFn: () => getTopic({ data: { topicId } }) });

  if (topic.isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading topic…</p>;
  if (!topic.data) return <p className="p-6 text-sm text-muted-foreground">Topic not found.</p>;
  const t = topic.data;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div>
        <Link to="/learn/subject/$subject" params={{ subject: t.subjectId }} className="text-xs text-muted-foreground hover:underline">
          ← {t.subjectName}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{t.title}</h1>
        <p className="text-xs text-muted-foreground">
          {t.unitTitle} · {t.lessonTitle}
        </p>
      </div>

      <nav className="flex gap-2 text-sm">
        {(["study", "cards", "quiz"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-lg border px-3 py-1.5 capitalize ${tab === k ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}
          >
            {k === "cards" ? "Flashcards" : k}
          </button>
        ))}
      </nav>

      {tab === "study" && <StudyTab topic={t} />}
      {tab === "cards" && <CardsTab cards={t.cards} />}
      {tab === "quiz" && <QuizTab topicId={topicId} subjectId={t.subjectId} />}
    </div>
  );
}

type TopicData = NonNullable<Awaited<ReturnType<typeof getTopic>>>;

function StudyTab({ topic }: { topic: TopicData }) {
  const mark = useMutation({ mutationFn: () => markTopic({ data: { topicId: topic.id, status: "completed" } }) });
  return (
    <div className="space-y-5">
      <article className="glass whitespace-pre-wrap rounded-2xl border border-border/60 p-5 text-sm leading-relaxed">
        {topic.body}
      </article>

      {topic.definitions.length > 0 && (
        <section className="rounded-2xl border border-border/60 p-5">
          <h2 className="mb-3 text-sm font-semibold">Key definitions</h2>
          <dl className="space-y-2 text-sm">
            {topic.definitions.map((d) => (
              <div key={d.term}>
                <dt className="font-medium">{d.term}</dt>
                <dd className="text-muted-foreground">{d.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {topic.formulas.length > 0 && (
        <section className="rounded-2xl border border-border/60 p-5">
          <h2 className="mb-3 text-sm font-semibold">Formulas</h2>
          <ul className="space-y-1 font-mono text-sm">
            {topic.formulas.map((f) => (
              <li key={f.name}>
                <span className="text-muted-foreground">{f.name}:</span> {f.expr}
              </li>
            ))}
          </ul>
        </section>
      )}

      {topic.practicals.length > 0 && (
        <section className="rounded-2xl border border-border/60 p-5">
          <h2 className="mb-3 text-sm font-semibold">Practicals</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {topic.practicals.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      <button
        onClick={() => mark.mutate()}
        disabled={mark.isPending || mark.isSuccess}
        className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60"
      >
        {mark.isSuccess ? "Marked as completed" : "Mark as completed"}
      </button>
    </div>
  );
}

function CardsTab({ cards }: { cards: { id: string; front: string; back: string }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (cards.length === 0) return <p className="text-sm text-muted-foreground">No flashcards yet.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((c) => (
        <button
          key={c.id}
          onClick={() => setOpen(open === c.id ? null : c.id)}
          className="glass rounded-2xl border border-border/60 p-4 text-left text-sm"
        >
          <p className="font-medium">{c.front}</p>
          <p className="mt-2 text-muted-foreground">{open === c.id ? c.back : "Tap to reveal"}</p>
        </button>
      ))}
    </div>
  );
}

function QuizTab({ topicId, subjectId }: { topicId: string; subjectId: string }) {
  const quiz = useQuery({
    queryKey: ["learn", "quiz", topicId],
    queryFn: () => getQuiz({ data: { topicId, count: 5 } }),
  });
  const [choices, setChoices] = useState<Record<string, string>>({});
  const submit = useMutation({
    mutationFn: () =>
      submitQuiz({
        data: {
          answers: Object.entries(choices).map(([id, choice]) => ({ id, choice })),
          subject: subjectId,
          topicId,
          seconds: 0,
          mode: "quiz" as const,
        },
      }),
  });

  if (quiz.isLoading) return <p className="text-sm text-muted-foreground">Loading questions…</p>;
  const questions = quiz.data ?? [];
  if (questions.length === 0) return <p className="text-sm text-muted-foreground">No questions for this topic yet.</p>;

  if (submit.data) {
    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold">
          Score: {submit.data.score} / {submit.data.total}
        </p>
        {submit.data.results.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border/60 p-4 text-sm">
            <p className="font-medium">{r.question}</p>
            <p className={r.correct ? "mt-1 text-emerald-500" : "mt-1 text-red-500"}>
              Your answer: {r.chosen} {r.correct ? "✓" : `✗ — correct: ${r.answer}`}
            </p>
            {r.explanation && <p className="mt-1 text-muted-foreground">{r.explanation}</p>}
          </div>
        ))}
        <button
          onClick={() => {
            setChoices({});
            submit.reset();
            quiz.refetch();
          }}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-2xl border border-border/60 p-4">
          <p className="text-sm font-medium">
            {i + 1}. {q.question}
          </p>
          <div className="mt-2 space-y-1">
            {q.options.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={q.id}
                  checked={choices[q.id] === o}
                  onChange={() => setChoices((c) => ({ ...c, [q.id]: o }))}
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={() => submit.mutate()}
        disabled={Object.keys(choices).length === 0 || submit.isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
      >
        {submit.isPending ? "Grading…" : "Submit answers"}
      </button>
      {submit.isError && <p className="text-sm text-red-500">Sign in to submit and track your progress.</p>}
    </div>
  );
}
