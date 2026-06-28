import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { findModule } from "@/lib/modules";
import { ChevronRight } from "lucide-react";

export function ModuleLayout({ moduleKey }: { moduleKey: string }) {
  const mod = findModule(moduleKey);
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!mod) {
    return (
      <AppShell>
        <div className="p-6 text-sm text-muted-foreground">Unknown module.</div>
      </AppShell>
    );
  }

  const Icon = mod.icon;

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-4rem)] md:h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
          <div className="flex items-center gap-2 px-4 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card">
              <Icon className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">{mod.label}</div>
              <div className="text-[10px] text-muted-foreground">{mod.description}</div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-4">
            <ul className="space-y-0.5">
              {mod.pages.map((p) => {
                const to = p.slug ? `${mod.path}/${p.slug}` : mod.path;
                const active =
                  p.slug === ""
                    ? path === mod.path || path === `${mod.path}/`
                    : path === to || path.startsWith(`${to}/`);
                return (
                  <li key={p.slug || "index"}>
                    <Link
                      to={to}
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                        active && "bg-sidebar-accent text-foreground",
                      )}
                    >
                      <span className="flex-1 truncate">{p.label}</span>
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </AppShell>
  );
}

import { Sparkles, Zap, Layers, Brain, Plus, ArrowUpRight, Activity } from "lucide-react";

// Deterministic content generators — no per-page files needed.
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function highlights(seed: string) {
  const pool = [
    { icon: Sparkles, title: "Trinity-routed", body: "Picks the best model for every task automatically." },
    { icon: Brain, title: "Memory aware", body: "Remembers your preferences across sessions." },
    { icon: Layers, title: "Multi-agent", body: "Research, Coding, Memory and Judge agents collaborate." },
    { icon: Zap, title: "Streamed", body: "Low-latency token streaming with graceful fallback." },
    { icon: Activity, title: "Always-on", body: "Background jobs and autonomous task scheduling." },
  ];
  const h = hash(seed);
  return [pool[h % pool.length], pool[(h >> 3) % pool.length], pool[(h >> 6) % pool.length]];
}

function rows(seed: string, label: string) {
  const verbs = ["Generated", "Indexed", "Routed", "Summarized", "Connected", "Trained", "Synced"];
  const nouns = ["chat", "document", "embedding", "workflow", "agent run", "MCP call", "memory"];
  const h = hash(seed + label);
  return Array.from({ length: 5 }).map((_, i) => {
    const v = verbs[(h + i * 7) % verbs.length];
    const n = nouns[(h + i * 11) % nouns.length];
    const mins = ((h + i * 13) % 58) + 1;
    return { id: i, title: `${v} ${n}`, meta: `${mins}m ago · Trinity 1.0` };
  });
}

export function SubPageStub({
  moduleKey,
  slug,
}: {
  moduleKey: string;
  slug: string;
}) {
  const mod = findModule(moduleKey);
  const page = mod?.pages.find((p) => p.slug === slug);
  if (!mod || !page) {
    return <div className="p-8 text-sm text-muted-foreground">Page not found.</div>;
  }
  const Icon = mod.icon;
  const seed = `${moduleKey}/${slug}`;
  const tiles = highlights(seed);
  const items = rows(seed, page.label);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{mod.label}</div>
            <h1 className="text-2xl font-semibold tracking-tight">{page.label}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{page.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/chat"
            search={{ seed: `New ${page.label.toLowerCase()}` }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-sidebar-accent"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </Link>
          <Link
            to="/chat"
            search={{ seed: `Open ${mod.label} → ${page.label} in Trinity` }}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
          >
            Open in Trinity <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>

      {/* Highlight tiles */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {tiles.map((t, i) => {
          const TIcon = t.icon;
          return (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border">
                <TIcon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-sm font-medium">{t.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t.body}</div>
            </div>
          );
        })}
      </div>

      {/* Activity list */}
      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-medium">Recent activity</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Preview</div>
        </div>
        <ul className="divide-y divide-border">
          {items.map((row) => (
            <li key={row.id} className="flex items-center gap-3 px-4 py-3 hover:bg-sidebar-accent/50">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm">{row.title}</div>
                <div className="text-[11px] text-muted-foreground">{row.meta}</div>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </div>

      {/* Footer note */}
      <div className="mt-6 rounded-xl border border-dashed border-border bg-card/40 p-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Preview surface.</span> Live data, actions and
        streaming for <span className="text-foreground">{page.label}</span> are wired through Trinity 1.0
        and the {mod.label} module. Ask Trinity to deepen this page when you're ready.
      </div>
    </div>
  );
}
