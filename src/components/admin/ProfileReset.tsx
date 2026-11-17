"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminPost } from "./adminFetch";

/** Clears what someone wrote on their page and makes it private, with a note for the audit log. */
export function ProfileReset({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  return (
    <form
      className="mt-4 flex flex-wrap items-end gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        try {
          await adminPost("/api/admin/profile", { action: "reset", userId, note });
          setDone(true);
          startTransition(() => router.refresh());
        } catch (problem) {
          setError((problem as Error).message);
        }
      }}
    >
      <label className="field min-w-64 flex-1">
        <span className="field-label">Why (kept in the audit log)</span>
        <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} className="input" />
      </label>
      <button type="submit" className="btn btn-outline" disabled={pending || note.trim().length < 3}>
        Clear text and make private
      </button>
      <p role="status" aria-live="polite" className={error ? "field-error w-full" : "w-full text-sm text-forest"}>
        {error || (done ? "Cleared." : "")}
      </p>
    </form>
  );
}
