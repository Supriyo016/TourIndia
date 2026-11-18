"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { postJson } from "@/components/auth/AuthProvider";
import { settleUp } from "@/features/itinerary/generate";
import { formatINR } from "@/lib/utils";

type Expenses = { people: string[]; items: { id: string; label: string; amount: number; paidBy: string }[] };

/**
 * What the trip actually cost, against the planner's estimate, and who owes whom. Saved to the
 * account a moment after each change; only the owner ever sees it.
 */
export function TripExpenses({ id, initial, travellers, estimate }: { id: string; initial: Expenses; travellers: number; estimate: number }) {
  const [state, setState] = useState<Expenses>(initial);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [peopleDraft, setPeopleDraft] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const first = useRef(true);

  const people = state.people.length ? state.people : Array.from({ length: Math.max(travellers, 1) }, (_, i) => `Traveller ${i + 1}`);
  const payer = paidBy && people.includes(paidBy) ? paidBy : (people[0] ?? "");
  const spent = state.items.reduce((sum, item) => sum + item.amount, 0);
  const payments = settleUp(people, state.items);
  const difference = spent - estimate;

  // Saves after a short pause, so typing several expenses quickly is one request.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      setSaved("saving");
      postJson("/api/trips", { action: "expenses", id, expenses: state })
        .then(() => setSaved("saved"))
        .catch((problem: Error) => {
          setSaved("idle");
          setError(problem.message);
        });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [state, id]);

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!label.trim()) return setError("Say what it was for.");
    if (!Number.isFinite(value) || value <= 0) return setError("Enter an amount above zero.");
    setError("");
    setState((current) => ({ people: current.people.length ? current.people : people, items: [...current.items, { id: `${Date.now()}`, label: label.trim().slice(0, 80), amount: Math.round(value * 100) / 100, paidBy: payer }] }));
    setLabel("");
    setAmount("");
  };

  return (
    <section aria-labelledby="expenses-title" className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="expenses-title" className="text-lg">
          Spending against the estimate
        </h2>
        <span aria-live="polite" className="text-xs text-muted">
          {saved === "saving" ? "Saving…" : saved === "saved" ? "Saved" : ""}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-[var(--radius-md)] bg-surface-2 p-2">
          <dt className="text-xs text-ink-2">Estimate</dt>
          <dd className="font-semibold tabular-nums">{formatINR(estimate)}</dd>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 p-2">
          <dt className="text-xs text-ink-2">Spent</dt>
          <dd className="font-semibold tabular-nums">{formatINR(spent)}</dd>
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface-2 p-2">
          <dt className="text-xs text-ink-2">{difference > 0 ? "Over" : "Left"}</dt>
          <dd className={`font-semibold tabular-nums ${difference > 0 ? "text-danger" : "text-forest"}`}>{formatINR(Math.abs(difference))}</dd>
        </div>
      </dl>

      <div className="mt-4 text-sm">
        {peopleDraft === null ? (
          <p className="text-ink-2">
            Splitting between {people.join(", ")}.{" "}
            <button type="button" className="link-text" onClick={() => setPeopleDraft(people.join(", "))}>
              Change names
            </button>
          </p>
        ) : (
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const names = [...new Set(peopleDraft.split(",").map((name) => name.trim().slice(0, 40)).filter(Boolean))].slice(0, 30);
              if (names.length) setState((current) => ({ ...current, people: names }));
              setPeopleDraft(null);
            }}
          >
            <label className="field min-w-48 flex-1">
              <span className="field-label">Names, separated by commas</span>
              <input value={peopleDraft} onChange={(event) => setPeopleDraft(event.target.value)} className="input" />
            </label>
            <button type="submit" className="btn btn-outline">
              Done
            </button>
          </form>
        )}
      </div>

      <form onSubmit={add} className="mt-3 grid gap-2 sm:grid-cols-[1fr_7rem_8rem_auto] sm:items-end">
        <label className="field">
          <span className="field-label">For</span>
          <input value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} placeholder="Houseboat night" className="input" />
        </label>
        <label className="field">
          <span className="field-label">Amount (₹)</span>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" className="input" />
        </label>
        <label className="field">
          <span className="field-label">Paid by</span>
          <select value={payer} onChange={(event) => setPaidBy(event.target.value)} className="input">
            {people.map((person) => (
              <option key={person}>{person}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-accent">
          Add
        </button>
      </form>
      <p role="alert" className="field-error mt-1 empty:hidden">
        {error}
      </p>

      {state.items.length > 0 && (
        <ul className="mt-3 divide-y divide-line text-sm">
          {state.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 py-1.5">
              <span className="min-w-0 break-words">
                {item.label} <span className="text-muted">· {item.paidBy}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <span className="tabular-nums">{formatINR(item.amount)}</span>
                <button type="button" className="icon-btn !size-9" aria-label={`Remove ${item.label}`} onClick={() => setState((current) => ({ ...current, items: current.items.filter((other) => other.id !== item.id) }))}>
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {payments.length > 0 && (
        <div className="mt-3 text-sm">
          <h3 className="text-base">To settle up</h3>
          <ul className="mt-1 grid gap-0.5">
            {payments.map((payment) => (
              <li key={`${payment.from}-${payment.to}`}>
                {payment.from} pays {payment.to} {formatINR(payment.amount)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
