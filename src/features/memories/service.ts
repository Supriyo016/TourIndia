import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { moderate } from "@/features/community/moderation";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";
import { isKnownPhoto, isKnownPlace, placeName, stateOf } from "./places";
import { MEMORY_LIMIT, type MemoryInput, type MemoryView } from "./schema";

/**
 * Travel memories. Private by default: only the owner sees them, unless they turn on a read-only
 * link for one memory. Whatever a link shows goes through the comment filter, both when the link
 * is turned on and every time it's opened, so a later change to the filter still applies.
 */

export interface MemoryDoc extends Doc {
  userId: string;
  title: string;
  body: string;
  date: string;
  place: string;
  tags: string[];
  photos: string[];
  /** Present while the read-only link is on; a new one each time sharing is turned on. */
  shareId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MemoryError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

async function memories() {
  const store = await getStore();
  if (!store) throw new MemoryError("Memories aren't available right now.", 503);
  return store.collection<MemoryDoc>(STORE_COLLECTIONS.memories);
}

const view = (m: MemoryDoc): MemoryView => ({
  id: m._id,
  title: m.title,
  body: m.body,
  date: m.date,
  place: m.place,
  placeName: placeName(m.place),
  tags: m.tags,
  photos: m.photos.filter(isKnownPhoto),
  shareId: m.shareId ?? null,
  updatedAt: m.updatedAt.toISOString(),
});

function check(input: MemoryInput) {
  if (!isKnownPlace(input.place)) throw new MemoryError("Choose a place from the list.", 422);
  if (input.photos.some((key) => !isKnownPhoto(key))) throw new MemoryError("Choose photos from the gallery.", 422);
}

/** What a link would show, passed through the comment filter. Null with a reason when it can't be shown. */
function forOthers(m: Pick<MemoryDoc, "title" | "body" | "tags">): { ok: true; title: string; body: string; tags: string[] } | { ok: false; reason: string } {
  const pieces = [m.title, m.body, ...m.tags];
  const checked: string[] = [];
  for (const piece of pieces) {
    if (!piece) {
      checked.push("");
      continue;
    }
    const result = moderate(piece);
    if (result.action === "reject") return { ok: false, reason: result.reason.replace(/comments/gi, "shared memories") };
    if (result.action === "review") return { ok: false, reason: "Please reword this before sharing it. Shared memories aren't checked by a person first." };
    checked.push(result.text);
  }
  const [title = "", body = "", ...tags] = checked;
  return { ok: true, title, body, tags };
}

export interface MemoryFilter {
  tag?: string;
  /** A place or state value; a state also matches memories of its places. */
  place?: string;
  /** Free text matched against the title, words, tags and place name. */
  q?: string;
}

/** The person's memories, newest date first, filtered in memory (at most 200 each). */
export async function listMemories(userId: string, filter: MemoryFilter = {}): Promise<MemoryView[]> {
  const rows = await (await memories()).find({ userId }, { sort: { date: -1, createdAt: -1 }, limit: MEMORY_LIMIT }).toArray();
  const q = filter.q?.trim().toLowerCase() ?? "";
  return rows
    .map(view)
    .filter((m) => !filter.tag || m.tags.includes(filter.tag))
    .filter((m) => !filter.place || m.place === filter.place || (filter.place.startsWith("state:") && stateOf(m.place) === filter.place))
    .filter((m) => !q || [m.title, m.body, m.placeName ?? "", ...m.tags].some((text) => text.toLowerCase().includes(q)));
}

/** Every tag and place the person has used, for the filters. */
export async function memoryFacets(userId: string): Promise<{ tags: { tag: string; count: number }[]; places: { value: string; label: string; count: number }[] }> {
  const rows = await (await memories()).find({ userId }, { limit: MEMORY_LIMIT }).toArray();
  const tags = new Map<string, number>();
  const places = new Map<string, number>();
  for (const row of rows) {
    for (const tag of row.tags) tags.set(tag, (tags.get(tag) ?? 0) + 1);
    if (row.place && placeName(row.place)) places.set(row.place, (places.get(row.place) ?? 0) + 1);
  }
  return {
    tags: [...tags].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)),
    places: [...places].map(([value, count]) => ({ value, label: placeName(value)!, count })).sort((a, b) => a.label.localeCompare(b.label)),
  };
}

