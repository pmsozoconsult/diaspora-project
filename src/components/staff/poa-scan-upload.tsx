"use client";

import { PoaStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { deletePoaScan, uploadPoaScan } from "@/actions/poa";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CloudUpload,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PoaScanUpload({
  poaCaseId,
  staffId,
  status,
  scanUrl,
  scanFileName,
  scanUploadedAt,
}: {
  poaCaseId: string;
  staffId: string;
  status: PoaStatus;
  scanUrl: string | null;
  scanFileName: string | null;
  scanUploadedAt: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const locked = status === PoaStatus.POA_COMPLETED;
  const hasUploaded = !!scanUrl && !!scanFileName;

  const pickFile = useCallback((file: File | null) => {
    setError(null);
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    const okExt = /\.(pdf|jpe?g|png|webp)$/i.test(file.name);
    if (!allowed.includes(file.type) && !okExt) {
      setError("Use PDF, JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be 10 MB or smaller.");
      return;
    }
    setPendingFile(file);
  }, []);

  async function runUpload(file: File) {
    setUploading(true);
    setProgress(8);
    const tick = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + 6));
    }, 120);

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadPoaScan(staffId, poaCaseId, formData);

    window.clearInterval(tick);
    setProgress(100);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      setProgress(0);
      return;
    }

    setPendingFile(null);
    setProgress(0);
    router.refresh();
  }

  async function onConfirmUpload() {
    if (!pendingFile) {
      setError("Choose a file first.");
      return;
    }
    await runUpload(pendingFile);
  }

  async function onDelete() {
    if (!confirm("Remove the uploaded scan from this case?")) return;
    setDeleting(true);
    setError(null);
    const result = await deletePoaScan(staffId, poaCaseId);
    setDeleting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPendingFile(null);
    router.refresh();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (locked) return;
    const file = e.dataTransfer.files?.[0];
    pickFile(file ?? null);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Scanned POA
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Upload the registered power of attorney scan. You can replace or remove it
        until the case is marked completed.
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {hasUploaded && !pendingFile && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
              <FileText className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{scanFileName}</p>
              {scanUploadedAt && (
                <p className="mt-0.5 text-xs text-slate-500">
                  Uploaded {new Date(scanUploadedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={scanUrl!}
              target="_blank"
              rel="noreferrer"
              download={scanFileName ?? undefined}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            {!locked && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => inputRef.current?.click()}
                >
                  <RefreshCw className="h-4 w-4" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="gap-2"
                  disabled={deleting}
                  onClick={onDelete}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {!locked && (!hasUploaded || pendingFile) && (
        <>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition",
              dragOver
                ? "border-brand-500 bg-brand-50"
                : "border-slate-300 bg-slate-50/80 hover:border-brand-400 hover:bg-brand-50/50"
            )}
          >
            <CloudUpload
              className={cn(
                "h-10 w-10",
                dragOver ? "text-brand-600" : "text-slate-400"
              )}
            />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              {pendingFile ? "File selected" : "Drop file here or click to browse"}
            </p>
            <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG, WEBP — max 10 MB</p>
            {pendingFile && (
              <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-brand-800 ring-1 ring-brand-200">
                {pendingFile.name} · {formatBytes(pendingFile.size)}
              </p>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
            onChange={(e) => {
              pickFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />

          {pendingFile && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                className="gap-2"
                disabled={uploading}
                onClick={onConfirmUpload}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CloudUpload className="h-4 w-4" />
                )}
                {uploading ? "Uploading…" : "Upload file"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={uploading}
                onClick={() => setPendingFile(null)}
              >
                <X className="h-4 w-4" />
                Clear selection
              </Button>
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {locked && hasUploaded && (
        <p className="mt-3 text-xs text-slate-500">
          POA is completed — scan is locked. Download only.
        </p>
      )}
    </div>
  );
}
