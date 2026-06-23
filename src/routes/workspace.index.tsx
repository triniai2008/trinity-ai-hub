import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/workspace/")({
  head: () => ({
    meta: [
      { title: "Notes — Workspace — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="workspace" slug="" />,
});
