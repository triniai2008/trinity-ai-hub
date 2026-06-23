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
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {mod.label}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{page.label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{page.description}</p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center">
        <div className="text-sm font-medium">Coming soon</div>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          This page is scaffolded. Tell Trinity to build it next.
        </p>
      </div>
    </div>
  );
}
