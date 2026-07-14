import { Logo } from "@/components/logo";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Code2,
  Compass,
  Bot,
  Cpu,
  Layers,
  Zap,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TriniAI — Many Models. Many Tools. One Mind." },
      {
        name: "description",
        content:
          "An AI operating system that combines 30+ models, agents, and tools into one glass-minimal workspace. Powered by Trinity 1.0.",
      },
      { property: "og:title", content: "TriniAI — One mind for every model" },
      {
        property: "og:description",
        content:
          "Chat, code, research, and create — routed automatically to the best model. Powered by Trinity 1.0.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Sparkles, title: "Imagine", body: "Images, video, music, voice and 3D from a single prompt." },
  { icon: Code2, title: "Code", body: "A Cursor-class workspace with AI assist, preview and deploy." },
  { icon: Compass, title: "Explore", body: "Deep research, PDF reader, flashcards, mind maps, quizzes." },
  { icon: Bot, title: "Agents", body: "Specialised agents for research, coding, audio, video, planning." },
];

const PILLARS = [
  { icon: Cpu, k: "30+", label: "Models orchestrated" },
  { icon: Layers, k: "14", label: "Trinity pipeline steps" },
  { icon: Zap, k: "<1s", label: "Median first token" },
  { icon: Shield, k: "0", label: "Keys exposed to client" },
];

const MODELS = [
  "GPT-5", "Claude 3.5", "Gemini 2.5 Pro", "DeepSeek V3", "Llama 4",
  "Qwen 3", "Nemotron Ultra", "Mistral", "Gemma 3", "FLUX.1", "Whisper", "Hunyuan3D",
];

function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      {/* Aurora background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[oklch(0.62_0.19_256/0.35)] blur-[120px] animate-aurora" />
        <div className="absolute top-1/3 -right-40 h-[560px] w-[560px] rounded-full bg-[oklch(0.72_0.16_300/0.30)] blur-[120px] animate-aurora [animation-delay:-6s]" />
        <div className="absolute bottom-0 left-1/3 h-[460px] w-[460px] rounded-full bg-[oklch(0.75_0.14_200/0.28)] blur-[120px] animate-aurora [animation-delay:-12s]" />
        <div className="absolute inset-0 grid-noise opacity-60" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40">
        <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl glass px-4 py-2.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 rounded-lg" />
            <span className="text-sm font-semibold tracking-tight">TriniAI</span>
            <span className="ml-2 hidden rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              Trinity 1.0
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth">
                Get started <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-24 pb-24 text-center sm:pt-32">
          <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Trinity 1.0 · auto-routing across 30+ models
          </div>
          <h1 className="animate-fade-in text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Many models. Many tools.
            <br />
            <span className="text-gradient animate-gradient-x">One mind.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
            TriniAI routes every prompt to the best model automatically — chat,
            code, research, imagine — inside one glass-minimal workspace.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2 rounded-full shadow-lg shadow-primary/20">
              <Link to="/auth">
                Start chatting <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full glass">
              <Link to="/auth">See the pipeline</Link>
            </Button>
          </div>

          {/* Marquee of model names */}
          <div className="relative mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-[gradient-x_30s_linear_infinite] gap-2 whitespace-nowrap">
              {[...MODELS, ...MODELS].map((m, i) => (
                <span
                  key={i}
                  className="rounded-full glass px-3 py-1 text-xs text-muted-foreground"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Pillar stats */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="glass-card rounded-2xl p-5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="mt-3 text-2xl font-semibold tracking-tight">{p.k}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features grid */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              An operating system for thought
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Four surfaces, one identity, one router. Everything you'd open a
              tab for — collapsed into one calm workspace.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl glass-card p-5 transition hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pipeline preview */}
        <section className="mx-auto max-w-5xl px-6 pb-28">
          <div className="glass-card relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                  Trinity 1.0 pipeline
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  14 steps. Zero configuration.
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Classify → enhance → plan → race the top models in parallel →
                  judge → verify → stream the winner. All in under a second.
                </p>
                <Button asChild className="mt-6 rounded-full" size="sm">
                  <Link to="/auth">
                    Try it live <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <ol className="space-y-2 text-sm">
                {[
                  "Classify intent",
                  "Enhance prompt",
                  "Route to models",
                  "Race in parallel",
                  "Judge & consensus",
                  "Stream winner",
                ].map((s, i) => (
                  <li
                    key={s}
                    className="flex items-center gap-3 rounded-xl glass px-4 py-2.5"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-5 rounded" />
            <span>© {new Date().getFullYear()} TriniAI — Trinity 1.0</span>
          </div>
          <div className="opacity-80">One mind for every model.</div>
        </div>
      </footer>
    </div>
  );
}
