import { Logo } from "@/components/logo";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Code2, Compass, Bot } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TriniAI — Many Models. Many Tools. One Mind." },
      {
        name: "description",
        content:
          "An AI operating system that combines many models, agents, and tools into one simple interface. Powered by Trinity 1.0.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Sparkles, title: "Imagine", body: "Generate images, video, music, voice, and 3D from a single prompt." },
  { icon: Code2, title: "Code", body: "A Cursor-like coding workspace with AI assist, preview, and deploy." },
  { icon: Compass, title: "Explore", body: "Deep research, PDF reader, flashcards, mind maps, and quizzes." },
  { icon: Bot, title: "Agents", body: "Specialized agents for research, coding, audio, video, planning, and more." },
];

function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Logo className="h-9 w-9 rounded-lg" />
          <span className="text-sm font-semibold tracking-tight">TriniAI</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-6 pt-20 pb-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            Powered by Trinity 1.0
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            Many models. Many tools.
            <br />
            <span className="text-muted-foreground">One mind.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
            TriniAI is an AI operating system for students, creators, developers and researchers — chat, code, research, and create from one elegant workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth">
                Start chatting <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Create account</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-card p-6">
                  <Icon className="h-5 w-5" />
                  <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-border px-6 py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} TriniAI — Trinity 1.0
      </footer>
    </div>
  );
}
