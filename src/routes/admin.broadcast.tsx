import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/admin/broadcast")({
  head: () => ({
    meta: [
      { title: "Broadcast Center — Admin — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="admin" slug="broadcast" />,
});
