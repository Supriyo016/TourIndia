"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { setSyncAccount } from "@/features/saved/sync";
import { isStringList, readStored, STORAGE_KEYS, writeStored } from "@/hooks/use-stored-value";

type Lists = { places: string[]; stamps: string[] };
type Offer = { extra: Lists; account: Lists };

const local = (): Lists => ({ places: readStored<string[]>(STORAGE_KEYS.favourites, [], isStringList), stamps: readStored<string[]>(STORAGE_KEYS.stamps, [], isStringList) });

function mirror(lists: Lists, owner: string | undefined) {
  writeStored(STORAGE_KEYS.favourites, lists.places);
  writeStored(STORAGE_KEYS.stamps, lists.stamps);
  writeStored(STORAGE_KEYS.savedOwner, owner);
}

/**
 * Keeps saved places and passport stamps on this device in step with the signed-in account.
 *
 * - Signed in: the device shows the account's lists. If a guest had saved things here first,
 *   it asks before adding them, so a shared computer never mixes two people's lists silently.
 * - Signed out: an account's lists are cleared from the device (they're safe on the server);
 *   a guest's own lists are left alone.
 */
export function SavedSync() {
  const { user, loading } = useAuth();
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
        const extra = { places: device.places.filter((s) => !account.places.includes(s)), stamps: device.stamps.filter((s) => !account.stamps.includes(s)) };
        if (owner === userId || (!extra.places.length && !extra.stamps.length)) {
          mirror({ places: account.places, stamps: account.stamps }, userId);
          setSyncAccount(userId);
        } else {
          setOffer({ extra, account: { places: account.places, stamps: account.stamps } });
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
          const response = await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "merge", kind, slugs: offer.extra[kind] }) });
          const data = (await response.json()) as Partial<Lists> & { error?: string };
          if (!response.ok) throw new Error(data.error ?? "That didn't work. Please try again.");
          merged[kind] = data[kind] ?? merged[kind];
        }
        lists = merged;
      }
      mirror(lists, userId);
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
  ].filter(Boolean);
  const total = offer.extra.places.length + offer.extra.stamps.length;

  return (
    <section aria-labelledby="saved-sync-title" className="glass-panel fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl p-4 shadow-lg sm:bottom-6">
      <h2 id="saved-sync-title" className="text-lg">
        Add what you saved on this device?
      </h2>
      <p className="mt-1 text-sm text-ink-2">
        Before you signed in, {parts.join(" and ")} {total === 1 ? "was" : "were"} saved in this browser. Add {total === 1 ? "it" : "them"} to your account so you see{" "}
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
          No, clear them from this browser
        </button>
      </div>
    </section>
  );
}
