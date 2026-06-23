import { createFileRoute } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { ModuleStub } from "@/components/module-stub";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — TriniAI" },
      { name: "description", content: "Research, deep web, PDFs, flashcards and mind maps." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModuleStub
      title="Explore"
      subtitle="Research, deep web, PDFs, flashcards and mind maps."
      icon={Compass}
      pages={["Search","Deep Research","PDF Reader","Web Reader","Website Summarizer","YouTube Search","Flashcards","Quiz Generator","Mind Maps","Article Analyzer"]}
    />
  ),
});
