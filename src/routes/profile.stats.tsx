import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/profile/stats")({
  head: () => ({
    meta: [
      { title: "Statistics — Profile — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="profile" slug="stats" />,
});
