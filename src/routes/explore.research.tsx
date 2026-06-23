import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/explore/research")({
  head: () => ({
    meta: [
      { title: "Deep Research — Explore — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="explore" slug="research" />,
});
