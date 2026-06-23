import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "AI Tutor — Learn — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="learn" slug="" />,
});
