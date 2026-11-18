"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { PassportEntry } from "@/features/saved/passport";
import { setSyncAccount } from "@/features/saved/sync";
import { storedInput } from "@/features/itinerary/share";
import { isNoteList, isSavedTripList, isStringList, readPassport, readStored, STORAGE_KEYS, writeStored, type PlanNote, type SavedTrip } from "@/hooks/use-stored-value";

type Lists = { places: string[]; passport: PassportEntry[]; notes: PlanNote[] };
type Offer = { extra: Lists; account: Lists; trips: SavedTrip[] };

const EMPTY: Lists = { places: [], passport: [], notes: [] };

const post = async (url: string, body: unknown) => {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown> & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "That didn't work. Please try again.");
  return data;
};

async function getJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { cache: "no-store" });
  return response.ok ? ((await response.json()) as T) : null;
}

const local = (): Lists => ({
  places: readStored<string[]>(STORAGE_KEYS.favourites, [], isStringList),
  passport: readPassport(),
  notes: readStored<PlanNote[]>(STORAGE_KEYS.notes, [], isNoteList),
});

function mirror(lists: Lists, owner: string | undefined) {
  writeStored(STORAGE_KEYS.favourites, lists.places);
  writeStored(STORAGE_KEYS.passport, lists.passport);
  writeStored(STORAGE_KEYS.notes, lists.notes);
  writeStored(STORAGE_KEYS.savedOwner, owner);
}

const count = (n: number, one: string, many: string) => (n ? `${n} ${n === 1 ? one : many}` : "");

/**
 * Keeps saved places, the passport and plan notes on this device in step with the signed-in
 * account, and offers to move trips saved in this browser into it.
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
      if (owner) mirror(EMPTY, undefined);
      return;
    }
    let cancelled = false;
    Promise.all([getJson<{ places: string[]; passport: PassportEntry[] }>("/api/saved"), getJson<{ notes: PlanNote[] }>("/api/notes")])
      .then(([saved, notes]) => {
        if (cancelled || !saved || !notes) return;
        const account: Lists = { places: saved.places, passport: saved.passport, notes: notes.notes };
        // A device holding another account's copy has nothing of its own to offer.
        const device = owner ? EMPTY : local();
        const states = new Set(account.passport.map((entry) => entry.state));
        const noteIds = new Set(account.notes.map((note) => note.id));
        const extra: Lists =
          owner === userId
            ? EMPTY
            : {
                places: device.places.filter((s) => !account.places.includes(s)),
                passport: device.passport.filter((entry) => !states.has(entry.state)),
                notes: device.notes.filter((note) => !noteIds.has(note.id) && Boolean(note.title.trim() || note.body.trim())),
              };
        // Trips saved in this browser before trips were kept in accounts are offered whoever saved them.
        const trips = readStored<SavedTrip[]>(STORAGE_KEYS.trips, [], isSavedTripList);
        if (!extra.places.length && !extra.passport.length && !extra.notes.length && !trips.length) {
          mirror(account, userId);
          setSyncAccount(userId);
        } else {
          setOffer({ extra, account, trips });
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
        if (offer.extra.places.length) {
          const data = (await post("/api/saved", { action: "merge", kind: "places", slugs: offer.extra.places })) as { places?: string[] };
          merged.places = data.places ?? merged.places;
        }
        if (offer.extra.passport.length) {
          const data = (await post("/api/saved", { action: "passport-merge", entries: offer.extra.passport })) as { passport?: PassportEntry[] };
          merged.passport = data.passport ?? merged.passport;
        }
        if (offer.extra.notes.length) {
          // Five at a time keeps each request small; past the 100-note limit the rest are skipped.
          const notes = offer.extra.notes.map(({ id, title, body, date }) => ({ id, title: title.slice(0, 120), body: body.slice(0, 5000), date }));
          for (let i = 0; i < notes.length; i += 5) await post("/api/notes", { action: "import", notes: notes.slice(i, i + 5) });
          merged.notes = (await getJson<{ notes: PlanNote[] }>("/api/notes"))?.notes ?? merged.notes;
          // Past the account's note limit some may not fit. Keep this browser's copy rather than lose them.
          const inAccount = new Set(merged.notes.map((note) => note.id));
          const left = notes.filter((note) => !inAccount.has(note.id)).length;
          if (left) throw new Error(`Your account holds up to 100 notes, so ${left} ${left === 1 ? "note" : "notes"} didn't fit. ${left === 1 ? "It's" : "They're"} still in this browser: delete some notes in your account, then try again.`);
        }
        lists = merged;
        // Five at a time keeps each request small; a trip that can't be rebuilt is skipped by the server.
        const plans = offer.trips.map((trip) => ({ name: (trip.name || "Trip").slice(0, 80), input: storedInput(trip.input), layout: trip.days.map((day) => day.items.map((item) => item.id)) }));
        for (let i = 0; i < plans.length; i += 5) await post("/api/trips", { action: "import", trips: plans.slice(i, i + 5) });
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
    count(offer.extra.places.length, "place", "places"),
    count(offer.extra.passport.length, "passport state", "passport states"),
    count(offer.extra.notes.length, "note", "notes"),
    count(offer.trips.length, "trip", "trips"),
  ].filter(Boolean);
  const total = offer.extra.places.length + offer.extra.passport.length + offer.extra.notes.length + offer.trips.length;
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
