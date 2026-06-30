// Google Drive (read-only) via Lovable connector gateway.
// Requires linked `google_drive` connector. Gracefully returns an error
// payload when the connection is missing so the UI can show a CTA.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive";

function gatewayHeaders(): Record<string, string> | { error: string } {
  const lovable = process.env.LOVABLE_API_KEY;
  const conn = process.env.GOOGLE_DRIVE_API_KEY;
  if (!lovable || !conn) {
    return { error: "google_drive_not_connected" };
  }
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": conn,
    Accept: "application/json",
  };
}

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  iconLink?: string;
};

export const listDriveFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      q: z.string().max(200).optional(),
      pageSize: z.number().int().min(1).max(100).default(25),
    }).parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<{ files: DriveFile[]; error?: string }> => {
    const headers = gatewayHeaders();
    if ("error" in headers) return { files: [], error: headers.error };

    const params = new URLSearchParams({
      pageSize: String(data.pageSize),
      fields: "files(id,name,mimeType,size,modifiedTime,iconLink)",
      orderBy: "modifiedTime desc",
    });
    if (data.q) params.set("q", `name contains '${data.q.replace(/'/g, "")}'`);

    const res = await fetch(`${GATEWAY}/drive/v3/files?${params}`, { headers });
    if (!res.ok) {
      return { files: [], error: `drive_${res.status}` };
    }
    const json = (await res.json()) as { files?: DriveFile[] };
    return { files: json.files ?? [] };
  });

export const importDriveFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ fileId: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; base64?: string; mimeType?: string; name?: string; error?: string }> => {
    const headers = gatewayHeaders();
    if ("error" in headers) return { ok: false, error: headers.error };

    const metaRes = await fetch(
      `${GATEWAY}/drive/v3/files/${data.fileId}?fields=id,name,mimeType,size`,
      { headers },
    );
    if (!metaRes.ok) return { ok: false, error: `meta_${metaRes.status}` };
    const meta = (await metaRes.json()) as { name: string; mimeType: string };

    const dlRes = await fetch(`${GATEWAY}/drive/v3/files/${data.fileId}?alt=media`, { headers });
    if (!dlRes.ok) return { ok: false, error: `download_${dlRes.status}` };
    const buf = new Uint8Array(await dlRes.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const base64 = btoa(bin);
    return { ok: true, base64, mimeType: meta.mimeType, name: meta.name };
  });
