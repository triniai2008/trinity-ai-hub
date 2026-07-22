import { createFileRoute } from "@tanstack/react-router";
import { ModuleLayout } from "@/components/module-layout";

export const Route = createFileRoute("/mcphub")({
  head: () => ({
    meta: [
      { title: "MCP Hub — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ModuleLayout moduleKey="mcp" />,
});
