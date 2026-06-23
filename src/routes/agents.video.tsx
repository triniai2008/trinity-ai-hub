import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/agents/video")({
  head: () => ({
    meta: [
      { title: "Video Agent — Agents — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="agents" slug="video" />,
});
