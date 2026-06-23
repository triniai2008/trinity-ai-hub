import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/workspace/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Workspace — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="workspace" slug="projects" />,
});
