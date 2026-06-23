import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/workspace/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Workspace — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="workspace" slug="tasks" />,
});
