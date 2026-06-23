import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "Models — TriniAI" },
      { name: "description", content: "Manage installed, cloud, and local AI models." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Models"
      subtitle="Manage installed, cloud, and local AI models."
      icon={Boxes}
      pages={["Installed","Cloud","Download","Upload","Ollama","Marketplace","Settings","Duplicate","Local","Statistics"]}
    />
  ),
});
