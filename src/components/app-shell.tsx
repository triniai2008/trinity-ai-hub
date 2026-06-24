import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";
import { useAuth } from "@/hooks/use-auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <div className="hidden md:flex">
        <AppSidebar />
      </div>
      <main className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <CommandPalette />
    </div>
  );
}
