import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/chat/search")({
  head: () => ({
    meta: [
      { title: "Search Chats — Chat — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="chat" slug="search" />,
});
