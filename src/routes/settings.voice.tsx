import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/settings/voice")({
  head: () => ({
    meta: [
      { title: "Voice Settings — Settings — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="settings" slug="voice" />,
});
