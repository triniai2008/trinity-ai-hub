import { Logo } from "@/components/logo";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  MessageSquarePlus,
  MessageCircle,
  Sparkles,
  Code2,
  Compass,
  Bot,
  Boxes,
  Plug,
  Briefcase,
  Users,
  GraduationCap,
  Bell,
  User as UserIcon,
  Settings,
  Shield,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/imagine", label: "Imagine", icon: Sparkles },
  { to: "/code", label: "Code", icon: Code2 },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/models", label: "Models", icon: Boxes },
  { to: "/mcp", label: "MCP Hub", icon: Plug },
  { to: "/workspace", label: "Workspace", icon: Briefcase },
  { to: "/community", label: "Community", icon: Users },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/notifications", label: "Notifications", icon: Bell },
] as const;

const BOTTOM = [
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/admin", label: "Admin", icon: Shield },
] as const;

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const saved = (localStorage.getItem("triniai-theme") as "dark" | "light") || "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("triniai-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };
  return { theme, toggle };
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <Logo className="h-9 w-9 rounded-lg" />
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">TriniAI</div>
          <div className="text-[10px] text-muted-foreground">Trinity 1.0</div>
        </div>
      </div>

      <div className="px-3">
        <Link
          to="/chat"
          onClick={onNavigate}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </Link>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-2">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                    isActive(item.to) && "bg-sidebar-accent text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-3 border-t border-sidebar-border" />

        <ul className="space-y-0.5">
          {BOTTOM.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                    isActive(item.to) && "bg-sidebar-accent text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-sidebar-border p-3">
        <Button variant="ghost" size="sm" className="gap-2" onClick={toggle}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="text-xs">{theme === "dark" ? "Light" : "Dark"}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          <span className="text-xs">Sign out</span>
        </Button>
      </div>
    </aside>
  );
}
