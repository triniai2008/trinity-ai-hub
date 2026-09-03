import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bot, Loader2, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { AgentChat, type AgentPreset } from "@/components/agents/agent-chat";
import { BUILTIN_AGENTS } from "@/lib/trinity/agents";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CustomAgent = {
  id: string;
  name: string;
  tagline: string | null;
  brief: string;
  starters: string[] | null;
  enabled: boolean;
};

// `user_agents` is created by data.sql; typing is loose until types regenerate.
const db = () => (supabase as unknown as { from: (t: string) => any }).from("user_agents");

const EMPTY = { id: "", name: "", tagline: "", brief: "", starters: "" };

function AgentsManager() {
  const [custom, setCustom] = useState<CustomAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<AgentPreset | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setCustom([]);
      setLoading(false);
      return;
    }
    const { data, error } = await db().select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setCustom((data ?? []) as CustomAgent[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!form.name.trim() || !form.brief.trim()) {
      toast.error("Name and instructions are required.");
      return;
    }
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) {
      toast.error("Sign in to create agents.");
      setSaving(false);
      return;
    }
    const payload = {
      user_id: userId,
      name: form.name.trim(),
      tagline: form.tagline.trim() || null,
      brief: form.brief.trim(),
      starters: form.starters
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      enabled: true,
    };
    const q = form.id ? db().update(payload).eq("id", form.id) : db().insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.id ? "Agent updated" : "Agent created");
    setOpen(false);
    setForm(EMPTY);
    void load();
  };

  const remove = async (id: string) => {
    const { error } = await db().delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Agent deleted");
    void load();
  };

  const toPreset = (a: CustomAgent): AgentPreset => ({
    key: `custom-${a.id}`,
    name: a.name,
    tagline: a.tagline ?? "Custom agent",
    brief: a.brief,
    starters: a.starters ?? [],
  });

  if (running) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-4 py-2">
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setRunning(null)}>
            <X className="h-3.5 w-3.5" /> Back to agents
          </Button>
        </div>
        <div className="min-h-0 flex-1">
          <AgentChat agent={running} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Agents</h1>
          <p className="text-sm text-muted-foreground">
            Specialist agents running on the Agent Kernel. Create your own or launch a built-in one.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setForm(EMPTY);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> New agent
        </Button>
      </header>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Built-in</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BUILTIN_AGENTS.filter((a) => a.key !== "trinity").map((a) => (
            <Link
              key={a.key}
              to={`/agents/${a.key}` as string}
              className="glass group rounded-xl border border-border p-4 transition-colors hover:border-foreground/30"
            >
              <div className="mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="text-sm font-medium">{a.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{a.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your agents</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : custom.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No custom agents yet. Create one to give the Agent Kernel a permanent role and starter prompts.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {custom.map((a) => (
              <div key={a.id} className="glass rounded-xl border border-border p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="truncate text-sm font-medium">{a.name}</span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{a.tagline ?? a.brief}</p>
                <div className="mt-3 flex gap-1.5">
                  <Button size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setRunning(toPreset(a))}>
                    <Play className="h-3 w-3" /> Run
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => {
                      setForm({
                        id: a.id,
                        name: a.name,
                        tagline: a.tagline ?? "",
                        brief: a.brief,
                        starters: (a.starters ?? []).join("\n"),
                      });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-destructive"
                    onClick={() => void remove(a.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit agent" : "New agent"}</DialogTitle>
            <DialogDescription>
              Instructions become the agent's role inside the Agent Kernel workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="agent-name">Name</Label>
              <Input
                id="agent-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Physics Paper Coach"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agent-tagline">Tagline</Label>
              <Input
                id="agent-tagline"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Marks past papers like an examiner"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agent-brief">Instructions</Label>
              <Textarea
                id="agent-brief"
                rows={5}
                value={form.brief}
                onChange={(e) => setForm({ ...form, brief: e.target.value })}
                placeholder="You are…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agent-starters">Starter prompts (one per line)</Label>
              <Textarea
                id="agent-starters"
                rows={3}
                value={form.starters}
                onChange={(e) => setForm({ ...form, starters: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : form.id ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/agents/")({
  head: () => ({
    meta: [
      { title: "Agents — TriniAI" },
      { name: "description", content: "Create, run and manage Agent Kernel agents in TriniAI." },
      { property: "og:title", content: "Agents — TriniAI" },
      { property: "og:description", content: "Create, run and manage Agent Kernel agents in TriniAI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgentsManager,
});
