import { createFileRoute } from "@tanstack/react-router";
import { ModelCatalogView } from "@/components/model-catalog-view";

export const Route = createFileRoute("/models/ollama")({
  head: () => ({
    meta: [
      { title: "Ollama Models — TriniAI" },
      { name: "description", content: "Local Ollama models for offline, private inference." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModelCatalogView
      title="Ollama — Local Models"
      description="Run Trinity offline. These models live on your machine via Ollama — private, fast, no internet required."
      sourceFilter="ollama"
      lockSource
    />
  ),
});
