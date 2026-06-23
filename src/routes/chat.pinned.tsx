import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/chat/pinned")({
  head: () => ({
    meta: [
      { title: "Pinned Chats — Chat — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="chat" slug="pinned" />,
});
