import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/home/recent")({
  head: () => ({
    meta: [
      { title: "Recent Chats — Home — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="home" slug="recent" />,
});
