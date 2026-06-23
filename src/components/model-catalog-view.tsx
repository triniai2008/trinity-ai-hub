import { useMemo, useState } from "react";
import { CATALOG, type ModelCategory, type ModelEntry, type ModelSource } from "@/lib/trinity/catalog";
import { cn } from "@/lib/utils";
import { Search, Star, Zap, Cloud, HardDrive, Cpu, Sparkles, Check } from "lucide-react";

const SOURCE_META: Record<ModelSource, { label: string; icon: typeof Cloud; className: string }> = {
  openrouter: { label: "OpenRouter", icon: Cloud, className: "text-sky-500" },
  huggingface: { label: "Hugging Face", icon: Sparkles, className: "text-amber-500" },
  lovable: { label: "Lovable AI", icon: Zap, className: "text-violet-500" },
  ollama: { label: "Ollama", icon: HardDrive, className: "text-emerald-500" },
  internal: { label: "Trinity", icon: Cpu, className: "text-foreground" },
};

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-3 w-3", i < n ? "fill-foreground text-foreground" : "text-muted-foreground/30")} />
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: ModelSource }) {
  const m = SOURCE_META[source];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      <Icon className={cn("h-3 w-3", m.className)} />
      {m.label}
    </span>
  );
}

function ModelRow({ model, isDefault }: { model: ModelEntry; isDefault: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/40 px-3 py-2.5 transition-colors hover:bg-card">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-xs font-bold">
          {model.vendor[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{model.name}</span>
            {isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-foreground">
                <Check className="h-2.5 w-2.5" /> Default
              </span>
            )}
            {model.tier === "premium" && (
              <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Premium
              </span>
            )}
            {model.tier === "lightweight" && (
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Light
              </span>
            )}
            {model.tier === "local" && (
              <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Local
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{model.vendor}</span>
            <span>•</span>
            <span className="font-mono">{model.id}</span>
            {model.context && (
              <>
                <span>•</span>
                <span>{(model.context / 1000).toFixed(0)}K ctx</span>
              </>
            )}
            {model.notes && (
              <>
                <span>•</span>
                <span>{model.notes}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize",
            model.speed === "fast" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            model.speed === "balanced" && "bg-sky-500/10 text-sky-600 dark:text-sky-400",
            model.speed === "slow" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
          )}
        >
          {model.speed}
        </span>
        <SourceBadge source={model.source} />
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: ModelCategory }) {
  return (
    <section className="rounded-2xl border border-border bg-card/30 p-5">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{category.label}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{category.purpose.join(" • ")}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Stars n={category.priority} />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Default: {category.models.find((m) => m.id === category.defaultId)?.name}
          </span>
        </div>
      </header>
      <div className="space-y-2">
        {category.models.map((m) => (
          <ModelRow key={m.id} model={m} isDefault={m.id === category.defaultId} />
        ))}
      </div>
    </section>
  );
}

const SOURCE_FILTERS: Array<{ key: ModelSource | "all"; label: string }> = [
  { key: "all", label: "All sources" },
  { key: "openrouter", label: "OpenRouter" },
  { key: "huggingface", label: "Hugging Face" },
  { key: "lovable", label: "Lovable AI" },
  { key: "ollama", label: "Ollama" },
];

export function ModelCatalogView({
  title,
  description,
  sourceFilter,
  lockSource = false,
}: {
  title: string;
  description: string;
  sourceFilter?: ModelSource | "all";
  lockSource?: boolean;
}) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState<ModelSource | "all">(sourceFilter ?? "all");

  const filtered = useMemo(() => {
    return CATALOG.map((cat) => ({
      ...cat,
      models: cat.models.filter((m) => {
        const matchesSource = source === "all" || m.source === source;
        const matchesQ =
          !q ||
          m.name.toLowerCase().includes(q.toLowerCase()) ||
          m.vendor.toLowerCase().includes(q.toLowerCase()) ||
          m.id.toLowerCase().includes(q.toLowerCase());
        return matchesSource && matchesQ;
      }),
    })).filter((c) => c.models.length > 0);
  }, [q, source]);

  const totalModels = filtered.reduce((acc, c) => acc + c.models.length, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Trinity 1.0 • Model Catalog</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search models, vendors, IDs…"
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        {!lockSource && (
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1">
            {SOURCE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setSource(f.key)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  source === f.key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4 text-xs text-muted-foreground">
        {filtered.length} categories • {totalModels} models
      </div>

      <div className="space-y-5">
        {filtered.map((cat) => (
          <CategoryCard key={cat.key} category={cat} />
        ))}
      </div>

      <footer className="mt-10 rounded-2xl border border-dashed border-border bg-card/20 p-6 text-center">
        <div className="text-sm font-semibold">Many Models. Many Agents. Many Tools. One Mind.</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Trinity 1.0 picks the best model for each task automatically — you can always override per chat.
        </p>
      </footer>
    </div>
  );
}
