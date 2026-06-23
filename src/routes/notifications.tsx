import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — TriniAI" },
      { name: "description", content: "Alerts, mentions and broadcasts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Notifications"
      subtitle="Alerts, mentions and broadcasts."
      icon={Bell}
      pages={["All","Mentions","Broadcasts","System Alerts"]}
    />
  ),
});
