import { createFileRoute } from "@tanstack/react-router";
import { checkKernelHealth } from "@/lib/trinity/kernel/remote.server";

/** Reports which Agent Kernel engine serves requests (remote vs built-in). */
export const Route = createFileRoute("/api/agents/status")({
  server: {
    handlers: {
      GET: async () => {
        const health = await checkKernelHealth();
        return Response.json(health, {
          headers: { "Cache-Control": "no-store" },
        });
      },
    },
  },
});
