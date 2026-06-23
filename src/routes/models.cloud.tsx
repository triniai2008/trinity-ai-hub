import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/models/cloud")({
  head: () => ({
    meta: [
      { title: "Cloud Models — Models — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="models" slug="cloud" />,
});
