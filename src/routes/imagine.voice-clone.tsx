import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/imagine/voice-clone")({
  head: () => ({
    meta: [
      { title: "Voice Cloning — Imagine — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="imagine" slug="voice-clone" />,
});
