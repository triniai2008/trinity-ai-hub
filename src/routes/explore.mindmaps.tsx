import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/explore/mindmaps")({
  head: () => ({
    meta: [
      { title: "Mind Maps — Explore — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="explore" slug="mindmaps" />,
});
