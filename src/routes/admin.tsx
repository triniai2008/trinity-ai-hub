import { createFileRoute } from "@tanstack/react-router";
import { ModuleLayout } from "@/components/module-layout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ModuleLayout moduleKey="admin" />,
});
