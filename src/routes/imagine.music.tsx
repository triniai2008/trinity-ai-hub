import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/imagine/music")({
  head: () => ({
    meta: [
      { title: "Music Generator — Imagine — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="imagine" slug="music" />,
});
