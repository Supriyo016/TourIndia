"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { RecState } from "@/features/improve/engine";
import { adminPost } from "../adminFetch";

const NEXT: Record<RecState, [RecState, string][]> = {
  new: [
    ["accepted", "Accept"],
    ["dismissed", "Dismiss"],
  ],
  accepted: [
    ["done", "Mark done"],
    ["new", "Back to new"],
  ],
  dismissed: [["new", "Back to new"]],
  done: [["new", "Reopen"]],
};

/** The review steps for one recommendation. */
export function DecisionButtons({ id, state }: { id: string; state: RecState }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const send = async (next: RecState) => {
    setBusy(true);
    setError("");
    try {
      await adminPost("/api/admin/improve", { id, state: next });
      startTransition(() => router.refresh());
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {NEXT[state].map(([next, label]) => (
        <button key={next} type="button" className="chip" disabled={busy || pending} onClick={() => void send(next)}>
          {label}
        </button>
      ))}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
