import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — TriniAI" },
      { name: "description", content: "Personal productivity — notes, files, tasks, calendar." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Workspace"
      subtitle="Personal productivity — notes, files, tasks, calendar."
      icon={Briefcase}
      pages={["Notes","Files","Documents","Tasks","Calendar","Projects","Folders","Tags","Archive"]}
    />
  ),
});
