import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/imagine")({
  head: () => ({
    meta: [
      { title: "Imagine — TriniAI" },
      { name: "description", content: "Generate images, video, music, voice, and 3D models." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Imagine"
      subtitle="Generate images, video, music, voice, and 3D models."
      icon={Sparkles}
      pages={["Image Generator","Image Editor","Image History","Video Generator","Video History","Music Generator","Voice Generator","Voice Cloning","Text to 3D","Image to 3D","3D History","Canva Export"]}
    />
  ),
});
