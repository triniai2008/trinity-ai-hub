import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/mcphub/research")({
  head: () => ({
    meta: [
      { title: "Deep Research MCP — MCP Hub — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="mcp" slug="research" />,
});
