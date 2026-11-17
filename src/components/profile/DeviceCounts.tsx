"use client";

import Link from "next/link";
import { isSavedTripList, isStringList, STORAGE_KEYS, useStoredValue, type SavedTrip } from "@/hooks/use-stored-value";

const NONE: string[] = [];
const NO_TRIPS: SavedTrip[] = [];

/** What this browser has saved. These live on the device until they're moved to the account. */
export function DeviceCounts() {
  const [favourites] = useStoredValue<string[]>(STORAGE_KEYS.favourites, NONE, isStringList);
  const [stamps] = useStoredValue<string[]>(STORAGE_KEYS.stamps, NONE, isStringList);
  const [trips] = useStoredValue<SavedTrip[]>(STORAGE_KEYS.trips, NO_TRIPS, isSavedTripList);
  const [recent] = useStoredValue<string[]>(STORAGE_KEYS.recent, NONE, isStringList);
  const items = [
    ["Saved places", favourites.length],
    ["Trip plans", trips.length],
    ["Passport stamps", stamps.length],
    ["Recently viewed", recent.length],
  ] as const;
  return (
    <section aria-labelledby="device-title" className="card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="device-title" className="text-xl">
          On this device
        </h2>
        <Link prefetch={false} href="/saved" className="link-text text-sm font-semibold">
          Open your saved list
        </Link>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(([label, count]) => (
          <div key={label} className="rounded-[var(--radius-md)] bg-surface-2 p-3">
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{count}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-muted">These are kept in this browser, not your account, so they won&apos;t appear on your other devices yet.</p>
    </section>
  );
}
