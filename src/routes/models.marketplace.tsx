import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/models/marketplace")({
  head: () => ({
    meta: [
      { title: "Model Marketplace — Models — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="models" slug="marketplace" />,
});
