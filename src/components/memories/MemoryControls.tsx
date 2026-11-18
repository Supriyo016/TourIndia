"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Copy, Link2, Link2Off, Pencil, Trash2 } from "lucide-react";
import { postJson } from "@/components/auth/AuthProvider";

/** Edit, share by link and delete, for the memory's owner. */
export function MemoryControls({ id, shareId: initialShare }: { id: string; shareId: string | null }) {
  const router = useRouter();
  const [shareId, setShareId] = useState(initialShare);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const link = shareId ? `${typeof window === "undefined" ? "" : window.location.origin}/m/${shareId}` : "";

  const run = async (body: Record<string, unknown>, after: (result: Record<string, unknown>) => void) => {
    setBusy(true);
    setError("");
    try {
      after(await postJson<Record<string, unknown>>("/api/memories", { id, ...body }));
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="no-print grid gap-3">
      <div className="flex flex-wrap gap-2">
        <Link prefetch={false} href={`/profile/memories/${id}/edit`} className="btn btn-outline">
          <Pencil className="size-4" aria-hidden /> Edit
        </Link>
        {shareId ? (
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => run({ action: "share", on: false }, () => setShareId(null))}>
            <Link2Off className="size-4" aria-hidden /> Turn off the link
          </button>
        ) : (
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => run({ action: "share", on: true }, (result) => setShareId(result.shareId as string))}>
            <Link2 className="size-4" aria-hidden /> Share by link
          </button>
        )}
        {confirmDelete ? (
          <>
            <button
              type="button"
              className="btn btn-outline text-danger"
              disabled={busy}
              onClick={() =>
                run({ action: "delete" }, () => {
                  router.push("/profile/memories");
                  router.refresh();
                })
              }
            >
              <Trash2 className="size-4" aria-hidden /> Yes, delete it
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setConfirmDelete(false)}>
              Keep it
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-outline" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4" aria-hidden /> Delete
          </button>
        )}
      </div>
      {confirmDelete && <p className="text-sm text-ink-2">Deleting can&apos;t be undone, and any link to it stops working.</p>}
      {shareId && (
        <div className="card grid gap-2 p-4">
          <p className="text-sm text-ink-2">Anyone with this link can read this memory. It never shows your name. Turning the link off stops it at once.</p>
          <div className="flex flex-wrap items-center gap-2">
            <input readOnly value={link} aria-label="Share link" className="input min-w-0 flex-1 text-sm" onFocus={(event) => event.target.select()} />
            <button
              type="button"
              className="btn btn-outline"
              onClick={async () => {
                await navigator.clipboard?.writeText(link).catch(() => undefined);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
      <p role="alert" aria-live="polite" className="field-error min-h-5">
        {error}
      </p>
    </div>
  );
}
