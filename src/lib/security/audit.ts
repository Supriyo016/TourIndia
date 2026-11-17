import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { getStore, STORE_COLLECTIONS, type Doc, type Store } from "@/lib/database/store";

/**
 * Append-only logs for admin actions and security events. The app never updates or deletes
 * these records. Each one carries the hash of the record before it, so an edit or deletion
 * made straight in the database breaks the chain and `verifyChain` reports where.
 *
 * Never put passwords, codes, tokens or message contents in `detail`.
 */

export type LogKind = "audit" | "security";

export interface LogRecord extends Doc {
  /** Position in the chain; records are ordered by this, not by time. */
  seq: number;
  at: Date;
  /** Who did it (user id), when known. */
  actorId?: string;
  actorEmail?: string;
  action: string;
  /** What it was done to: a user id, comment id, role name… */
  target?: string;
  outcome: "ok" | "denied" | "failed";
  detail?: string;
  /** Short before/after values for changes, already trimmed of personal data. */
  before?: unknown;
  after?: unknown;
  /** Country from the edge, never an IP address. */
  country?: string;
  prevHash: string;
  hash: string;
}

const collectionFor = (kind: LogKind) => (kind === "audit" ? STORE_COLLECTIONS.audit : STORE_COLLECTIONS.securityEvents);

const canonical = (record: Omit<LogRecord, "hash">) =>
  JSON.stringify([record._id, record.seq, (record.at as Date).toISOString(), record.actorId ?? "", record.action, record.target ?? "", record.outcome, record.detail ?? "", record.before ?? null, record.after ?? null, record.country ?? "", record.prevHash]);

export const recordHash = (record: Omit<LogRecord, "hash">) => createHash("sha256").update(canonical(record)).digest("hex");

export type LogInput = Pick<LogRecord, "action" | "outcome"> & Partial<Pick<LogRecord, "actorId" | "actorEmail" | "target" | "detail" | "before" | "after" | "country">>;

/** Appends a record. Never throws: logging must not break the action it describes. */
export async function appendLog(kind: LogKind, input: LogInput, store?: Store | null): Promise<void> {
  try {
    const db = store ?? (await getStore());
    if (!db) return;
    const logs = db.collection<LogRecord>(collectionFor(kind));
    const [last] = await logs.find({ seq: { $exists: true } }, { sort: { seq: -1 }, limit: 1 }).toArray();
    const base: Omit<LogRecord, "hash"> = {
      _id: randomUUID(),
      seq: (last?.seq ?? 0) + 1,
      at: new Date(),
      ...input,
      detail: input.detail?.slice(0, 300),
      prevHash: last?.hash ?? "genesis",
    };
    await logs.insertOne({ ...base, hash: recordHash(base) } as LogRecord);
  } catch (error) {
    console.error(`[audit] could not append to the ${kind} log`, error instanceof Error ? error.name : "");
  }
}

export const audit = (input: LogInput, store?: Store | null) => appendLog("audit", input, store);
export const securityEvent = (input: LogInput, store?: Store | null) => appendLog("security", input, store);

/**
 * Checks the most recent `limit` records, oldest first. A record whose hash doesn't match its
 * contents was edited; a record whose prevHash doesn't match the one before it means something
 * between them was removed or inserted.
 */
export async function verifyChain(kind: LogKind, limit = 500): Promise<{ checked: number; problems: { id: string; at: Date; problem: "edited" | "gap" }[] }> {
  const db = await getStore();
  if (!db) return { checked: 0, problems: [] };
  // Records written before the chain existed have no seq and are skipped.
  const records = (await db.collection<LogRecord>(collectionFor(kind)).find({ seq: { $exists: true } }, { sort: { seq: -1 }, limit }).toArray()).reverse();
  const problems: { id: string; at: Date; problem: "edited" | "gap" }[] = [];
  records.forEach((record, index) => {
    const { hash, ...rest } = record;
    if (recordHash(rest) !== hash) problems.push({ id: record._id, at: record.at, problem: "edited" });
    const previous = records[index - 1];
    if (previous && record.prevHash !== previous.hash) problems.push({ id: record._id, at: record.at, problem: "gap" });
  });
  return { checked: records.length, problems };
}
