import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/models/ollama")({
  head: () => ({
    meta: [
      { title: "Ollama Models — Models — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="models" slug="ollama" />,
});