export async function createMemory(userId: string, input: MemoryInput): Promise<MemoryView> {
  check(input);
  const collection = await memories();
  if ((await collection.countDocuments({ userId })) >= MEMORY_LIMIT) throw new MemoryError(`You can keep up to ${MEMORY_LIMIT} memories. Delete an old one first.`, 422);
  const now = new Date();
  const doc: MemoryDoc = { _id: randomUUID(), userId, ...input, createdAt: now, updatedAt: now };
  await collection.insertOne(doc);
  return view(doc);
}

async function own(userId: string, id: string): Promise<MemoryDoc> {
  const found = await (await memories()).findOne({ _id: id, userId });
  // Someone else's memory looks the same as one that doesn't exist.
  if (!found) throw new MemoryError("That memory doesn't exist.", 404);
  return found;
}

export async function updateMemory(userId: string, id: string, input: MemoryInput): Promise<MemoryView> {
  const current = await own(userId, id);
  check(input);
  if (current.shareId) {
    const shown = forOthers(input);
    if (!shown.ok) throw new MemoryError(`This memory is shared by link. ${shown.reason} Or turn the link off first.`, 422);
  }
  const updatedAt = new Date();
  await (await memories()).updateOne({ _id: id, userId }, { $set: { ...input, updatedAt } });
  return view({ ...current, ...input, updatedAt });
}

export async function deleteMemory(userId: string, id: string) {
  await own(userId, id);
  await (await memories()).deleteOne({ _id: id, userId });
}

export async function shareMemory(userId: string, id: string, on: boolean): Promise<string | null> {
  const current = await own(userId, id);
  const collection = await memories();
  if (!on) {
    await collection.updateOne({ _id: id, userId }, { $set: { updatedAt: new Date() }, $unset: { shareId: "" } });
    return null;
  }
  const shown = forOthers(current);
  if (!shown.ok) throw new MemoryError(shown.reason, 422);
  const shareId = randomBytes(12).toString("base64url");
  await collection.updateOne({ _id: id, userId }, { $set: { shareId, updatedAt: new Date() } });
  return shareId;
}

/** One memory for its owner. */
export async function memoryForOwner(userId: string, id: string): Promise<MemoryView | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const found = await (await memories()).findOne({ _id: id, userId }).catch(() => null);
  return found ? view(found) : null;
}

export interface SharedMemory {
  title: string;
  body: string;
  date: string;
  placeName: string | null;
  tags: string[];
  photos: string[];
}

/** What a share link shows: the memory, filtered, and never who wrote it. */
export async function sharedMemory(shareId: string): Promise<SharedMemory | null> {
  if (!/^[A-Za-z0-9_-]{16}$/.test(shareId)) return null;
  const store = await getStore();
  if (!store) return null;
  const found = await store.collection<MemoryDoc>(STORE_COLLECTIONS.memories).findOne({ shareId });
  if (!found) return null;
  const owner = await store.collection(STORE_COLLECTIONS.users).findOne({ _id: found.userId });
  if (!owner || owner.status !== "active") return null;
  const shown = forOthers(found);
  if (!shown.ok) return null;
  return { title: shown.title, body: shown.body, date: found.date, placeName: placeName(found.place), tags: shown.tags, photos: found.photos.filter(isKnownPhoto) };
}

export async function memoryCount(userId: string) {
  const store = await getStore();
  return store ? store.collection(STORE_COLLECTIONS.memories).countDocuments({ userId }) : null;
}

export async function deleteMemories(userId: string) {
  await (await getStore())?.collection(STORE_COLLECTIONS.memories).deleteMany({ userId });
}
