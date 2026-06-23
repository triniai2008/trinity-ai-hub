import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/home/actions")({
  head: () => ({
    meta: [
      { title: "Quick Actions — Home — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="home" slug="actions" />,
});
