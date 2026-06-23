import { createFileRoute } from "@tanstack/react-router";
import { ModuleLayout } from "@/components/module-layout";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ModuleLayout moduleKey="settings" />,
});
