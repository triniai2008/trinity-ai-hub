import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/learn/study")({
  head: () => ({
    meta: [
      { title: "Study Assistant — Learn — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="learn" slug="study" />,
});
