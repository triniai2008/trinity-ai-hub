import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/community/projects")({
  head: () => ({
    meta: [
      { title: "Shared Projects — Community — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="community" slug="projects" />,
});
