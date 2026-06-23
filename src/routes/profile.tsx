import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — TriniAI" },
      { name: "description", content: "Account, usage, subscription, security." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Profile"
      subtitle="Account, usage, subscription, security."
      icon={User}
      pages={["Account","Usage","Statistics","Subscription","Security","Devices","Login History"]}
    />
  ),
});
