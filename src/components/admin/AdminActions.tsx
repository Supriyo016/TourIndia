"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminPost } from "./adminFetch";

type Action = { action: "edit"; id: string; approve: boolean } | { action: "comment"; id: string; status: "visible" | "removed" } | { action: "user"; id: string; status: "active" | "blocked" };

/** Approve and reject buttons for one queue item, with an optional note. Refreshes the server-rendered queue afterwards. */
export function AdminActions({ choices }: { choices: { label: string; tone?: "danger"; body: Action }[] }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`note-${choices[0]?.body.id}`}>
        Note for the record
      </label>
      <input id={`note-${choices[0]?.body.id}`} value={note} onChange={(event) => setNote(event.target.value)} maxLength={300} placeholder="Note (optional)" className="input !min-h-10 max-w-60 text-sm" />
      {choices.map((choice) => (
        <button
          key={choice.label}
          type="button"
          disabled={pending}
          className={choice.tone === "danger" ? "btn border border-danger !min-h-10 text-danger" : "btn btn-primary !min-h-10"}
          onClick={async () => {
            setError("");
            try {
              await adminPost("/api/admin", choice.body.action === "user" ? choice.body : { ...choice.body, note });
              startTransition(() => router.refresh());
            } catch (problem) {
              setError((problem as Error).message);
            }
          }}
        >
          {choice.label}
        </button>
      ))}
      {error && (
        <p role="alert" className="field-error w-full">
          {error}
        </p>
      )}
    </div>
  );
}
