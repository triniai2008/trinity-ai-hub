import { createFileRoute } from "@tanstack/react-router";
import {
  TRINITY_ROLES,
  PROVIDERS,
  THINKING_MODES,
  ROUTING,
  FALLBACK_CHAIN,
  MCP_TOOLS,
  DEEP_RESEARCH_FLOW,
  RAG_FLOW,
  RAG_STACK,
  CONSENSUS_MODELS,
  CONSENSUS_OPTIONS,
} from "@/lib/trinity/architecture";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/models/architecture")({
  head: () => ({
    meta: [
      { title: "Trinity 1.0 Architecture — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ArchitecturePage,
});

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border px-6 py-10 first:border-t-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {caption ? (
            <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function Card({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-medium">{title}</div>
        {meta ? (
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {meta}
          </div>
        ) : null}
      </div>
      {children ? (
        <div className="mt-2 text-xs text-muted-foreground">{children}</div>
      ) : null}
    </div>
  );
}

function Flow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <div key={s + i} className="flex items-center gap-2">
          <span className="rounded-md border border-border bg-card px-3 py-1.5 text-xs">
            {s}
          </span>
          {i < steps.length - 1 ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ArchitecturePage() {
  return (
    <div className="flex-1">
      {/* Hero */}
      <div className="border-b border-border px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Trinity 1.0
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Model Architecture
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Trinity 1.0 is not a language model. It is the router, judge, consensus,
            memory, preference and tool orchestration layer that picks the best
            model for every task — automatically.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Many Models", "Many Agents", "Many Tools", "One Mind"].map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Roles */}
      <Section
        title="Trinity 1.0 Core Roles"
        caption="What Trinity does behind every request."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRINITY_ROLES.map((r) => (
            <Card key={r.key} title={r.label}>
              {r.description}
            </Card>
          ))}
        </div>
      </Section>

      {/* Providers */}
      <Section
        title="AI Providers"
        caption="Primary, secondary, local, custom, and supported providers."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROVIDERS.map((p) => (
            <Card key={p.key} title={p.label} meta={p.tier}>
              {p.description}
            </Card>
          ))}
        </div>
      </Section>

      {/* Thinking modes */}
      <Section
        title="Thinking Modes"
        caption="Trade speed for quality on demand."
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {THINKING_MODES.map((m) => (
            <div
              key={m.key}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-medium">{m.label} Mode</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {m.models} model{m.models === "1" ? "" : "s"}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{m.purpose}</div>
              <Flow steps={m.flow} />
            </div>
          ))}
        </div>
      </Section>

      {/* Routing */}
      <Section
        title="Model Routing"
        caption="The best model per task — auto-selected by the Trinity Router."
      >
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Task</th>
                <th className="px-4 py-2 font-medium">Default</th>
                <th className="px-4 py-2 font-medium">Secondary</th>
                <th className="px-4 py-2 font-medium">Premium / Tools</th>
              </tr>
            </thead>
            <tbody>
              {ROUTING.map((r) => (
                <tr key={r.task} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.label}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.default}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.secondary ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.premium ?? r.tools?.join(" · ") ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Multi-model consensus */}
      <Section
        title="Multi-Model Consensus"
        caption="High-thinking workflow blending multiple model perspectives."
      >
        <div className="space-y-4">
          <Flow steps={["User Prompt", ...CONSENSUS_MODELS, "Judge Agent", "Consensus Engine", "Best Answer"]} />
          <div className="flex flex-wrap gap-2">
            {CONSENSUS_OPTIONS.map((o) => (
              <span
                key={o}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
              >
                {o}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* Deep research */}
      <Section
        title="Deep Research"
        caption="Perplexity-style reports with sources and citations."
      >
        <Flow steps={DEEP_RESEARCH_FLOW} />
        <div className="mt-4 flex flex-wrap gap-2">
          {["Sources", "Citations", "Summaries", "Comparisons", "Fact checking"].map((f) => (
            <span
              key={f}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
            >
              {f}
            </span>
          ))}
        </div>
      </Section>

      {/* RAG */}
      <Section title="RAG System" caption="Retrieval-augmented memory and search.">
        <div className="space-y-4">
          <Flow steps={RAG_FLOW} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card title="Embeddings">{RAG_STACK.embeddings.join(" · ")}</Card>
            <Card title="Vector DB">{RAG_STACK.vectorDb.join(" · ")}</Card>
            <Card title="Searches">{RAG_STACK.searches.join(" · ")}</Card>
          </div>
        </div>
      </Section>

      {/* MCP */}
      <Section
        title="MCP Ecosystem"
        caption="External tools Trinity can route to."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MCP_TOOLS.map((t) => (
            <Card
              key={t.name}
              title={t.name}
              meta={t.perms.join(" / ")}
            >
              {t.purpose}
            </Card>
          ))}
        </div>
      </Section>

      {/* Fallback */}
      <Section
        title="Fallback System"
        caption="Reliability across providers — if one fails, the next takes over."
      >
        <Flow steps={FALLBACK_CHAIN} />
      </Section>

      {/* Philosophy */}
      <Section title="Philosophy">
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="text-sm text-muted-foreground">Many Models.</div>
          <div className="text-sm text-muted-foreground">Many Agents.</div>
          <div className="text-sm text-muted-foreground">Many Tools.</div>
          <div className="mt-2 text-base font-semibold">One Mind.</div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Powered by Trinity 1.0
          </div>
        </div>
      </Section>
    </div>
  );
}
