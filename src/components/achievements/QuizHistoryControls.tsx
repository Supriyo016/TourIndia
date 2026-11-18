"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { postJson } from "@/components/auth/AuthProvider";

/** Removes one quiz result, or all of them after a second press. */
export function QuizHistoryControls({ id, label }: { id?: string; label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!id && !confirm) {
      setConfirm(true);
      return;
    }
    setError("");
    try {
      await postJson("/api/quiz", id ? { action: "delete", id } : { action: "clear" });
      setConfirm(false);
      startTransition(() => router.refresh());
    } catch (problem) {
      setError((problem as Error).message);
    }
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" className={id ? "btn btn-outline min-h-9 px-3 text-sm" : "btn btn-outline"} disabled={pending} onClick={run} aria-label={id ? label : undefined}>
        <Trash2 className="size-4" aria-hidden />
        {id ? "Remove" : confirm ? "Yes, clear them all" : label}
      </button>
      {confirm && (
        <button type="button" className="btn btn-outline" onClick={() => setConfirm(false)}>
          Keep them
        </button>
      )}
      {error && (
        <span role="alert" className="text-sm text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
