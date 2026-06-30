import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MessageCircle, Sparkles, Code2, Compass, Bot, ArrowRight,
  GraduationCap, CalendarClock, Target, BookOpen, FileText, HardDrive,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/home/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TriniAI" },
      { name: "description", content: "Your personalized study dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HomeDashboard,
});

type Onboarding = {
  subjects?: string[];
  exam_date?: string;
  goals?: string[];
  level?: string;
};

const QUICK = [
  { to: "/chat", icon: MessageCircle, title: "New chat", body: "Talk with Trinity." },
  { to: "/explore/pdf", icon: FileText, title: "Study a PDF", body: "Upload and review." },
  { to: "/imagine", icon: Sparkles, title: "Generate image", body: "Create with AI." },
  { to: "/code", icon: Code2, title: "Open code", body: "Build something." },
  { to: "/explore", icon: Compass, title: "Research", body: "Deep search the web." },
  { to: "/agents", icon: Bot, title: "Run an agent", body: "Specialized AI." },
] as const;

function daysUntil(iso: string): number | null {
  const t = Date.parse(iso);
  if (isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
}

function HomeDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string | null; onboarding_answers: Onboarding } | null>(null);
  const [recentChats, setRecentChats] = useState<{ id: string; title: string | null }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, onboarding_answers")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setProfile({
          display_name: data.display_name,
          onboarding_answers: (data.onboarding_answers as Onboarding) ?? {},
        });
      }
      const { data: chats } = await supabase
        .from("chats")
        .select("id, title")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);
      setRecentChats(chats ?? []);
    })();
  }, [user]);

  const onboarding = profile?.onboarding_answers ?? {};
  const subjects = onboarding.subjects ?? [];
  const goals = onboarding.goals ?? [];
  const examDays = onboarding.exam_date ? daysUntil(onboarding.exam_date) : null;
  const firstName = profile?.display_name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Hi {firstName} — ready to study?
        </h1>
      </div>

      {/* Personalized cards */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <PersonalCard
          icon={CalendarClock}
          label="Exam countdown"
          value={
            examDays === null
              ? "Set your exam date"
              : examDays <= 0
                ? "Today's the day"
                : `${examDays} day${examDays === 1 ? "" : "s"} to go`
          }
          to="/profile"
        />
        <PersonalCard
          icon={GraduationCap}
          label="Subjects"
          value={subjects.length ? subjects.slice(0, 3).join(" · ") : "Add your subjects"}
          to="/profile"
        />
        <PersonalCard
          icon={Target}
          label="Top goal"
          value={goals[0] ?? "Set a goal"}
          to="/profile"
        />
      </div>

      {/* Suggested actions from onboarding */}
      {subjects.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 text-sm font-semibold">Suggested for you</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {subjects.slice(0, 4).map((s) => (
              <Link
                key={s}
                to="/chat"
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 text-sm">
                  Tutor me on <span className="font-medium">{s}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.to}
              to={q.to}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{q.title}</div>
                <div className="text-xs text-muted-foreground">{q.body}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>

      {/* Google Drive */}
      <DriveCard />

      {/* Recent chats */}
      <div className="mt-12">
        <h2 className="mb-3 text-sm font-semibold">Recent chats</h2>
        {recentChats.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Your recent conversations will appear here.{" "}
            <Link to="/chat" className="text-foreground underline underline-offset-2">Start a new chat</Link>.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {recentChats.map((c) => (
              <Link
                key={c.id}
                to="/chat/$chatId"
                params={{ chatId: c.id }}
                className="block px-4 py-3 text-sm hover:bg-accent"
              >
                {c.title ?? "Untitled chat"}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PersonalCard({
  icon: Icon, label, value, to,
}: { icon: typeof CalendarClock; label: string; value: string; to: string }) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </Link>
  );
}

function DriveCard() {
  const [state, setState] = useState<{ loading: boolean; files: { id: string; name: string; mimeType: string }[]; error?: string }>({
    loading: true, files: [],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { listDriveFiles } = await import("@/lib/drive.functions");
        const res = await listDriveFiles({ data: { pageSize: 6 } });
        if (cancelled) return;
        setState({ loading: false, files: res.files, error: res.error });
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, files: [], error: "network" });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mt-12">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Google Drive</h2>
        <Link to="/explore/pdf" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          Open PDF library
        </Link>
      </div>
      <div className="rounded-xl border border-border bg-card">
        {state.loading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
        ) : state.error === "google_drive_not_connected" ? (
          <div className="flex items-center gap-3 p-4 text-sm">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              Connect Google Drive (read-only) to import study files here.
            </div>
            <Link
              to="/settings/integrations"
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent"
            >
              Connect
            </Link>
          </div>
        ) : state.error ? (
          <div className="p-4 text-sm text-muted-foreground">Couldn't load Drive ({state.error}).</div>
        ) : state.files.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No files in Drive yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {state.files.map((f) => (
              <li key={f.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 truncate">{f.name}</div>
                <span className="text-xs text-muted-foreground">{f.mimeType.split(".").pop()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
