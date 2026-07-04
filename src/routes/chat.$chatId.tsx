import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, RefreshCw, Send, Sparkles, User as UserIcon } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({ auto: z.number().optional() });

export const Route = createFileRoute("/chat/$chatId")({
  validateSearch: searchSchema,
  component: ChatThread,
});

const MODELS = [
  { id: "auto", label: "Auto (Trinity routes)" },
  { id: "deepseek-v3", label: "DeepSeek V3" },
  { id: "qwen-3", label: "Qwen 3" },
  { id: "llama", label: "Llama 3.3" },
  { id: "gemma-3", label: "Gemma 3" },
  { id: "mistral", label: "Mistral" },
  { id: "deepseek-coder", label: "DeepSeek Coder" },
  { id: "qwen-coder", label: "Qwen Coder" },
  { id: "nvidia-nemotron-70b", label: "Llama 3.1 Nemotron 70B" },
  { id: "nvidia-nemotron-ultra", label: "Llama 3.1 Nemotron Ultra" },
  { id: "nvidia-nemotron-super", label: "Llama 3.3 Nemotron Super" },
  { id: "nvidia-deepseek-r1", label: "DeepSeek R1 (NVIDIA)" },
  { id: "nvidia-qwen3-coder", label: "Qwen3 Coder 480B (NVIDIA)" },
  { id: "nvidia-llama4-maverick", label: "Llama 4 Maverick" },
  { id: "nvidia-llama4-scout", label: "Llama 4 Scout" },
  { id: "nvidia-mistral-small", label: "Mistral Small 3 (NVIDIA)" },
  { id: "nvidia-gemma3-27b", label: "Gemma 3 27B (NVIDIA)" },
  { id: "gpt", label: "GPT-4o (premium)" },
  { id: "claude", label: "Claude 3.5 Sonnet (premium)" },
  { id: "gemini", label: "Gemini 2.5 Pro (premium)" },
] as const;

const THINKING = [
  { id: "normal", label: "Normal" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High thinking" },
] as const;

type DbMessage = { id: string; role: "user" | "assistant" | "system"; content: string };

function toUI(rows: DbMessage[]): UIMessage[] {
  return rows.map((r) => ({
    id: r.id,
    role: r.role,
    parts: [{ type: "text", text: r.content }],
  })) as UIMessage[];
}

function ChatThread() {
  const { chatId } = Route.useParams();
  const { auto } = Route.useSearch();
  const navigate = useNavigate();
  const [model, setModel] = useState<string>(MODELS[0].id);
  const [thinking, setThinking] = useState<"normal" | "medium" | "high">("normal");
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const [input, setInput] = useState("");
  const savedIdsRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load existing messages
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id,role,content")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) toast.error(error.message);
      const rows = (data ?? []) as DbMessage[];
      rows.forEach((r) => savedIdsRef.current.add(r.id));
      setInitial(toUI(rows));
    })();
    return () => {
      cancelled = true;
    };
  }, [chatId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { messages, ...(model === "auto" ? {} : { model }), thinkingMode: thinking, ...(body ?? {}) },
        }),
      }),
    [model, thinking],
  );

  const { messages, sendMessage, status, regenerate } = useChat({
    id: chatId,
    messages: initial ?? [],
    transport,
    onError: (err) => toast.error(err.message),
    onFinish: async ({ message }) => {
      // Save assistant message to DB
      const text = message.parts
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("");
      if (!text || savedIdsRef.current.has(message.id)) return;
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        user_id: u.user.id,
        role: "assistant",
        content: text,
        model,
      });
      if (!error) savedIdsRef.current.add(message.id);
      await supabase.from("chats").update({ updated_at: new Date().toISOString(), model }).eq("id", chatId);
    },
  });

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, status]);

  // Auto-trigger if coming from new chat with a seeded user message.
  // Use regenerate() only when there's already an assistant message; otherwise
  // re-send the seeded user text via sendMessage so the request actually fires.
  const autoTriggeredRef = useRef(false);
  useEffect(() => {
    if (autoTriggeredRef.current) return;
    if (!auto || !initial || status !== "ready") return;
    const last = initial[initial.length - 1];
    if (!last || last.role !== "user") return;
    const text = last.parts.map((p) => (p.type === "text" ? p.text : "")).join("").trim();
    if (!text) return;
    autoTriggeredRef.current = true;
    initial.forEach((m) => savedIdsRef.current.add(m.id));
    // Strip ?auto=1 first so a re-render can't re-fire.
    navigate({ to: "/chat/$chatId", params: { chatId }, search: {}, replace: true });
    // Fire-and-forget; useChat onError will toast on failure.
    void sendMessage({ text });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, status]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    // Persist user msg
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data } = await supabase
        .from("messages")
        .insert({ chat_id: chatId, user_id: u.user.id, role: "user", content: text })
        .select("id")
        .single();
      if (data) savedIdsRef.current.add(data.id);
      // Update chat title if first message
      if (messages.length === 0) {
        await supabase.from("chats").update({ title: text.slice(0, 60) }).eq("id", chatId);
      }
    }

    await sendMessage({ text });
  };

  const copyMsg = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={thinking} onValueChange={(v) => setThinking(v as typeof thinking)}>
            <SelectTrigger className="h-8 w-36 text-xs">
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
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className="group flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                  {isUser ? <UserIcon className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-[11px] font-medium text-muted-foreground">
                    {isUser ? "You" : "Trinity"}
                  </div>
                  <div className="prose-chat max-w-none text-foreground">
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <ReactMarkdown>{text || (isLoading ? "…" : "")}</ReactMarkdown>
                    )}
                  </div>
                  {!isUser && text && (
                    <div className="mt-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[11px]" onClick={() => copyMsg(text)}>
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[11px]" onClick={() => regenerate()}>
                        <RefreshCw className="h-3 w-3" /> Regenerate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1 pt-2 text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background p-4">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Trinity…"
              className="min-h-12 resize-none border-0 bg-transparent focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={isLoading}
            />
            <div className="flex items-center justify-end px-1 pb-1">
              <Button size="sm" onClick={send} disabled={isLoading || !input.trim()} className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
