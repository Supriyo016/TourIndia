import "server-only";
import { randomUUID } from "node:crypto";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";

/**
 * Server errors for the admin health page. Each record holds only where it happened (a short
 * source label such as "trips") and the error's class name ("MongoServerError"), never the
 * message, request, address or user, because messages can carry personal data.
 * Records expire after 30 days (TTL index in scripts/db-setup.mjs).
 */

export interface AppErrorDoc extends Doc {
  at: Date;
  source: string;
  name: string;
  expiresAt: Date;
}

const KEEP_MS = 30 * 86_400_000;

/** An Error's class name, or a short fixed label passed as a string by the caller (never a message). */
const nameOf = (error: unknown) => (error instanceof Error ? error.name : typeof error === "string" ? error : "Unknown").replace(/[^\w.-]/g, "").slice(0, 60) || "Unknown";
const labelOf = (source: string) => source.replace(/[^\w .:/-]/g, "").slice(0, 40) || "app";

/** Logs the error's name to the console (as route handlers did before) and records it for the health page. Never throws. */
export async function reportError(source: string, error?: unknown): Promise<void> {
  console.error(`[${labelOf(source)}]`, nameOf(error));
  await recordError(source, error);
}

/** Records an error for the health page without logging it, for callers that already log their own line. */
export async function recordError(source: string, error?: unknown): Promise<void> {
  const label = labelOf(source);
  const name = nameOf(error);
  try {
    const store = await getStore();
    if (!store) return;
    const at = new Date();
    await store.collection<AppErrorDoc>(STORE_COLLECTIONS.appErrors).insertOne({ _id: randomUUID(), at, source: label, name, expiresAt: new Date(at.getTime() + KEEP_MS) });
  } catch {
    // Recording an error must never cause another one.
  }
}

/** Counts for the last hour, day and week, and the busiest sources in the last day. */
export async function errorSummary(now = Date.now()) {
  const store = await getStore();
  if (!store) return null;
  const errors = store.collection<AppErrorDoc>(STORE_COLLECTIONS.appErrors);
  const since = (ms: number) => ({ at: { $gte: new Date(now - ms) } });
  const [hour, day, week] = await Promise.all([errors.countDocuments(since(3_600_000)), errors.countDocuments(since(86_400_000)), errors.countDocuments(since(7 * 86_400_000))]);
  const recent = await errors.find(since(86_400_000), { sort: { at: -1 }, limit: 500 }).toArray();
  const bySource = new Map<string, { source: string; name: string; count: number; last: Date }>();
  for (const row of recent) {
    const key = `${row.source} ${row.name}`;
    const entry = bySource.get(key) ?? { source: row.source, name: row.name, count: 0, last: row.at };
    entry.count += 1;
    bySource.set(key, entry);
  }
  return { hour, day, week, top: [...bySource.values()].sort((a, b) => b.count - a.count).slice(0, 10) };
}
