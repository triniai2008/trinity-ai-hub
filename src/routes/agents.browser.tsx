import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/agents/browser")({
  head: () => ({
    meta: [
      { title: "Browser Agent — Agents — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="agents" slug="browser" />,
});
