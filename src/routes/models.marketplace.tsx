import { createFileRoute } from "@tanstack/react-router";
import { ModelCatalogView } from "@/components/model-catalog-view";

export const Route = createFileRoute("/models/marketplace")({
  head: () => ({
    meta: [
      { title: "Model Marketplace — TriniAI" },
      { name: "description", content: "Discover every model Trinity 1.0 can route to." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ModelCatalogView
      title="Model Marketplace"
      description="Browse the full Trinity catalog. Filter by source, search by vendor, and see what powers each task."
    />
  ),
});
