import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents — TriniAI" },
      { name: "description", content: "Specialized AI agents for every task." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Agents"
      subtitle="Specialized AI agents for every task."
      icon={Bot}
      pages={["Trinity","Judge","Research","Coding","Image","Video","Audio","Planner","Memory","Browser","File","Statistics"]}
    />
  ),
});
