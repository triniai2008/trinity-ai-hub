import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Trash2, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — TriniAI" },
      { name: "description", content: "Chat with Trinity 1.0 and TriniAI's models." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChatLayout,
});

type ChatRow = { id: string; title: string; pinned: boolean; updated_at: string };

function ChatLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("chats")
      .select("id,title,pinned,updated_at")
      .eq("archived", false)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    setChats((data ?? []) as ChatRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [path]);

  const newChat = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: u.user.id, title: "New chat" })
      .select("id")
      .single();
    if (error || !data) return toast.error(error?.message ?? "Failed");
    navigate({ to: "/chat/$chatId", params: { chatId: data.id } });
  };

  const remove = async (id: string) => {
    await supabase.from("chats").delete().eq("id", id);
    setChats((cs) => cs.filter((c) => c.id !== id));
    if (path.endsWith(id)) navigate({ to: "/chat" });
  };

  const togglePin = async (c: ChatRow) => {
    await supabase.from("chats").update({ pinned: !c.pinned }).eq("id", c.id);
    load();
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-4rem)] md:h-screen">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
          <div className="p-3">
            <Button className="w-full justify-start gap-2" onClick={newChat}>
              <Plus className="h-4 w-4" /> New chat
            </Button>
          </div>
          <ScrollArea className="flex-1 px-2">
            {loading ? (
              <div className="px-2 py-4 text-xs text-muted-foreground">Loading…</div>
            ) : chats.length === 0 ? (
              <div className="px-2 py-4 text-xs text-muted-foreground">No chats yet.</div>
            ) : (
              <ul className="space-y-0.5 pb-4">
                {chats.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/chat/$chatId"
                      params={{ chatId: c.id }}
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                        path.endsWith(c.id) && "bg-sidebar-accent text-foreground",
                      )}
                    >
                      <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 truncate">{c.title}</span>
                      <button
                        onClick={(e) => { e.preventDefault(); togglePin(c); }}
                        className={cn("opacity-0 group-hover:opacity-100", c.pinned && "opacity-100")}
                        title="Pin"
                      >
                        <Pin className={cn("h-3 w-3", c.pinned && "fill-current")} />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); remove(c.id); }}
                        className="opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </AppShell>
  );
}
