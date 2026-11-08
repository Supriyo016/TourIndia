"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { packingList, settleUp, type PlannerDestination as Destination } from "@/features/itinerary/generate";
import { isExpenseState, isStringList, STORAGE_KEYS, useStoredValue, type ExpenseState } from "@/hooks/use-stored-value";
import { formatINR } from "@/lib/utils";

const NONE: string[] = [];

export function PackingChecklist({ destinations, months }: { destinations: Destination[]; months: number[] }) {
  const [checked, setChecked] = useStoredValue<string[]>(STORAGE_KEYS.packing, NONE, isStringList);
  const groups = useMemo(() => packingList(destinations, months), [destinations, months]);
  return (
    <details className="card p-4" open>
      <summary className="cursor-pointer text-lg font-semibold">Packing checklist</summary>
      <div className="mt-3 space-y-3">
        {groups.map((group) => (
          <fieldset key={group.group}>
            <legend className="text-sm font-semibold text-muted">{group.group}</legend>
            <ul className="mt-1">
              {group.items.map((item) => (
                <li key={item}>
                  <label className="flex min-h-8 cursor-pointer items-center gap-2 text-[0.97rem]">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--brand)]"
                      checked={checked.includes(item)}
                      onChange={() => setChecked((current) => (current.includes(item) ? current.filter((value) => value !== item) : [...current, item]))}
                    />
                    <span className={checked.includes(item) ? "text-muted line-through" : ""}>{item}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>
    </details>
  );
}

const NO_EXPENSES: ExpenseState = { people: [], expenses: [] };

export function ExpenseTracker({ travellers }: { travellers: number }) {
  const [state, setState] = useStoredValue<ExpenseState>(STORAGE_KEYS.expenses, NO_EXPENSES, isExpenseState);
  const [namesDraft, setNamesDraft] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [error, setError] = useState("");

  const people = state.people.length
    ? state.people
    : Array.from({ length: Math.max(travellers, 1) }, (_, index) => `Traveller ${index + 1}`);
  const payer = paidBy || people[0] || "";
  const total = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const payments = settleUp(people, state.expenses);
  const orphaned = [...new Set(state.expenses.map((expense) => expense.paidBy).filter((name) => !people.includes(name)))];

  return (
    <details className="card p-4">
      <summary className="cursor-pointer text-lg font-semibold">Expenses and splitting</summary>
      <div className="mt-3 space-y-3">
        <div className="field">
          <label className="field-label" htmlFor="ex-people">Names, separated by commas</label>
          <input
            id="ex-people"
            className="input"
            value={namesDraft ?? people.join(", ")}
            onChange={(event) => {
              const text = event.target.value;
              setNamesDraft(text);
              const names = [...new Set(text.split(",").map((name) => name.trim().slice(0, 40)).filter(Boolean))].slice(0, 30);
              setState((current) => ({ ...current, people: names }));
            }}
            onBlur={() => setNamesDraft(null)}
          />
        </div>
        <form
          className="grid grid-cols-2 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const value = Number(amount);
            if (!label.trim() || !Number.isFinite(value) || value <= 0) {
              setError("Add a description and a positive amount.");
              return;
            }
            setError("");
            setState((current) => ({
              people,
              expenses: [...current.expenses, { id: `${Date.now()}`, label: label.trim().slice(0, 80), amount: value, paidBy: payer }],
            }));
            setLabel("");
            setAmount("");
          }}
        >
          <input aria-label="What was it for?" className="input col-span-2" placeholder="What was it for?" value={label} onChange={(event) => setLabel(event.target.value)} />
          <input aria-label="Amount in rupees" inputMode="decimal" className="input" placeholder="Amount (₹)" value={amount} onChange={(event) => setAmount(event.target.value)} />
          <select aria-label="Paid by" className="input" value={payer} onChange={(event) => setPaidBy(event.target.value)}>
            {people.filter(Boolean).map((person) => (
              <option key={person}>{person}</option>
            ))}
          </select>
          {error && <p className="field-error col-span-2">{error}</p>}
          <button type="submit" className="btn btn-outline col-span-2">
            <Plus className="size-4" aria-hidden /> Add expense
          </button>
        </form>

        {state.expenses.length > 0 && (
          <>
            <ul className="divide-y divide-line text-[0.95rem]">
              {state.expenses.map((expense) => (
                <li key={expense.id} className="flex items-center justify-between gap-2 py-1">
                  <span className="min-w-0 truncate">{expense.label} <span className="text-muted">({expense.paidBy})</span></span>
                  <span className="flex shrink-0 items-center">
                    {formatINR(expense.amount)}
                    <button
                      type="button"
                      className="icon-btn !size-8"
                      aria-label={`Delete ${expense.label}`}
                      onClick={() => setState((current) => ({ ...current, expenses: current.expenses.filter((item) => item.id !== expense.id) }))}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <p className="font-semibold">Total {formatINR(total)}</p>
            {orphaned.length > 0 && (
              <p role="alert" className="field-error">
                Paid by someone no longer listed: {orphaned.join(", ")}. Add them back, or delete those expenses, to split correctly.
              </p>
            )}
            {payments.length > 0 ? (
              <ul className="space-y-0.5 text-[0.95rem] text-ink-2">
                {payments.map((payment) => (
                  <li key={`${payment.from}-${payment.to}`}>
                    {payment.from} pays {payment.to} {formatINR(payment.amount)}
                  </li>
                ))}
              </ul>
            ) : (
              orphaned.length === 0 && <p className="text-[0.95rem] text-ink-2">Everyone is even.</p>
            )}
          </>
        )}
        <p className="text-xs text-muted">Stored only in this browser.</p>
      </div>
    </details>
  );
}
