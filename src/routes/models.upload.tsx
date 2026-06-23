import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/models/upload")({
  head: () => ({
    meta: [
      { title: "Upload Models — Models — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="models" slug="upload" />,
});
