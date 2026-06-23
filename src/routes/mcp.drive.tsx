import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/mcp/drive")({
  head: () => ({
    meta: [
      { title: "Google Drive MCP — MCP Hub — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="mcp" slug="drive" />,
});
