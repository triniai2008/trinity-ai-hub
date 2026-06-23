import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TriniAI" },
      { name: "description", content: "General, appearance, AI, voice, memory, privacy." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Settings"
      subtitle="General, appearance, AI, voice, memory, privacy."
      icon={Settings}
      pages={["General","Appearance","AI","Voice","Memory","Privacy","Notifications","Language","Integrations","Backup","Theme","Storage"]}
    />
  ),
});
