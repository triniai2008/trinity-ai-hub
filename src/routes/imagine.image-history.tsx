import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/imagine/image-history")({
  head: () => ({
    meta: [
      { title: "Image History — Imagine — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="imagine" slug="image-history" />,
});
