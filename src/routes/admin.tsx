import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — TriniAI" },
      { name: "description", content: "Admin panel — users, analytics, moderation, broadcasts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Admin"
      subtitle="Admin panel — users, analytics, moderation, broadcasts."
      icon={Shield}
      pages={["Dashboard","Users","Analytics","Models","MCP Hub","API Keys","Chat Logs","Moderation","Prompt Library","Broadcast","Security Logs","Backup","System Health","Limits","Roles","Dataset","Reports"]}
    />
  ),
});
