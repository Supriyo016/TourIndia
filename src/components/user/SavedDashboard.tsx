"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { CompassCharacter } from "@/components/characters/lazy";
import { EmptyState } from "@/components/ui/EmptyState";
import { shareHash } from "@/features/itinerary/share";
import { isSavedTripList, isStringList, STORAGE_KEYS, useFavourites, useStoredValue, type SavedTrip } from "@/hooks/use-stored-value";
import { useAuth } from "@/components/auth/AuthProvider";
import { Collections } from "./Collections";
import { Passport } from "./Passport";
import { formatDate } from "@/lib/utils";
import type { RegionId } from "@/types/content";

const NONE: string[] = [];
const NO_TRIPS: SavedTrip[] = [];

export function SavedDashboard({
  cards,
  names,
  stateList,
  map,
}: {
  cards: Record<string, ReactNode>;
  names: Record<string, string>;
  stateList: { slug: string; name: string; region: RegionId }[];
  /** The India map, rendered on the server; the passport colours it. */
  map: ReactNode;
}) {
  const { favourites, ready } = useFavourites();
  const { user } = useAuth();
  const [recent] = useStoredValue<string[]>(STORAGE_KEYS.recent, NONE, isStringList);
  const [trips, setTrips] = useStoredValue<SavedTrip[]>(STORAGE_KEYS.trips, NO_TRIPS, isSavedTripList);

  return (
    <div className="space-y-14">
      <section aria-labelledby="wishlist">
        <h2 id="wishlist" className="mb-5">Wishlist</h2>
        {ready && favourites.length === 0 ? (
          <EmptyState title="Nothing saved yet" art={<CompassCharacter className="h-24 w-24" />}>
            <p>Tap the heart on any guide and it will be kept here.</p>
            <Link prefetch={false} href="/discover" className="btn btn-primary mt-3">Browse guides</Link>
          </EmptyState>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favourites.filter((slug) => cards[slug]).map((slug) => <li key={slug}>{cards[slug]}</li>)}
          </ul>
        )}
      </section>

      <Collections names={names} />

      <section aria-labelledby="trips">
        <h2 id="trips" className="mb-5">Saved trips</h2>
        {user ? (
          <p className="text-ink-2">
            Trips you save while signed in are kept in your account.{" "}
            <Link prefetch={false} href="/profile/trips" className="link-text">Open My trips</Link>
          </p>
        ) : trips.length === 0 ? (
          <p className="text-ink-2">
            Trips you save from the <Link prefetch={false} href="/planner" className="link-text">planner</Link> will appear here. They stay in this browser until you sign in.
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

      <Passport stateList={stateList} map={map} />

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
