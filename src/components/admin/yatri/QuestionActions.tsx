"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminPost } from "../adminFetch";

/** Mark one Yatri question handled (with an optional note) or reopen it. */
export function QuestionActions({ id, handled }: { id: string; handled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const send = async (action: "handle" | "reopen") => {
    setBusy(true);
    setError("");
    try {
      await adminPost("/api/admin/yatri", { action, id, ...(note.trim() ? { note: note.trim() } : {}) });
      startTransition(() => router.refresh());
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-1.5">
      {handled ? (
        <button type="button" className="chip justify-self-start" disabled={busy || pending} onClick={() => void send("reopen")}>
          Reopen
        </button>
      ) : (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void send("handle");
          }}
        >
          <label htmlFor={`note-${id}`} className="sr-only">
            What was done (optional)
          </label>
          <input id={`note-${id}`} className="input !min-h-9 text-sm" placeholder="What was done (optional)" maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} />
          <button className="chip" disabled={busy || pending}>
            Mark handled
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
