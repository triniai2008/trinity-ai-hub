import { AppShell } from "@/components/app-shell";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export function ModuleStub({
  title,
  subtitle,
  icon: Icon,
  pages,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  pages: string[];
}) {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-1">
          <Link to="/home">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Construction className="h-4 w-4" /> Coming soon
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            This module is part of the TriniAI roadmap and will ship in an upcoming release.
          </p>

          <div className="mt-6">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Planned pages
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {pages.map((p) => (
                <div
                  key={p}
                  className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground"
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
