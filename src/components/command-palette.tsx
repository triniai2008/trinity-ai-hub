// Global ⌘K command palette — navigation + AI actions.
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  MessageCircle,
  Sparkles,
  Code2,
  Compass,
  Bot,
  Boxes,
  Plug,
  Briefcase,
  GraduationCap,
  Users,
  Bell,
  User,
  Settings,
  Shield,
  Plus,
  Image as ImageIcon,
  Film,
  Music,
  Mic,
  Box,
} from "lucide-react";

type Cmd = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  keywords?: string;
};

const COMMANDS: Cmd[] = [
  { label: "New chat", to: "/chat", icon: Plus, group: "Actions", keywords: "new conversation" },
  { label: "Generate image", to: "/imagine/image", icon: ImageIcon, group: "Actions" },
  { label: "Generate video", to: "/imagine/video", icon: Film, group: "Actions" },
  { label: "Generate music", to: "/imagine/music", icon: Music, group: "Actions" },
  { label: "Generate voice", to: "/imagine/voice", icon: Mic, group: "Actions" },
  { label: "Generate 3D model", to: "/imagine/three-d", icon: Box, group: "Actions" },

  { label: "Home", to: "/", icon: Home, group: "Go to" },
  { label: "Chat", to: "/chat", icon: MessageCircle, group: "Go to" },
  { label: "Imagine", to: "/imagine", icon: Sparkles, group: "Go to" },
  { label: "Code", to: "/code", icon: Code2, group: "Go to" },
  { label: "Explore", to: "/explore", icon: Compass, group: "Go to" },
  { label: "Agents", to: "/agents", icon: Bot, group: "Go to" },
  { label: "Models", to: "/models", icon: Boxes, group: "Go to" },
  { label: "MCP Hub", to: "/mcphub", icon: Plug, group: "Go to" },
  { label: "Workspace", to: "/workspace", icon: Briefcase, group: "Go to" },
  { label: "Learn", to: "/learn", icon: GraduationCap, group: "Go to" },
  { label: "Community", to: "/community", icon: Users, group: "Go to" },
  { label: "Notifications", to: "/notifications", icon: Bell, group: "Go to" },

  { label: "Profile", to: "/profile", icon: User, group: "Account" },
  { label: "Settings", to: "/settings", icon: Settings, group: "Account" },
  { label: "Admin", to: "/admin", icon: Shield, group: "Account" },
];

const GROUPS = ["Actions", "Go to", "Account"] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or type a command…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {GROUPS.map((g, idx) => (
          <div key={g}>
            <CommandGroup heading={g}>
              {COMMANDS.filter((c) => c.group === g).map((c) => (
                <CommandItem
                  key={`${g}:${c.label}`}
                  value={`${c.label} ${c.keywords ?? ""}`}
                  onSelect={() => run(c.to)}
                >
                  <c.icon className="mr-2 h-4 w-4" />
                  {c.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {idx < GROUPS.length - 1 ? <CommandSeparator /> : null}
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
