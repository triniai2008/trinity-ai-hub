import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

// Beta namespace — narrow local typing so we don't grep node_modules.
type OAuthClient = { name?: string; client_id?: string; redirect_uris?: string[] };
type AuthorizationDetails = {
  client?: OAuthClient;
  redirect_url?: string;
  redirect_to?: string;
  scopes?: string[];
};
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center p-6 text-sm text-muted-foreground">
      Could not load this authorization request: {String((error as Error)?.message ?? error)}
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Logo className="h-9 w-9 rounded-lg" />
          <div>
            <h1 className="text-base font-semibold">Connect {clientName} to TriniAI</h1>
            <p className="text-xs text-muted-foreground">This lets {clientName} use TriniAI as you.</p>
          </div>
        </div>

        <ul className="mb-5 space-y-2 rounded-lg border border-border bg-background/50 p-4 text-sm">
          <li>• Read your basic profile and email</li>
          <li>• Call TriniAI's enabled tools while you're signed in</li>
          <li className="text-xs text-muted-foreground">
            This does not bypass TriniAI's permissions or backend policies.
          </li>
        </ul>

        {error && (
          <p role="alert" className="mb-3 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
            Cancel connection
          </Button>
          <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
            {busy ? "Working…" : "Approve"}
          </Button>
        </div>
      </div>
    </main>
  );
}
