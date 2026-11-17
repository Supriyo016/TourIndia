"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminPost } from "./adminFetch";

const REASONS = {
  spam: "Spam or advertising",
  abuse: "Abuse or harassment",
  misinformation: "Deliberately false travel information",
  copyright: "Copyright infringement",
  security: "Account security (compromised or suspicious)",
  other: "Other",
} as const;

type Active = { id: string; kind: "suspension" | "ban"; appealOpen: boolean } | null;

/** Restrict, restore, decide appeals and sign a user out everywhere. Each needs a fresh authenticator code. */
export function UserActions({ userId, email, canRestrict, canEndSessions, active }: { userId: string; email: string; canRestrict: boolean; canEndSessions: boolean; active: Active }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ kind: "suspension" as "suspension" | "ban", length: "7", reason: "spam" as keyof typeof REASONS, note: "", evidence: "" });
  const [decisionNote, setDecisionNote] = useState("");

  if (!canRestrict && !canEndSessions) return null;

  const run = async (url: string, body: unknown, done: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminPost(url, body);
      setNotice(done);
      startTransition(() => router.refresh());
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const disabled = busy || pending;

  return (
    <section aria-labelledby="actions-title" className="card mt-8 grid gap-5 p-5">
      <h2 id="actions-title" className="text-xl">
        Actions
      </h2>
      <p aria-live="polite" className={notice ? "text-sm" : "sr-only"}>
        {notice}
      </p>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      {canRestrict && active && (
        <div className="grid gap-3">
          <p>
            This account is under a <strong>{active.kind}</strong>.{active.appealOpen ? " It has an open appeal." : ""}
          </p>
          <div className="grid gap-1.5">
            <label htmlFor="decision-note" className="text-sm font-semibold">
              Note (shown to other admins)
            </label>
            <input id="decision-note" className="input" maxLength={500} value={decisionNote} onChange={(event) => setDecisionNote(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {active.appealOpen ? (
              <>
                <button type="button" className="btn btn-primary" disabled={disabled || decisionNote.trim().length < 3} onClick={() => run("/api/admin/users", { action: "appeal", restrictionId: active.id, decision: "overturned", note: decisionNote }, "Appeal accepted; the account is restored.")}>
                  Accept appeal and restore
                </button>
                <button type="button" className="btn btn-outline" disabled={disabled || decisionNote.trim().length < 3} onClick={() => run("/api/admin/users", { action: "appeal", restrictionId: active.id, decision: "upheld", note: decisionNote }, "Appeal turned down; the restriction stays.")}>
                  Turn down appeal
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-primary" disabled={disabled || decisionNote.trim().length < 3} onClick={() => run("/api/admin/users", { action: "lift", restrictionId: active.id, note: decisionNote }, "Restriction lifted; the account is active again.")}>
                Lift restriction now
              </button>
            )}
          </div>
        </div>
      )}

      {canRestrict && !active && (
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const days = form.length === "permanent" ? null : Number(form.length);
            const label = form.kind === "ban" && days === null ? "permanently ban" : `${form.kind === "ban" ? "ban" : "suspend"} for ${days} days`;
            if (!window.confirm(`${label[0]!.toUpperCase()}${label.slice(1)} ${email}? They're signed out everywhere at once.`)) return;
            void run("/api/admin/users", { action: "restrict", userId, kind: form.kind, days, reason: form.reason, note: form.note, ...(form.evidence.trim() ? { evidence: form.evidence } : {}) }, "Restriction set; the account is signed out everywhere.");
          }}
        >
          <fieldset className="flex flex-wrap gap-4">
            <legend className="mb-1 text-sm font-semibold">Restrict this account</legend>
            {(["suspension", "ban"] as const).map((kind) => (
              <label key={kind} className="flex items-center gap-2">
                <input type="radio" name="kind" checked={form.kind === kind} onChange={() => setForm({ ...form, kind, length: kind === "suspension" && form.length === "permanent" ? "7" : form.length })} />
                {kind === "suspension" ? "Suspend" : "Ban"}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="restrict-length" className="text-sm font-semibold">
                How long
              </label>
              <select id="restrict-length" className="input" value={form.length} onChange={(event) => setForm({ ...form, length: event.target.value })}>
                {["1", "3", "7", "14", "30", "90"].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === "1" ? "day" : "days"}
                  </option>
                ))}
                {form.kind === "ban" && <option value="365">1 year</option>}
                {form.kind === "ban" && <option value="permanent">Permanent</option>}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="restrict-reason" className="text-sm font-semibold">
                Reason
              </label>
              <select id="restrict-reason" className="input" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value as keyof typeof REASONS })}>
                {Object.entries(REASONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="restrict-note" className="text-sm font-semibold">
              Note for other admins (required)
            </label>
            <input id="restrict-note" className="input" required minLength={3} maxLength={500} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="restrict-evidence" className="text-sm font-semibold">
              Evidence reference (optional)
            </label>
            <input id="restrict-evidence" className="input" maxLength={200} placeholder="A report or comment id, or a link" value={form.evidence} onChange={(event) => setForm({ ...form, evidence: event.target.value })} />
          </div>
          <button className="btn justify-self-start border border-danger text-danger" disabled={disabled}>
            {form.kind === "ban" ? "Ban account" : "Suspend account"}
          </button>
        </form>
      )}

      {canEndSessions && (
        <div>
          <button
            type="button"
            className="btn btn-outline"
            disabled={disabled}
            onClick={() => window.confirm(`Sign ${email} out on every device?`) && run("/api/admin", { action: "sessions", id: userId }, "Signed out on every device.")}
          >
            Sign out everywhere
          </button>
        </div>
      )}
    </section>
  );
}
