import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/code/preview")({
  head: () => ({
    meta: [
      { title: "Live Preview — Code — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="code" slug="preview" />,
});
