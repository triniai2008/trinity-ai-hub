import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/workspace/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Workspace — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="workspace" slug="documents" />,
});
