import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Send, Sparkles, User as UserIcon } from "lucide-react";

export type AgentPreset = {
  key: string;
  name: string;
  tagline: string;
  /** Prepended to the first user turn so the kernel adopts the agent's role. */
  brief: string;
  starters: string[];
};

const THINKING = [
  { id: "normal", label: "Normal" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High thinking" },
] as const;

export function AgentChat({ agent }: { agent: AgentPreset }) {
  const [thinking, setThinking] = useState<"normal" | "medium" | "high">("normal");
  const [input, setInput] = useState("");
  const [engine, setEngine] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/agents/chat",
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { messages, agent: agent.key, thinkingMode: thinking, ...(body ?? {}) },
        }),
      }),
    [agent.key, thinking],
  );

  const [kernelStep, setKernelStep] = useState<{ stage: string; status: string; detail?: string } | null>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: `agent-${agent.key}`,
    transport,
    onData: (part) => {
      if (part.type === "data-kernel-step") {
        setKernelStep(part.data as { stage: string; status: string; detail?: string });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    setMessages([]);
    setKernelStep(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.key]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/agents/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j) setEngine(j.engine ?? (j.reachable ? "remote-agent-kernel" : "builtin-agent-kernel"));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, status]);

  const isLoading = status === "submitted" || status === "streaming";

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || isLoading) return;
    setInput("");
    const prefixed = messages.length === 0 ? `${agent.brief}\n\n---\n\n${text}` : text;
    void sendMessage({ text: prefixed });
  };

  return (
    <div className="flex h-full min-h-[60vh] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{agent.name}</h1>
          <p className="truncate text-xs text-muted-foreground">{agent.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={thinking} onValueChange={(v) => setThinking(v as typeof thinking)}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THINKING.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground sm:flex">
            <Sparkles className="h-3 w-3" />
            {engine === "remote-agent-kernel" ? "Agent Kernel (remote)" : "Powered by Agent Kernel"}
          </span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {agent.starters.map((s) => (
                  <Button key={s} variant="outline" size="sm" className="text-xs" onClick={() => send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => {
            let text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = m.role === "user";
            if (isUser && i === 0) text = text.split("\n\n---\n\n").slice(1).join("\n\n---\n\n") || text;
            return (
              <div key={m.id} className="group flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                  {isUser ? <UserIcon className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-[11px] font-medium text-muted-foreground">
                    {isUser ? "You" : agent.name}
                  </div>
                  <div className="prose-chat max-w-none text-foreground">
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <ReactMarkdown>{text || (isLoading ? "…" : "")}</ReactMarkdown>
                    )}
                  </div>
                  {!isUser && text && (
                    <div className="mt-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-2 text-[11px]"
                        onClick={() => {
                          navigator.clipboard.writeText(text);
                          toast.success("Copied");
                        }}
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
              </span>
              {kernelStep && (
                <span className="text-[11px]">
                  Agent Kernel · {kernelStep.stage}
                  {kernelStep.detail ? ` — ${kernelStep.detail}` : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-card p-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${agent.name}…`}
            className="min-h-12 resize-none border-0 bg-transparent focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={isLoading}
          />
          <Button size="icon" onClick={() => send()} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
