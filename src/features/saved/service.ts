import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { destinations, states } from "@/data";
import { moderate } from "@/features/community/moderation";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";
import { applyPassport, fromStamps, isVisitMonth, visitedStates, type PassportEntry, type PassportStatus } from "./passport";

/**
 * Saved places, passport stamps and collections for signed-in people. Guests keep the same
 * lists in their browser; on sign-in the browser offers to add them here (see SavedSync).
 */

export type SavedKind = "places" | "stamps";

export const LIMITS = { places: 500, stamps: 60, collections: 30, perCollection: 100 } as const;

const PLACE_SLUGS = new Set(destinations.map((d) => d.slug));
const STATE_SLUGS = new Set(states.map((s) => s.slug));
export const isKnown = (kind: SavedKind, slug: string) => (kind === "places" ? PLACE_SLUGS : STATE_SLUGS).has(slug);

export interface SavedDoc extends Doc {
  places: string[];
  /** The visited states, kept alongside the passport for anything that only needs visits. */
  stamps: string[];
  /** Per-state status. Missing on lists saved before the passport had statuses (see fromStamps). */
  passport?: PassportEntry[];
  updatedAt: Date;
}

export interface CollectionDoc extends Doc {
  userId: string;
  name: string;
  note: string;
  places: string[];
  /** Present while the read-only link is on. A new one is made each time sharing is turned on. */
  shareId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionView {
  id: string;
  name: string;
  note: string;
  places: string[];
  shareId: string | null;
  updatedAt: string;
}

export class SavedError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

async function store() {
  const value = await getStore();
  if (!value) throw new SavedError("Saving to your account isn't available right now.", 503);
  return value;
}

const view = (c: CollectionDoc): CollectionView => ({ id: c._id, name: c.name, note: c.note, places: c.places, shareId: c.shareId ?? null, updatedAt: c.updatedAt.toISOString() });

export async function getSaved(userId: string): Promise<{ places: string[]; stamps: string[]; passport: PassportEntry[] }> {
  const doc = await (await store()).collection<SavedDoc>(STORE_COLLECTIONS.saved).findOne({ _id: userId });
  // Drops anything whose guide has since been removed.
  const passport = (doc?.passport ?? fromStamps(doc?.stamps ?? [])).filter((entry) => isKnown("stamps", entry.state));
  return { places: (doc?.places ?? []).filter((s) => isKnown("places", s)), stamps: visitedStates(passport), passport };
}

async function writePlaces(userId: string, next: string[]) {
  if (next.length > LIMITS.places) throw new SavedError(`You can save up to ${LIMITS.places} places.`, 422);
  await (await store())
    .collection<SavedDoc>(STORE_COLLECTIONS.saved)
    .updateOne({ _id: userId }, { $set: { places: next, updatedAt: new Date() }, $setOnInsert: { stamps: [] } }, { upsert: true });
}

async function writePassport(userId: string, next: PassportEntry[]) {
  if (next.length > LIMITS.stamps) throw new SavedError("That's more states than there are.", 422);
  await (await store())
    .collection<SavedDoc>(STORE_COLLECTIONS.saved)
    .updateOne({ _id: userId }, { $set: { passport: next, stamps: visitedStates(next), updatedAt: new Date() }, $setOnInsert: { places: [] } }, { upsert: true });
}

function checkEntry(state: string, status: PassportStatus | null, month: string | null | undefined) {
  if (!isKnown("stamps", state)) throw new SavedError("That isn't a state or Union Territory.", 422);
  if (month && status !== "visited") throw new SavedError("Only a visit can have a month.", 422);
  if (month && !isVisitMonth(month)) throw new SavedError("Choose a month between 1950 and now.", 422);
}

/** Sets one state's passport status, or removes it with null. */
export async function setPassport(userId: string, state: string, status: PassportStatus | null, month: string | null = null) {
  checkEntry(state, status, month);
  const next = applyPassport((await getSaved(userId)).passport, state, status, month);
  await writePassport(userId, next);
  return next;
}

/** Adds a browser's passport to the account. States the account already has keep the account's status. */
export async function mergePassport(userId: string, entries: PassportEntry[]) {
  const current = (await getSaved(userId)).passport;
  const have = new Set(current.map((entry) => entry.state));
  const incoming: PassportEntry[] = [];
  for (const entry of entries) {
    if (have.has(entry.state) || !isKnown("stamps", entry.state)) continue;
    // A bad month is dropped rather than losing the visit.
    const month = entry.status === "visited" && entry.month && isVisitMonth(entry.month) ? entry.month : null;
    incoming.push(applyPassport([], entry.state, entry.status, month)[0]!);
    have.add(entry.state);
  }
  if (!incoming.length) return current;
  const next = [...current, ...incoming].slice(0, LIMITS.stamps);
  await writePassport(userId, next);
  return next;
}

/** Adds or removes one item. Newest places go first, like the heart button on this device. */
export async function setItem(userId: string, kind: SavedKind, slug: string, on: boolean) {
  if (!isKnown(kind, slug)) throw new SavedError(kind === "places" ? "That place isn't in the guide." : "That isn't a state or Union Territory.", 422);
  // A stamp is a visit in the passport (kept for browsers still running the older page).
  if (kind === "stamps") return visitedStates(await setPassport(userId, slug, on ? "visited" : null));
  const current = (await getSaved(userId))[kind];
  const has = current.includes(slug);
  if (has === on) return current;
  const next = on ? [slug, ...current] : current.filter((item) => item !== slug);
  await writePlaces(userId, next);
  return next;
}

/** Adds a browser's list to the account, keeping what the account already has. Unknown items are ignored. */
export async function mergeItems(userId: string, kind: SavedKind, slugs: string[]) {
  if (kind === "stamps") return visitedStates(await mergePassport(userId, fromStamps(slugs)));
  const current = (await getSaved(userId))[kind];
  const have = new Set(current);
  const incoming = [...new Set(slugs)].filter((slug) => isKnown(kind, slug) && !have.has(slug));
  if (!incoming.length) return current;
  const next = [...incoming, ...current].slice(0, LIMITS.places);
  await writePlaces(userId, next);
  return next;
}

function cleanText(label: string, value: string) {
  if (!value) return "";
  const result = moderate(value);
  if (result.action === "reject") throw new SavedError(`${label}: ${result.reason.replace("in comments", "here")}`, 422);
  if (result.action === "review") throw new SavedError(`${label}: please reword this.`, 422);
  return result.text;
}

export async function listCollections(userId: string): Promise<CollectionView[]> {
  const rows = await (await store()).collection<CollectionDoc>(STORE_COLLECTIONS.collections).find({ userId }, { sort: { updatedAt: -1 }, limit: LIMITS.collections }).toArray();
  return rows.map(view);
}

export async function createCollection(userId: string, input: { name: string; note: string; places: string[] }): Promise<CollectionView> {
  const db = await store();
  const collections = db.collection<CollectionDoc>(STORE_COLLECTIONS.collections);
  if ((await collections.countDocuments({ userId })) >= LIMITS.collections) throw new SavedError(`You can have up to ${LIMITS.collections} collections.`, 422);
  const now = new Date();
  const doc: CollectionDoc = {
    _id: randomUUID(),
    userId,
    name: cleanText("Name", input.name),
    note: cleanText("Note", input.note),
    places: [...new Set(input.places)].filter((slug) => isKnown("places", slug)).slice(0, LIMITS.perCollection),
    createdAt: now,
    updatedAt: now,
  };
  await collections.insertOne(doc);
  return view(doc);
}

async function own(userId: string, id: string) {
  const found = await (await store()).collection<CollectionDoc>(STORE_COLLECTIONS.collections).findOne({ _id: id, userId });
  // Someone else's collection looks the same as one that doesn't exist.
  if (!found) throw new SavedError("That collection doesn't exist.", 404);
  return found;
}

export async function updateCollection(userId: string, id: string, input: { name?: string; note?: string; places?: string[] }): Promise<CollectionView> {
  const current = await own(userId, id);
  const set: Partial<CollectionDoc> = { updatedAt: new Date() };
  if (input.name !== undefined) set.name = cleanText("Name", input.name);
  if (input.note !== undefined) set.note = cleanText("Note", input.note);
  if (input.places !== undefined) {
    const places = [...new Set(input.places)].filter((slug) => isKnown("places", slug));
    if (places.length > LIMITS.perCollection) throw new SavedError(`A collection can hold up to ${LIMITS.perCollection} places.`, 422);
    set.places = places;
  }
  await (await store()).collection<CollectionDoc>(STORE_COLLECTIONS.collections).updateOne({ _id: id, userId }, { $set: set });
  return view({ ...current, ...set } as CollectionDoc);
}

export async function deleteCollection(userId: string, id: string) {
  await own(userId, id);
  await (await store()).collection(STORE_COLLECTIONS.collections).deleteOne({ _id: id, userId });
}

/** Turns the read-only link on (always a fresh address, so an old link never comes back) or off. */
export async function shareCollection(userId: string, id: string, on: boolean): Promise<CollectionView> {
  const current = await own(userId, id);
  const collections = (await store()).collection<CollectionDoc>(STORE_COLLECTIONS.collections);
  if (!on) {
    await collections.updateOne({ _id: id, userId }, { $unset: { shareId: "" }, $set: { updatedAt: new Date() } });
    const { shareId: _old, ...rest } = current;
    void _old;
    return view(rest as CollectionDoc);
  }
  const shareId = randomBytes(12).toString("base64url");
  await collections.updateOne({ _id: id, userId }, { $set: { shareId, updatedAt: new Date() } });
  return view({ ...current, shareId });
}

/** What a share link shows: the name, note and places. Never who made it. */
export async function sharedCollection(shareId: string): Promise<{ name: string; note: string; places: string[] } | null> {
  if (!/^[A-Za-z0-9_-]{16}$/.test(shareId)) return null;
  const store = await getStore();
  const found = await store?.collection<CollectionDoc>(STORE_COLLECTIONS.collections).findOne({ shareId });
  if (!found) return null;
  // Suspended or banned accounts' links stop working until the account is restored.
  const owner = await store!.collection(STORE_COLLECTIONS.users).findOne({ _id: found.userId });
  if (!owner || owner.status !== "active") return null;
  return { name: found.name, note: found.note, places: found.places.filter((slug) => isKnown("places", slug)) };
}

export async function savedCounts(userId: string) {
  const db = await getStore();
  if (!db) return null;
  const [saved, collections, trips] = await Promise.all([
    getSaved(userId),
    db.collection(STORE_COLLECTIONS.collections).countDocuments({ userId }),
    db.collection(STORE_COLLECTIONS.trips).countDocuments({ userId, status: "active" }),
  ]);
  return { places: saved.places.length, stamps: saved.stamps.length, collections, trips, passport: saved.passport };
}

export async function deleteSaved(userId: string) {
  const db = await getStore();
  if (!db) return;
  await db.collection(STORE_COLLECTIONS.saved).deleteOne({ _id: userId });
  await db.collection(STORE_COLLECTIONS.collections).deleteMany({ userId });
}
