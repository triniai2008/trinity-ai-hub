import { createFileRoute } from "@tanstack/react-router";
import {
  STACK,
  TABLES,
  ROLES,
  AUTH_METHODS,
  STORAGE_FLOW,
  SYNC_FEATURES,
  FALLBACK_FLOW,
  LIMITS,
  MODERATION,
  ANALYTICS_METRICS,
  ADMIN_PANEL,
  SECURITY,
  ERROR_HANDLING,
  SCALABILITY,
} from "@/lib/trinity/backend";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/architecture")({
  head: () => ({
    meta: [
      { title: "Backend Architecture — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BackendArchitecturePage,
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
          {caption ? <p className="mt-1 text-sm text-muted-foreground">{caption}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function Flow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <div key={s + i} className="flex items-center gap-2">
          <span className="rounded-md border border-border bg-card px-3 py-1.5 text-xs">{s}</span>
          {i < steps.length - 1 ? <ChevronRight className="h-3 w-3 text-muted-foreground" /> : null}
        </div>
      ))}
    </div>
  );
}

function Card({ title, children, meta }: { title: string; children?: React.ReactNode; meta?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-medium">{title}</div>
        {meta ? <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{meta}</div> : null}
      </div>
      {children ? <div className="mt-2 text-xs text-muted-foreground">{children}</div> : null}
    </div>
  );
}

function Chips({ items }: { items: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <span key={i} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          {i}
        </span>
      ))}
    </div>
  );
}

function BackendArchitecturePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-border px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Trinity 1.0</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Backend Architecture</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Reliable, secure, scalable, simple. The data, auth, sync, moderation, and
            fallback layers that power every Trinity request.
          </p>
          <div className="mt-6">
            <Chips items={["Reliable", "Secure", "Scalable", "Simple"]} />
          </div>
        </div>
      </div>

      <Section title="Stack" caption="What runs where.">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <tbody>
              {STACK.map((s) => (
                <tr key={s.layer} className="border-b border-border last:border-b-0">
                  <td className="w-40 bg-muted/40 px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
                    {s.layer}
                  </td>
                  <td className="px-4 py-2">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Database Tables" caption="Every table is RLS-scoped. Admins read shared logs.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TABLES.map((t) => (
            <Card key={t.name} title={t.name} meta={t.scope}>
              {t.cols.join(", ")}
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Authentication" caption="Supabase Auth + role-based access control.">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Sign-in methods</div>
            <Chips items={AUTH_METHODS} />
          </div>
          <div>
            <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Roles</div>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <Card key={r.key} title={r.label}>
                  {r.desc}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Chat Storage & Sync" caption="Hot path on Turso, cold copies in Sheets, offline in IndexedDB.">
        <div className="space-y-4">
          <Flow steps={STORAGE_FLOW} />
          <Chips items={SYNC_FEATURES} />
        </div>
      </Section>

      <Section title="Fallback Flow" caption="If a provider fails, the next takes over.">
        <Flow steps={FALLBACK_FLOW} />
      </Section>

      <Section title="User Limits" caption="Per-audience caps enforced server-side.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {LIMITS.map((l) => (
            <Card key={l.audience} title={l.audience}>
              {l.tiers.join(" · ")}
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Content Moderation" caption="Automatic detection + tiered actions.">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Detect</div>
            <Chips items={MODERATION.detect} />
          </div>
          <div>
            <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Actions</div>
            <Chips items={MODERATION.actions} />
          </div>
        </div>
      </Section>

      <Section title="Analytics" caption="Tracked in usage_logs and mirrored to Sheets.">
        <Chips items={ANALYTICS_METRICS} />
      </Section>

      <Section title="Admin Panel" caption="One surface for every operational task.">
        <Chips items={ADMIN_PANEL} />
      </Section>

      <Section title="Security" caption="Defense in depth across every layer.">
        <Chips items={SECURITY} />
      </Section>

      <Section title="Error Handling" caption="Fail gracefully, recover automatically.">
        <Chips items={ERROR_HANDLING} />
      </Section>

      <Section title="Scalability" caption={`From ${SCALABILITY.initial} to ${SCALABILITY.future}.`}>
        <Chips items={SCALABILITY.techniques} />
      </Section>

      <Section title="Philosophy">
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="text-sm text-muted-foreground">Reliable. Secure. Scalable. Simple.</div>
          <div className="mt-2 text-sm text-muted-foreground">Many Models. Many Agents. Many Tools.</div>
          <div className="mt-2 text-base font-semibold">One Mind.</div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Powered by Trinity 1.0
          </div>
        </div>
      </Section>
    </div>
  );
}
