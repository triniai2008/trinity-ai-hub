import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/community/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Community — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="community" slug="leaderboard" />,
});
