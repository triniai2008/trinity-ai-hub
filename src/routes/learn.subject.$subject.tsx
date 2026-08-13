import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSyllabus } from "@/lib/learn/learn.functions";

export const Route = createFileRoute("/learn/subject/$subject")({
  head: () => ({
    meta: [
      { title: "Subject syllabus — IGON AI" },
      { name: "description", content: "Units, lessons and topics for the A/L Technology stream subject." },
      { property: "og:title", content: "Subject syllabus — IGON AI" },
      { property: "og:description", content: "Units, lessons and topics with AI tutoring and quizzes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubjectPage,
});

function SubjectPage() {
  const { subject } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["learn", "syllabus", subject],
    queryFn: () => getSyllabus({ data: { subject } }),
  });

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading syllabus…</p>;
  if (!data) return <p className="p-6 text-sm text-muted-foreground">Subject not found.</p>;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div>
        <Link to="/learn" className="text-xs text-muted-foreground hover:underline">
          ← All subjects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{data.subject.name}</h1>
        <p className="text-sm text-muted-foreground">{data.subject.description}</p>
      </div>

      <div className="space-y-4">
        {data.units.map((u) => (
          <section key={u.id} className="glass rounded-2xl border border-border/60 p-5">
            <h2 className="font-semibold">{u.title}</h2>
            <p className="text-sm text-muted-foreground">{u.summary}</p>
            <div className="mt-4 space-y-3">
              {u.lessons.map((l) => (
                <div key={l.id} className="rounded-xl border border-border/50 p-3">
                  <h3 className="text-sm font-medium">{l.title}</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {l.topics.map((t) => (
                      <li key={t.id}>
                        <Link
                          to="/learn/topic/$topicId"
                          params={{ topicId: t.id }}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent"
                        >
                          {t.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
