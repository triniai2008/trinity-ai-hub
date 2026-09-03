import { createFileRoute } from "@tanstack/react-router";
import { AgentChat } from "@/components/agents/agent-chat";
import { getAgent } from "@/lib/trinity/agents";

const agent = getAgent("browser")!;

export const Route = createFileRoute("/agents/browser")({
  head: () => ({
    meta: [
      { title: `${agent.name} — Agents — TriniAI` },
      { name: "description", content: agent.tagline },
      { property: "og:title", content: `${agent.name} — TriniAI` },
      { property: "og:description", content: agent.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AgentChat agent={agent} />,
});
