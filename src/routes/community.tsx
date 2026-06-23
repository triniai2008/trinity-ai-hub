import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — TriniAI" },
      { name: "description", content: "Teams, templates, shared projects, leaderboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Community"
      subtitle="Teams, templates, shared projects, leaderboard."
      icon={Users}
      pages={["Teams","Templates","Shared Projects","Leaderboard","Achievements","Badges","Comments","Likes"]}
    />
  ),
});
