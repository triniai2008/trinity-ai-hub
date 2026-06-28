import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({ seed: z.string().optional() });

export const Route = createFileRoute("/chat/")({
  validateSearch: searchSchema,
  component: NewChat,
});

const SUGGESTIONS = [
  "Explain quantum entanglement like I'm 12",
  "Draft a launch email for my SaaS product",
  "Write a TypeScript utility to debounce a function",
  "Summarize the latest AI agent research",
];

function NewChat() {
  const navigate = useNavigate();
  const { seed } = Route.useSearch();
  const [input, setInput] = useState(seed ?? "");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (seed) setInput(seed); }, [seed]);


  const start = async (prompt: string) => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setBusy(false);
      return;
    }
    const title = prompt.slice(0, 60);
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: u.user.id, title })
      .select("id")
      .single();
    if (error || !data) {
      setBusy(false);
      return toast.error(error?.message ?? "Failed");
    }
    await supabase.from("messages").insert({
      chat_id: data.id,
      user_id: u.user.id,
      role: "user",
      content: prompt,
    });
    navigate({ to: "/chat/$chatId", params: { chatId: data.id }, search: { auto: 1 } });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">How can Trinity help?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Many models. Many tools. One mind.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            start(input);
          }}
          className="mt-8"
        >
          <div className="rounded-2xl border border-border bg-card p-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="min-h-20 resize-none border-0 bg-transparent focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  start(input);
                }
              }}
            />
            <div className="flex items-center justify-end px-2 pb-1">
              <Button type="submit" size="sm" disabled={busy || !input.trim()}>
                Send
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => start(s)}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
