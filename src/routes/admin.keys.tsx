import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/admin/keys")({
  head: () => ({
    meta: [
      { title: "API Keys — Admin — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="admin" slug="keys" />,
});
