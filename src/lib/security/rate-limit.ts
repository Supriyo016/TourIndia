import "server-only";
import { createHash } from "node:crypto";
import { COLLECTIONS, getDatabase, isDatabaseConfigured } from "@/lib/database/mongo";

interface Limit {
  max: number;
  windowSeconds: number;
}

const MAX_MEMORY_ENTRIES = 5000;
const memory = new Map<string, { count: number; resetAt: number }>();

function hit(key: string, { max, windowSeconds }: Limit, now = Date.now()) {
  if (memory.size >= MAX_MEMORY_ENTRIES) {
    for (const [entry, value] of memory) if (value.resetAt <= now) memory.delete(entry);
    // A Map iterates oldest first, so this drops the oldest entries if the map is still full.
    for (const entry of memory.keys()) {
      if (memory.size < MAX_MEMORY_ENTRIES) break;
      memory.delete(entry);
    }
  }
  const current = memory.get(key);
  if (!current || current.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  current.count += 1;
  return current.count <= max;
}

/**
 * Hashes reach the database only when one is configured, and a public default
 * salt would make them reversible, so production refuses to run without a real one.
 */
export function isSaltConfigured(): boolean {
  if (process.env.NODE_ENV !== "production" || !isDatabaseConfigured()) return true;
  return (process.env.RATE_LIMIT_SALT ?? "").length >= 32;
}

export function hashClient(ip: string): string {
  return createHash("sha256").update(`${process.env.RATE_LIMIT_SALT ?? "tour-india-dev"}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Fixed-window limiter. Uses MongoDB when configured so limits hold across
 * server instances, and otherwise falls back to per-instance memory. Raw IP
 * addresses are never stored.
 */
export async function isAllowed(bucket: string, ip: string, limit: Limit): Promise<boolean> {
  const client = hashClient(ip);
  if (!isDatabaseConfigured()) return hit(`${bucket}:${client}`, limit);

  const windowStart = Math.floor(Date.now() / (limit.windowSeconds * 1000));
  try {
    const db = await getDatabase();
    const result = await db.collection<{ _id: string; count: number; expiresAt: Date }>(COLLECTIONS.rateLimits).findOneAndUpdate(
      { _id: `${bucket}:${client}:${windowStart}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(Date.now() + limit.windowSeconds * 2000) } },
      { upsert: true, returnDocument: "after" },
    );
    return (result?.count ?? 1) <= limit.max;
  } catch {
    return hit(`${bucket}:${client}`, limit);
  }
}
