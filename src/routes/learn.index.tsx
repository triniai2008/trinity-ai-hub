import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listSubjects } from "@/lib/learn/learn.functions";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "IGON AI — A/L Engineering Technology Learning Engine" },
      {
        name: "description",
        content:
          "Study ET, SFT and ICT for the Sri Lankan G.C.E. A/L Technology stream with an AI tutor, quizzes and flashcards.",
      },
      { property: "og:title", content: "IGON AI — A/L Technology Learning Engine" },
      { property: "og:description", content: "Syllabus, AI tutor, quizzes and exam readiness for ET, SFT and ICT." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnHome,
});

function LearnHome() {
  const { data, isLoading } = useQuery({
    queryKey: ["learn", "subjects"],
    queryFn: () => listSubjects(),
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">IGON AI</p>
        <h1 className="text-3xl font-semibold tracking-tight">A/L Technology Stream</h1>
        <p className="text-muted-foreground">
          Syllabus-aligned lessons, AI tutoring, quizzes and exam readiness for Engineering Technology,
          Science for Technology and ICT.
        </p>
      </header>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link to="/learn/analytics" className="rounded-lg border border-border px-3 py-1.5 hover:bg-accent">
          Exam readiness
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading syllabus…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((s) => (
            <Link
              key={s.id}
              to="/learn/subject/$subject"
              params={{ subject: s.id }}
              className="glass rounded-2xl border border-border/60 p-5 transition hover:border-primary/50"
            >
              <div className="text-xs font-medium text-primary">{s.code}</div>
              <h2 className="mt-1 text-lg font-semibold">{s.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {s.topics} topics · {s.questions} questions
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
