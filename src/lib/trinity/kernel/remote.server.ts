// Health probe for the external (Python) Agent Kernel deployment.
// Server-only. When the remote kernel is missing or unreachable, TriniAI runs
// the built-in in-app Agent Kernel workflow instead.

export interface KernelHealth {
  configured: boolean;
  reachable: boolean;
  /** Host only — never expose the full URL or secrets. */
  host?: string;
  detail: string;
  engine: "remote-agent-kernel" | "builtin-agent-kernel";
}

const PROBE_PATHS = ["/health", "/healthz", "/v1/health"];

export async function checkKernelHealth(): Promise<KernelHealth> {
  const raw = process.env.AGENT_KERNEL_URL?.trim();
  if (!raw) {
    return {
      configured: false,
      reachable: false,
      detail: "No AGENT_KERNEL_URL set — using the built-in Agent Kernel.",
      engine: "builtin-agent-kernel",
    };
  }

  let host: string | undefined;
  try {
    host = new URL(raw).host;
  } catch {
    return {
      configured: true,
      reachable: false,
      detail: "AGENT_KERNEL_URL is not a valid URL — using the built-in Agent Kernel.",
      engine: "builtin-agent-kernel",
    };
  }

  const base = raw.replace(/\/+$/, "");
  const shared = process.env.AGENT_KERNEL_SHARED_SECRET;

  for (const path of PROBE_PATHS) {
    try {
      const res = await fetch(`${base}${path}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(shared ? { "X-Gateway-Secret": shared } : {}),
        },
        signal: AbortSignal.timeout(4000),
      });
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && type.includes("json")) {
        return {
          configured: true,
          reachable: true,
          host,
          detail: `Remote Agent Kernel responding at ${path}.`,
          engine: "remote-agent-kernel",
        };
      }
    } catch {
      // try next probe path
    }
  }

  return {
    configured: true,
    reachable: false,
    host,
    detail: "Remote Agent Kernel did not answer a health probe — using the built-in Agent Kernel.",
    engine: "builtin-agent-kernel",
  };
}
