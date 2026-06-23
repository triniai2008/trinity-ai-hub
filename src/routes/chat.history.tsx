import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/chat/history")({
  head: () => ({
    meta: [
      { title: "Chat History — Chat — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="chat" slug="history" />,
});
