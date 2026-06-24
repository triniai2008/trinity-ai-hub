// Shared minimal primitives used across TriniAI pages.
// Black & white, token-only. No glassmorphism.
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-background/40 px-6 py-16 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-4 py-3 sm:px-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h1>
        {description ? (
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      aria-label="Loading"
      role="status"
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}
