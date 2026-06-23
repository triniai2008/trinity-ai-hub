import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/imagine/three-d")({
  head: () => ({
    meta: [
      { title: "Text to 3D — Imagine — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="imagine" slug="three-d" />,
});
