import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/admin/limits")({
  head: () => ({
    meta: [
      { title: "Limits & Roles — Admin — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="admin" slug="limits" />,
});
