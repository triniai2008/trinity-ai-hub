import { createFileRoute } from "@tanstack/react-router";
import { ModuleLayout } from "@/components/module-layout";

export const Route = createFileRoute("/code")({
  head: () => ({
    meta: [
      { title: "Code — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ModuleLayout moduleKey="code" />,
});
