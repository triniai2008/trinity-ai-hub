import { createFileRoute } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/code")({
  head: () => ({
    meta: [
      { title: "Code — TriniAI" },
      { name: "description", content: "A Cursor-like AI coding workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Code"
      subtitle="A Cursor-like AI coding workspace."
      icon={Code2}
      pages={["Projects","File Manager","Editor","AI Assistant","Terminal","Preview","GitHub","Code Explain","Bug Fix","Deploy","Templates"]}
    />
  ),
});
