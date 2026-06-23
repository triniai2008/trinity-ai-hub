// Server-only client for the user's EXTERNAL Supabase project (frnntlkjycxgwblbuhqo).
// Used as a SECONDARY store for things like training dataset replication, analytics,
// or cross-region reads. Primary auth/chats/messages remain on Lovable Cloud Supabase.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | undefined;

export function externalSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.EXTERNAL_SUPABASE_URL;
  const key = process.env.EXTERNAL_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing EXTERNAL_SUPABASE_URL or EXTERNAL_SUPABASE_PUBLISHABLE_KEY");
  }
  _client = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
