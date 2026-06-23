import { createFileRoute } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/mcp")({
  head: () => ({
    meta: [
      { title: "MCP Hub — TriniAI" },
      { name: "description", content: "External integrations via MCP." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="MCP Hub"
      subtitle="External integrations via MCP."
      icon={Plug}
      pages={["Installed","Canva","GitHub","Figma","Google Drive","Search","Deep Research","Browser","Custom","Permissions"]}
    />
  ),
});
