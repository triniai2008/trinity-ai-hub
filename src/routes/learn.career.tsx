import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/learn/career")({
  head: () => ({
    meta: [
      { title: "Career Roadmap — Learn — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="learn" slug="career" />,
});
