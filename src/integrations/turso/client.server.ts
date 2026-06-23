// Server-only Turso (libSQL) client. Filename .server.ts keeps it out of the client bundle.
import { createClient, type Client } from "@libsql/client";

let _client: Client | undefined;

export function turso(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("Missing TURSO_DATABASE_URL");
  _client = createClient({ url, authToken });
  return _client;
}
