import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Sparkles, Code2, Compass, Bot, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/home/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TriniAI" },
      { name: "description", content: "Your TriniAI dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HomeDashboard,
});

const QUICK = [
  { to: "/chat", icon: MessageCircle, title: "New chat", body: "Talk with Trinity." },
  { to: "/imagine", icon: Sparkles, title: "Generate image", body: "Create with AI." },
  { to: "/code", icon: Code2, title: "Open code", body: "Build something." },
  { to: "/explore", icon: Compass, title: "Research", body: "Deep search the web." },
  { to: "/agents", icon: Bot, title: "Run an agent", body: "Specialized AI." },
];

function HomeDashboard() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">What do you want to do?</h1>
      </div>

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

      <div className="mt-12">
        <h2 className="mb-3 text-sm font-semibold">Recent chats</h2>
        <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Your recent conversations will appear here.{" "}
          <Link to="/chat" className="text-foreground underline underline-offset-2">Start a new chat</Link>.
        </div>
      </div>
    </div>
  );
}
