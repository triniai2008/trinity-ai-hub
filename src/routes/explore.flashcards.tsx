import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/explore/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards — Explore — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="explore" slug="flashcards" />,
});
