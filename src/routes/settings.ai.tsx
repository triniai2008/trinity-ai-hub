import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/settings/ai")({
  head: () => ({
    meta: [
      { title: "AI Settings — Settings — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="settings" slug="ai" />,
});
