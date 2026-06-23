import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/settings/memory")({
  head: () => ({
    meta: [
      { title: "Memory Settings — Settings — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="settings" slug="memory" />,
});
