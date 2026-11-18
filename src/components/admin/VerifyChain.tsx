"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { adminPost } from "./adminFetch";

interface Result {
  checked: number;
  limit: number;
  problems: { id: string; at: string; problem: "edited" | "gap" }[];
}

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Re-checks the hash chain of a log and shows any edited records or gaps. */
export function VerifyChain({ kind }: { kind: "audit" | "security" }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      setResult(await adminPost<Result>("/api/admin/logs", { action: "verify", kind }));
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-3">
      <div>
        <button type="button" className="btn btn-outline" onClick={run} disabled={busy}>
          <ShieldCheck className="size-4" aria-hidden /> {busy ? "Checking…" : "Verify the chain"}
        </button>
      </div>
      <div role="status" aria-live="polite" className="text-sm">
        {error && <p className="text-danger">{error}</p>}
        {result && result.checked === 0 && <p className="text-ink-2">There are no chained records to check yet.</p>}
        {result && result.checked > 0 && result.problems.length === 0 && (
          <p>
            <strong>All {result.checked} records check out.</strong> <span className="text-ink-2">No edits or gaps{result.checked >= result.limit ? ` in the latest ${result.limit}` : ""}.</span>
          </p>
        )}
        {result && result.problems.length > 0 && (
          <div>
            <p className="font-semibold text-danger">
              {result.problems.length} {result.problems.length === 1 ? "problem" : "problems"} in {result.checked} records. Someone may have changed the database directly.
            </p>
            <ul className="mt-2 grid gap-1">
              {result.problems.map((p) => (
                <li key={`${p.id}-${p.problem}`}>
                  {p.problem === "edited" ? "Edited after it was written" : "Records missing or inserted before this one"}: <code className="break-all">{p.id}</code> ({when(p.at)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
