"use client";

import { useEffect, useRef, useState } from "react";
import { PencilLine, X } from "lucide-react";
import { postJson, useAuth } from "@/components/auth/AuthProvider";
import type { FieldKind, Target } from "@/features/community/targets";

/**
 * "Suggest an edit" for one section of an encyclopedia page. The change is stored as a
 * suggestion and only appears on the page after an admin approves it.
 */
export function SuggestEdit({ target, field, label, kind, current }: { target: Target; field: string; label: string; kind: FieldKind; current: string }) {
  const { user, openSignIn } = useAuth();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [open]);

  const hint = kind === "paragraphs" ? "Leave a blank line between paragraphs." : kind === "list" ? "Put each item on its own line." : "";

  return (
    <>
      <button
        type="button"
        className="chip !min-h-9 text-sm"
        onClick={() => {
          if (!user) return openSignIn("Sign in to suggest a correction.");
          setDone("");
          setOpen(true);
        }}
      >
        <PencilLine className="size-3.5" aria-hidden /> Suggest an edit
      </button>
      {open && (
        <dialog
          ref={dialog}
          aria-labelledby={`edit-${field}-title`}
          onClose={() => setOpen(false)}
          className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-transparent p-4 text-ink backdrop:bg-[rgb(4_14_20/0.55)] backdrop:backdrop-blur-sm"
        >
          <div className="glass-panel anim-pop relative mx-auto mt-[6vh] w-full max-w-2xl p-6">
            <button type="button" className="icon-btn absolute top-3 right-3" aria-label="Close" onClick={() => dialog.current?.close()}>
              <X className="size-5" aria-hidden />
            </button>
            <h2 id={`edit-${field}-title`} className="text-xl">Suggest an edit: {label}</h2>
            {done ? (
              <>
                <p role="status" className="mt-4">{done}</p>
                <button type="button" className="btn btn-accent mt-5" onClick={() => dialog.current?.close()}>
                  Close
                </button>
              </>
            ) : (
              <form
                className="mt-4 grid gap-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  setBusy(true);
                  setError("");
                  try {
                    const result = await postJson<{ message: string }>("/api/community", {
                      action: "edit",
                      target,
                      field,
                      text: String(form.get("text") ?? ""),
                      reason: String(form.get("reason") ?? ""),
                    });
                    setDone(result.message);
                  } catch (problem) {
                    setError((problem as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <label className="field">
                  <span className="field-label">Corrected text</span>
                  <textarea name="text" required maxLength={6000} rows={kind === "text" ? 4 : 10} defaultValue={current} className="input resize-y" aria-describedby={hint ? `edit-${field}-hint` : undefined} />
                  {hint && (
                    <span id={`edit-${field}-hint`} className="field-hint">
                      {hint}
                    </span>
                  )}
                </label>
                <label className="field">
                  <span className="field-label">What changed, and how do you know?</span>
                  <textarea name="reason" required minLength={10} maxLength={600} rows={3} className="input resize-y" placeholder="For example: the ferry now leaves from the north jetty, per the district notice of March 2026." />
                </label>
                <p className="text-sm text-muted">An admin checks every suggestion before it goes live. Please keep it factual and respectful of every faith and community.</p>
                <p role="alert" aria-live="polite" className="field-error min-h-5">
                  {error}
                </p>
                <div>
                  <button type="submit" className="btn btn-accent" disabled={busy}>
                    {busy ? "Sending…" : "Send suggestion"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </dialog>
      )}
    </>
  );
}
