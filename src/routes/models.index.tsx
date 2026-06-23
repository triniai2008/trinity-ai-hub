import { createFileRoute } from "@tanstack/react-router";
import { ModelCatalogView } from "@/components/model-catalog-view";

export const Route = createFileRoute("/models/")({
  head: () => ({
    meta: [
      { title: "Models — TriniAI" },
      { name: "description", content: "Full Trinity 1.0 model catalog: OpenRouter, Hugging Face, Lovable AI, and Ollama models categorized by purpose, quality, speed, and use case." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModelCatalogView
      title="All Models"
      description="Every model Trinity 1.0 can route to — categorized by purpose, tier, and speed. The default per category is what Trinity picks automatically."
    />
  ),
});
