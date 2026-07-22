import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/mcphub/search")({
  head: () => ({
    meta: [
      { title: "Search MCP — MCP Hub — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="mcp" slug="search" />,
});
