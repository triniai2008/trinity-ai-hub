import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/explore/youtube")({
  head: () => ({
    meta: [
      { title: "YouTube Search — Explore — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="explore" slug="youtube" />,
});
