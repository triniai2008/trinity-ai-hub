import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/workspace/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Workspace — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="workspace" slug="calendar" />,
});
