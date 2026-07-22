import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/mcphub/")({
  head: () => ({
    meta: [
      { title: "Installed MCPs — MCP Hub — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="mcp" slug="" />,
});
