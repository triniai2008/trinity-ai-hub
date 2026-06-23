import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/imagine/three-d-history")({
  head: () => ({
    meta: [
      { title: "3D History — Imagine — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="imagine" slug="three-d-history" />,
});
