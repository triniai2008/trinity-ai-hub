import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, FileText, Trash2, HardDrive, X } from "lucide-react";
import {
  listPdfs, savePdf, deletePdf, getPdf, base64ToBlob,
  type StoredPdf,
} from "@/lib/pdf-store";

export const Route = createFileRoute("/explore/pdf")({
  head: () => ({
    meta: [
      { title: "PDF Library — Explore — TriniAI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PdfLibrary,
});

function PdfLibrary() {
  const [pdfs, setPdfs] = useState<StoredPdf[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [drive, setDrive] = useState<{ open: boolean; loading: boolean; files: { id: string; name: string; mimeType: string }[]; error?: string }>({
    open: false, loading: false, files: [],
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setPdfs(await listPdfs());
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!activeId) { setActiveUrl(null); return; }
    let url: string | null = null;
    (async () => {
      const rec = await getPdf(activeId);
      if (!rec) return;
      url = URL.createObjectURL(rec.blob);
      setActiveUrl(url);
    })();
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [activeId]);

  const onUpload = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) continue;
      await savePdf({ name: f.name, mimeType: "application/pdf", blob: f, source: "upload" });
    }
    await refresh();
  };

  const openDrive = async () => {
    setDrive({ open: true, loading: true, files: [] });
    try {
      const { listDriveFiles } = await import("@/lib/drive.functions");
      const res = await listDriveFiles({ data: { pageSize: 50, q: "pdf" } });
      const pdfsOnly = res.files.filter((f) => f.mimeType === "application/pdf");
      setDrive({ open: true, loading: false, files: pdfsOnly, error: res.error });
    } catch {
      setDrive({ open: true, loading: false, files: [], error: "network" });
    }
  };

  const importFromDrive = async (id: string, name: string) => {
    const { importDriveFile } = await import("@/lib/drive.functions");
    const res = await importDriveFile({ data: { fileId: id } });
    if (!res.ok || !res.base64) return;
    const blob = base64ToBlob(res.base64, res.mimeType ?? "application/pdf");
    await savePdf({ name: res.name ?? name, mimeType: "application/pdf", blob, source: "drive" });
    setDrive((d) => ({ ...d, open: false }));
    await refresh();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    void onUpload(e.dataTransfer.files);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">PDF Library</h1>
          <p className="text-sm text-muted-foreground">Saved locally on this device — persists across reloads.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openDrive}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent"
          >
            <HardDrive className="h-3.5 w-3.5" /> Import from Drive
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-foreground px-3 py-1.5 text-xs text-background hover:opacity-90"
          >
            <Upload className="h-3.5 w-3.5" /> Upload PDF
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => void onUpload(e.target.files)}
          />
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* List */}
        <aside
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="rounded-xl border border-border bg-card"
        >
          {pdfs.length === 0 ? (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
              <Upload className="h-5 w-5" />
              Drop a PDF here or click Upload.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {pdfs.map((p) => (
                <li
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent ${
                    activeId === p.id ? "bg-accent" : ""
                  }`}
                  onClick={() => setActiveId(p.id)}
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(p.size / 1024).toFixed(0)} KB · {p.source}
                    </div>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deletePdf(p.id);
                      if (activeId === p.id) setActiveId(null);
                      await refresh();
                    }}
                    className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Viewer */}
        <main className="overflow-hidden rounded-xl border border-border bg-card">
          {activeUrl ? (
            <iframe src={activeUrl} className="h-full min-h-[600px] w-full" title="PDF viewer" />
          ) : (
            <div className="flex h-full min-h-[600px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Select a PDF to read it here.
            </div>
          )}
        </main>
      </div>

      {/* Drive picker */}
      {drive.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="text-sm font-semibold">Import PDF from Google Drive</div>
              <button
                onClick={() => setDrive((d) => ({ ...d, open: false }))}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {drive.loading ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
              ) : drive.error === "google_drive_not_connected" ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Google Drive isn't connected yet. Connect it in Settings → Integrations.
                </div>
              ) : drive.error ? (
                <div className="p-4 text-sm text-muted-foreground">Couldn't load Drive ({drive.error}).</div>
              ) : drive.files.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No PDFs found in Drive.</div>
              ) : (
                <ul className="divide-y divide-border">
                  {drive.files.map((f) => (
                    <li key={f.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 truncate">{f.name}</div>
                      <button
                        onClick={() => void importFromDrive(f.id, f.name)}
                        className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-accent"
                      >
                        Import
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
