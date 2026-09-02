import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getLearnAnalytics } from "@/lib/learn/learn.functions";

export const Route = createFileRoute("/learn/analytics")({
  head: () => ({
    meta: [
      { title: "Exam readiness — Trini AI" },
      { name: "description", content: "Track coverage, mastery and exam readiness across ET, SFT and ICT." },
      { property: "og:title", content: "Exam readiness — Trini AI" },
      { property: "og:description", content: "Personal analytics for your A/L Technology stream preparation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["learn", "analytics"],
    queryFn: () => getLearnAnalytics(),
    retry: false,
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div>
        <Link to="/learn" className="text-xs text-muted-foreground hover:underline">
          ← Back to subjects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Exam readiness</h1>
      </div>

      {isError && <p className="text-sm text-muted-foreground">Sign in to see your personal analytics.</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Crunching your progress…</p>}

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Overall readiness" value={`${data.overallReadiness}%`} />
            <Stat label="Answer accuracy" value={`${data.accuracy}%`} />
            <Stat label="Minutes studied" value={String(data.minutesStudied)} />
          </div>

          <section className="space-y-3">
            {data.bySubject.map((s) => (
              <div key={s.id} className="glass rounded-2xl border border-border/60 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">{s.readiness}% ready</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${s.readiness}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {s.covered}/{s.total} topics touched · avg mastery {s.avgMastery}%
                </p>
              </div>
            ))}
          </section>

          {data.weakTopics.length > 0 && (
            <section className="rounded-2xl border border-border/60 p-5">
              <h2 className="mb-3 text-sm font-semibold">Focus next</h2>
              <ul className="space-y-2 text-sm">
                {data.weakTopics.map((w) => (
                  <li key={w.topicId}>
                    <Link to="/learn/topic/$topicId" params={{ topicId: w.topicId }} className="hover:underline">
                      {w.title}
                    </Link>{" "}
                    <span className="text-muted-foreground">— {w.mastery}% mastery</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl border border-border/60 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
