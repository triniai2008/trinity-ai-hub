import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/chat/shared")({
  head: () => ({
    meta: [
      { title: "Shared Chats — Chat — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="chat" slug="shared" />,
});
