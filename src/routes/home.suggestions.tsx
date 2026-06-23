import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/home/suggestions")({
  head: () => ({
    meta: [
      { title: "AI Suggestions — Home — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="home" slug="suggestions" />,
});
