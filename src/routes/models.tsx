import { createFileRoute } from "@tanstack/react-router";
import { ModuleLayout } from "@/components/module-layout";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "Models — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ModuleLayout moduleKey="models" />,
});
