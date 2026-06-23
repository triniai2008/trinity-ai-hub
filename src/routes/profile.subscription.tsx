import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/profile/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription — Profile — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="profile" slug="subscription" />,
});
