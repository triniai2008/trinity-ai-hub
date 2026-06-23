import { createFileRoute } from "@tanstack/react-router";
import { ModelCatalogView } from "@/components/model-catalog-view";

export const Route = createFileRoute("/models/cloud")({
  head: () => ({
    meta: [
      { title: "Cloud Models — TriniAI" },
      { name: "description", content: "Cloud-hosted models on OpenRouter, Hugging Face, and Lovable AI." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModelCatalogView
      title="Cloud Models"
      description="Models served from OpenRouter, Hugging Face, and Lovable AI — no install required."
    />
  ),
});
