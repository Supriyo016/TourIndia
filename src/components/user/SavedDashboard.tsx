"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Award, Lock, Trash2 } from "lucide-react";
import { CompassCharacter } from "@/components/characters/Characters";
import { EmptyState } from "@/components/ui/EmptyState";
import { shareHash } from "@/features/itinerary/share";
import { computeBadges } from "@/features/user/badges";
import { isSavedTripList, isStringList, STORAGE_KEYS, useFavourites, useStoredValue, type SavedTrip } from "@/hooks/use-stored-value";
import { cn, formatDate } from "@/lib/utils";
import type { RegionId } from "@/types/content";

const NONE: string[] = [];
const NO_TRIPS: SavedTrip[] = [];

export function SavedDashboard({
  cards,
  stateList,
}: {
  cards: Record<string, ReactNode>;
  stateList: { slug: string; name: string; region: RegionId }[];
}) {
  const { favourites, ready } = useFavourites();
  const [recent] = useStoredValue<string[]>(STORAGE_KEYS.recent, NONE, isStringList);
  const [stamps, setStamps] = useStoredValue<string[]>(STORAGE_KEYS.stamps, NONE, isStringList);
  const [trips, setTrips] = useStoredValue<SavedTrip[]>(STORAGE_KEYS.trips, NO_TRIPS, isSavedTripList);

  const badges = computeBadges(stamps, (slug) => stateList.find((state) => state.slug === slug)?.region);
  const earned = badges.filter((badge) => badge.earned).length;

  return (
    <div className="space-y-14">
      <section aria-labelledby="wishlist">
        <h2 id="wishlist" className="mb-5">Wishlist</h2>
        {ready && favourites.length === 0 ? (
          <EmptyState title="Nothing saved yet" art={<CompassCharacter className="h-24 w-24" />}>
            <p>Tap the heart on any guide and it will be kept here.</p>
            <Link href="/discover" className="btn btn-primary mt-3">Browse guides</Link>
          </EmptyState>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favourites.filter((slug) => cards[slug]).map((slug) => <li key={slug}>{cards[slug]}</li>)}
          </ul>
        )}
      </section>

      <section aria-labelledby="trips">
        <h2 id="trips" className="mb-5">Saved trips</h2>
        {trips.length === 0 ? (
          <p className="text-ink-2">
            Trips you save from the <Link href="/planner" className="link-text">planner</Link> will appear here.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {trips.map((trip) => (
              <li key={trip.id} className="card flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  {/* A full page load on purpose: the planner reads the fragment when it starts. */}
                  <a href={`/planner#${shareHash(trip.input, trip.days)}`} className="link-text">{trip.name}</a>
                  <p className="text-sm text-muted">{trip.days.length} days · saved {formatDate(trip.savedAt.slice(0, 10))}</p>
                </div>
                <button type="button" className="icon-btn shrink-0" aria-label={`Delete ${trip.name}`} onClick={() => setTrips((current) => current.filter((item) => item.id !== trip.id))}>
                  <Trash2 className="size-5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="passport">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow mb-1">My India travel passport</p>
            <h2 id="passport">{stamps.length} of {stateList.length} stamped</h2>
          </div>
          <p className="text-ink-2">{earned} of {badges.length} badges earned</p>
        </div>

        <ul className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <li key={badge.id} className={cn("card flex gap-3 p-3.5", !badge.earned && "!border-dashed !bg-transparent")}>
              {badge.earned ? <Award className="size-6 shrink-0 text-accent-ink" aria-hidden /> : <Lock className="size-5 shrink-0 text-muted" aria-hidden />}
              <div>
                <p className="font-semibold">{badge.name}<span className="sr-only">{badge.earned ? " (earned)" : " (not yet earned)"}</span></p>
                <p className="text-sm leading-snug text-muted">{badge.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <ul className="grid grid-cols-1 gap-x-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {stateList.map((state) => (
            <li key={state.slug}>
              <label className="flex min-h-10 cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  className="size-4 accent-[var(--brand)]"
                  checked={stamps.includes(state.slug)}
                  onChange={() => setStamps((current) => (current.includes(state.slug) ? current.filter((item) => item !== state.slug) : [...current, state.slug]))}
                />
                <span>{state.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="recent">
          <h2 id="recent" className="mb-5">Recently viewed</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recent.filter((slug) => cards[slug]).slice(0, 8).map((slug) => <li key={slug}>{cards[slug]}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
