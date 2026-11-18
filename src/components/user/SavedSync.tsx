"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { setSyncAccount } from "@/features/saved/sync";
import { storedInput } from "@/features/itinerary/share";
import { isSavedTripList, isStringList, readStored, STORAGE_KEYS, writeStored, type SavedTrip } from "@/hooks/use-stored-value";

type Lists = { places: string[]; stamps: string[] };
type Offer = { extra: Lists; account: Lists; trips: SavedTrip[] };

const post = async (body: unknown) => {
  const response = await fetch(body && typeof body === "object" && "trips" in body ? "/api/trips" : "/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown> & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "That didn't work. Please try again.");
  return data;
};

const local = (): Lists => ({ places: readStored<string[]>(STORAGE_KEYS.favourites, [], isStringList), stamps: readStored<string[]>(STORAGE_KEYS.stamps, [], isStringList) });

function mirror(lists: Lists, owner: string | undefined) {
  writeStored(STORAGE_KEYS.favourites, lists.places);
  writeStored(STORAGE_KEYS.stamps, lists.stamps);
  writeStored(STORAGE_KEYS.savedOwner, owner);
}

/**
 * Keeps saved places and passport stamps on this device in step with the signed-in account, and
 * offers to move trips saved in this browser into it.
 *
 * - Signed in: the device shows the account's lists. If a guest had saved things here first,
 *   it asks before adding them, so a shared computer never mixes two people's lists silently.
 * - Signed out: an account's lists are cleared from the device (they're safe on the server);
 *   a guest's own lists are left alone.
 */
export function SavedSync() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const userId = user?.id;

  useEffect(() => {
    if (loading) return;
    // "" means a guest's own lists (the fallback's type is what readStored checks against).
    const owner = readStored<string>(STORAGE_KEYS.savedOwner, "");
    if (!userId) {
      setSyncAccount(null);
      if (owner) mirror({ places: [], stamps: [] }, undefined);
      return;
    }
    let cancelled = false;
    fetch("/api/saved", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<Lists>) : null))
      .then((account) => {
        if (cancelled || !account) return;
        const device = owner ? { places: [], stamps: [] } : local();
        const extra = owner === userId ? { places: [], stamps: [] } : { places: device.places.filter((s) => !account.places.includes(s)), stamps: device.stamps.filter((s) => !account.stamps.includes(s)) };
        // Trips saved in this browser before trips were kept in accounts are offered whoever saved them.
        const trips = readStored<SavedTrip[]>(STORAGE_KEYS.trips, [], isSavedTripList);
        if (!extra.places.length && !extra.stamps.length && !trips.length) {
          mirror({ places: account.places, stamps: account.stamps }, userId);
          setSyncAccount(userId);
        } else {
          setOffer({ extra, account: { places: account.places, stamps: account.stamps }, trips });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [userId, loading]);

  if (!offer || !userId) return null;

  const decide = async (add: boolean) => {
    setBusy(true);
    setError("");
    try {
      let lists = offer.account;
      if (add) {
        const merged: Lists = { ...lists };
        for (const kind of ["places", "stamps"] as const) {
          if (!offer.extra[kind].length) continue;
          const data = (await post({ action: "merge", kind, slugs: offer.extra[kind] })) as Partial<Lists>;
          merged[kind] = data[kind] ?? merged[kind];
        }
        lists = merged;
        // Five at a time keeps each request small; a trip that can't be rebuilt is skipped by the server.
        const plans = offer.trips.map((trip) => ({ name: (trip.name || "Trip").slice(0, 80), input: storedInput(trip.input), layout: trip.days.map((day) => day.items.map((item) => item.id)) }));
        for (let i = 0; i < plans.length; i += 5) await post({ action: "import", trips: plans.slice(i, i + 5) });
      }
      mirror(lists, userId);
      if (offer.trips.length) {
        writeStored(STORAGE_KEYS.trips, []);
        // Pages that list trips from the server (My trips, the overview) pick up the new ones.
        router.refresh();
      }
      setSyncAccount(userId);
      setOffer(null);
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const parts = [
    offer.extra.places.length ? `${offer.extra.places.length} ${offer.extra.places.length === 1 ? "place" : "places"}` : "",
    offer.extra.stamps.length ? `${offer.extra.stamps.length} passport ${offer.extra.stamps.length === 1 ? "stamp" : "stamps"}` : "",
    offer.trips.length ? `${offer.trips.length} ${offer.trips.length === 1 ? "trip" : "trips"}` : "",
  ].filter(Boolean);
  const total = offer.extra.places.length + offer.extra.stamps.length + offer.trips.length;
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts[0];

  return (
    <section aria-labelledby="saved-sync-title" className="glass-panel fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl p-4 shadow-lg sm:bottom-6">
      <h2 id="saved-sync-title" className="text-lg">
        Add what you saved on this device?
      </h2>
      <p className="mt-1 text-sm text-ink-2">
        Before you signed in, {list} {total === 1 ? "was" : "were"} saved in this browser. Add {total === 1 ? "it" : "them"} to your account so you see{" "}
        {total === 1 ? "it" : "them"} on your other devices too?
      </p>
      {error && (
        <p role="alert" className="field-error mt-2">
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-accent" disabled={busy} onClick={() => void decide(true)}>
          Add to my account
        </button>
        <button type="button" className="btn btn-outline" disabled={busy} onClick={() => void decide(false)}>
          No, clear {total === 1 ? "it" : "them"} from this browser
        </button>
      </div>
    </section>
  );
}
