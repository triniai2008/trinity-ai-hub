// Local PDF storage backed by IndexedDB (Dexie). Persists across reloads.
import Dexie, { type Table } from "dexie";

export interface StoredPdf {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  addedAt: number;
  source: "upload" | "drive";
  blob: Blob;
}

class PdfDb extends Dexie {
  pdfs!: Table<StoredPdf, string>;
  constructor() {
    super("triniai_pdfs");
    this.version(1).stores({
      pdfs: "id, addedAt, name, source",
    });
  }
}

let _db: PdfDb | null = null;
function db(): PdfDb {
  if (!_db) _db = new PdfDb();
  return _db;
}

export async function savePdf(input: {
  name: string;
  mimeType?: string;
  blob: Blob;
  source?: "upload" | "drive";
}): Promise<StoredPdf> {
  const rec: StoredPdf = {
    id: crypto.randomUUID(),
    name: input.name,
    size: input.blob.size,
    mimeType: input.mimeType ?? input.blob.type ?? "application/pdf",
    addedAt: Date.now(),
    source: input.source ?? "upload",
    blob: input.blob,
  };
  await db().pdfs.put(rec);
  return rec;
}

export async function listPdfs(): Promise<StoredPdf[]> {
  return db().pdfs.orderBy("addedAt").reverse().toArray();
}

export async function getPdf(id: string): Promise<StoredPdf | undefined> {
  return db().pdfs.get(id);
}

export async function deletePdf(id: string): Promise<void> {
  await db().pdfs.delete(id);
}

export function base64ToBlob(base64: string, mimeType = "application/pdf"): Blob {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}
