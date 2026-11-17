import "server-only";
import { createHash } from "node:crypto";
import { getStore, STORE_COLLECTIONS } from "@/lib/database/store";

/**
 * Two layers: a small in-memory LRU per server instance, then the database's
 * `translations` collection when a store is available, so a page translated once
 * is free for every later visitor. Only the hash of the source text is stored,
 * never the text itself.
 */
export const TRANSLATIONS_COLLECTION = STORE_COLLECTIONS.translations;
export const MEMORY_ENTRIES = 500;
const KEEP_DAYS = 180;
const MAX_STORED_CHARS = 9000;

type TranslationDoc = { _id: string; lang: string; text: string; createdAt: Date; expiresAt: Date };

export const cacheKey = (lang: string, text: string) => createHash("sha256").update(`${lang}\u0000${text}`).digest("hex");

const memory = new Map<string, string>();

export function memoryGet(key: string): string | undefined {
  const value = memory.get(key);
  if (value !== undefined) {
    // Re-inserting moves the entry to the newest end of the Map.
    memory.delete(key);
    memory.set(key, value);
  }
  return value;
}

export function memorySet(key: string, value: string) {
  memory.delete(key);
  memory.set(key, value);
  while (memory.size > MEMORY_ENTRIES) memory.delete(memory.keys().next().value!);
}

export const memorySize = () => memory.size;
export const clearMemoryCache = () => memory.clear();

/** Looks up many keys at once. A database problem is a cache miss, never an error. */
export async function storeGet(keys: string[]): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  if (!keys.length) return found;
  try {
    const store = await getStore();
    if (!store) return found;
    const rows = await store.collection<TranslationDoc>(TRANSLATIONS_COLLECTION).find({ _id: { $in: keys } }, { limit: keys.length }).toArray();
    for (const row of rows) if (typeof row.text === "string" && row.text.length <= MAX_STORED_CHARS) found.set(row._id, row.text);
  } catch {
    // Fall through: the translator will be asked instead.
  }
  return found;
}

export async function storePut(entries: { key: string; lang: string; text: string }[]) {
  if (!entries.length) return;
  try {
    const store = await getStore();
    if (!store) return;
    const collection = store.collection<TranslationDoc>(TRANSLATIONS_COLLECTION);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + KEEP_DAYS * 86_400_000);
    await Promise.all(
      entries
        .filter(({ text }) => text.length <= MAX_STORED_CHARS)
        .map(({ key, lang, text }) => collection.updateOne({ _id: key }, { $set: { lang, text, expiresAt }, $setOnInsert: { createdAt: now } }, { upsert: true })),
    );
  } catch {
    // Caching is best effort.
  }
}
