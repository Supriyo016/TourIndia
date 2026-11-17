"use client";

import Link from "next/link";
import { isSavedTripList, isStringList, STORAGE_KEYS, useStoredValue, type SavedTrip } from "@/hooks/use-stored-value";

const NONE: string[] = [];
const NO_TRIPS: SavedTrip[] = [];

/** What's saved: places, stamps and collections from the account; trips and history from this browser. */
export function DeviceCounts({ account }: { account: { places: number; stamps: number; collections: number } | null }) {
  const [trips] = useStoredValue<SavedTrip[]>(STORAGE_KEYS.trips, NO_TRIPS, isSavedTripList);
  const [recent] = useStoredValue<string[]>(STORAGE_KEYS.recent, NONE, isStringList);
  const items = [
    ...(account
      ? ([
          ["Saved places", account.places],
          ["Collections", account.collections],
          ["Passport stamps", account.stamps],
        ] as const)
      : []),
    ["Trip plans", trips.length],
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
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {items.map(([label, count]) => (
          <div key={label} className="rounded-[var(--radius-md)] bg-surface-2 p-3">
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{count}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-muted">Saved places, collections and stamps are kept in your account. Trip plans and recently viewed stay in this browser.</p>
    </section>
  );
}
