import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/code/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Code — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="code" slug="assistant" />,
});
