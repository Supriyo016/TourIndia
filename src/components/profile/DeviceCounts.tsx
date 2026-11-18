"use client";

import Link from "next/link";
import { isStringList, STORAGE_KEYS, useStoredValue } from "@/hooks/use-stored-value";

const NONE: string[] = [];

/** What's saved: trips, places, stamps, collections and notes from the account; recently viewed from this browser. */
export function DeviceCounts({ account }: { account: { places: number; stamps: number; collections: number; trips: number; notes: number } | null }) {
  const [recent] = useStoredValue<string[]>(STORAGE_KEYS.recent, NONE, isStringList);
  const items = [
    ...(account
      ? ([
          ["Trips", account.trips],
          ["Saved places", account.places],
          ["Collections", account.collections],
          ["States visited", account.stamps],
          ["Notes", account.notes],
        ] as const)
      : []),
    ["Recently viewed", recent.length],
  ] as const;
  return (
    <section aria-labelledby="saved-title" className="card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="saved-title" className="text-xl">
          Saved
        </h2>
        <Link prefetch={false} href="/saved" className="link-text text-sm font-semibold">
          Open your saved list
        </Link>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(([label, count]) => (
          <div key={label} className="rounded-[var(--radius-md)] bg-surface-2 p-3">
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{count}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-muted">Trips, saved places, collections, your passport and notes are kept in your account. Recently viewed stays in this browser.</p>
    </section>
  );
}
