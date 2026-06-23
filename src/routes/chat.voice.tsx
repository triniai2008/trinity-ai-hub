import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/chat/voice")({
  head: () => ({
    meta: [
      { title: "Voice Chat — Chat — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="chat" slug="voice" />,
});
