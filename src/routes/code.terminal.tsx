import { createFileRoute } from "@tanstack/react-router";
import { SubPageStub } from "@/components/module-layout";

export const Route = createFileRoute("/code/terminal")({
  head: () => ({
    meta: [
      { title: "Terminal — Code — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SubPageStub moduleKey="code" slug="terminal" />,
});
