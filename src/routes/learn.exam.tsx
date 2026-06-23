import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/learn/exam")({
  head: () => ({
    meta: [
      { title: "Exam Mode — Learn — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="learn" slug="exam" />,
});
