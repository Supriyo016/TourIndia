import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { gunzipSync } from "node:zlib";
import type { UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Doc, type Store } from "@/lib/database/store";
import { audit } from "@/lib/security/audit";
import { BACKUP_FORMAT, BACKUP_VERSION, checksumPart, decode, encode, exportDoc, exportedCollections, MAX_DOCS, NOT_RESTORED, STRIPPED_FIELDS, verifyBackup, type BackupFile, type VerifyResult } from "./format";

/**
 * Backups without file storage: the admin downloads a compressed export, and the site keeps only a
 * history record (who, when, counts, checksum). Verifying reads an uploaded file and writes
 * nothing. Restoring is Super-Admin-only, needs a dry run first and puts back each record in the
 * file; records created after the backup are kept.
 */

export interface BackupRecord extends Doc {
  createdAt: Date;
  createdBy: string;
  createdByEmail: string;
  status: "started" | "complete";
  finishedAt?: Date;
  counts?: Record<string, number>;
  checksum?: string;
  /** Uncompressed size in bytes. */
  bytes?: number;
}

export class BackupError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

const BATCH = 500;

async function db(): Promise<Store> {
  const store = await getStore();
  if (!store) throw new BackupError("The database isn't connected.", 503);
  return store;
}

export async function backupHistory(limit = 20): Promise<BackupRecord[]> {
  const store = await getStore();
  if (!store) return [];
  return store.collection<BackupRecord>(STORE_COLLECTIONS.backups).find({}, { sort: { createdAt: -1 }, limit }).toArray();
}

type Actor = Pick<UserDoc, "_id" | "email">;

/**
 * Streams a gzip-compressed backup, collection by collection, so it never has to be held in memory
 * whole. The history record is completed (with counts and checksum) when the last byte is written.
 */
export async function backupStream(actor: Actor): Promise<{ stream: ReadableStream<Uint8Array>; id: string; filename: string }> {
  const store = await db();
  const id = randomUUID();
  const createdAt = new Date();
  await store.collection<BackupRecord>(STORE_COLLECTIONS.backups).insertOne({ _id: id, createdAt, createdBy: actor._id, createdByEmail: actor.email, status: "started" });
  const encoder = new TextEncoder();
  const hash = createHash("sha256");
  const counts: Record<string, number> = {};
  let bytes = 0;

  async function* pieces(): AsyncGenerator<string> {
    yield `{"format":${JSON.stringify(BACKUP_FORMAT)},"version":${BACKUP_VERSION},"createdAt":${JSON.stringify(createdAt.toISOString())},"collections":{`;
    let firstCollection = true;
    for (const name of exportedCollections()) {
      yield `${firstCollection ? "" : ","}${JSON.stringify(name)}:[`;
      firstCollection = false;
      counts[name] = 0;
      const collection = store.collection(name);
      for (let skip = 0; skip < MAX_DOCS; skip += BATCH) {
        const docs = await collection.find({}, { sort: { _id: 1 }, skip, limit: BATCH }).toArray();
        let piece = "";
        for (const doc of docs) {
          const json = JSON.stringify(exportDoc(name, doc));
          hash.update(checksumPart(name, json));
          piece += `${counts[name] ? "," : ""}${json}`;
          counts[name] += 1;
        }
        if (piece) yield piece;
        if (docs.length < BATCH) break;
      }
      yield "]";
    }
    const checksum = hash.digest("hex");
    yield `},"counts":${JSON.stringify(counts)},"checksum":"${checksum}"}`;
    await store.collection<BackupRecord>(STORE_COLLECTIONS.backups).updateOne({ _id: id }, { $set: { status: "complete", finishedAt: new Date(), counts, checksum, bytes } });
    await audit({ actorId: actor._id, actorEmail: actor.email, action: "backup.create", target: id, outcome: "ok", detail: `${Object.values(counts).reduce((a, b) => a + b, 0)} records, ${checksum.slice(0, 12)}` }, store);
  }

  const iterator = pieces();
  const source = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await iterator.next();
        if (done) return controller.close();
        const chunk = encoder.encode(value);
        bytes += chunk.byteLength;
        controller.enqueue(chunk);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return(undefined);
    },
  });
  const stream = source.pipeThrough(new CompressionStream("gzip") as unknown as TransformStream<Uint8Array, Uint8Array>);
  return { stream, id, filename: `tour-india-backup-${createdAt.toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json.gz` };
}

/** Reads an uploaded backup: gzip or plain JSON, up to 200 MB once expanded. */
export function parseUpload(bytes: Uint8Array): unknown {
  let text: string;
  try {
    const gzipped = bytes[0] === 0x1f && bytes[1] === 0x8b;
    text = gzipped ? gunzipSync(bytes, { maxOutputLength: 200 * 1024 * 1024 }).toString("utf8") : new TextDecoder().decode(bytes);
  } catch {
    throw new BackupError("That file couldn't be decompressed. Upload the .json.gz file exactly as it was downloaded.", 422);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new BackupError("That file isn't valid JSON, so it isn't a complete backup.", 422);
  }
}

/** Checks an uploaded backup and says whether this site made it. Audited; writes nothing else. */
export async function verifyUpload(actor: Actor, bytes: Uint8Array): Promise<VerifyResult & { madeHere?: { at: Date; by: string } }> {
  const { result } = verifyBackup(parseUpload(bytes));
  const store = await getStore();
  let madeHere: { at: Date; by: string } | undefined;
  if (store && result.checksum) {
    const record = await store.collection<BackupRecord>(STORE_COLLECTIONS.backups).findOne({ checksum: result.checksum });
    if (record) madeHere = { at: record.createdAt, by: record.createdByEmail };
  }
  await audit({ actorId: actor._id, actorEmail: actor.email, action: "backup.verify", target: result.checksum?.slice(0, 64), outcome: result.ok ? "ok" : "failed", detail: result.ok ? "file checks out" : result.problems[0]?.slice(0, 200) }, store);
  return { ...result, ...(madeHere ? { madeHere } : {}) };
}

export interface CollectionPlan {
  name: string;
  inFile: number;
  unchanged: number;
  replace: number;
  add: number;
  /** Why the collection won't be written, if it won't. */
  skipped?: string;
}

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** What a restore would do, collection by collection. Writes nothing (except the audit record the caller adds). */
async function plan(store: Store, file: BackupFile): Promise<CollectionPlan[]> {
  const known = new Set(exportedCollections());
  const plans: CollectionPlan[] = [];
  for (const [name, docs] of Object.entries(file.collections)) {
    const row: CollectionPlan = { name, inFile: docs.length, unchanged: 0, replace: 0, add: 0 };
    if (!known.has(name)) row.skipped = "Not a collection this site uses";
    else if (NOT_RESTORED.has(name)) row.skipped = "Append-only log: kept as it is";
    if (row.skipped) {
      plans.push(row);
      continue;
    }
    const collection = store.collection(name);
    for (let start = 0; start < docs.length; start += BATCH) {
      const batch = docs.slice(start, start + BATCH) as Record<string, unknown>[];
      const ids = batch.map((doc) => decode(doc._id));
      const existing = await collection.find({ _id: { $in: ids } }, { limit: BATCH }).toArray();
      const byId = new Map(existing.map((doc) => [JSON.stringify(encode(doc._id)), doc]));
      for (const doc of batch) {
        const current = byId.get(JSON.stringify(doc._id));
        if (!current) row.add += 1;
        else if (sameJson(exportDoc(name, current), doc)) row.unchanged += 1;
        else row.replace += 1;
      }
    }
    plans.push(row);
  }
  return plans;
}

export const confirmationFor = (checksum: string) => `RESTORE ${checksum.slice(0, 8)}`;
const DRY_RUN_VALID_MS = 30 * 60_000;

export async function dryRun(actor: Actor, bytes: Uint8Array): Promise<{ checksum: string; createdAt: string; plans: CollectionPlan[]; confirmation: string }> {
  const store = await db();
  const { result, file } = verifyBackup(parseUpload(bytes));
  if (!file) throw new BackupError(`This file can't be restored: ${result.problems[0] ?? "it didn't pass the checks."}`, 422);
  const plans = await plan(store, file);
  await audit({ actorId: actor._id, actorEmail: actor.email, action: "backup.dry-run", target: file.checksum, outcome: "ok", detail: `${plans.reduce((n, p) => n + (p.skipped ? 0 : p.replace + p.add), 0)} records would change` }, store);
  return { checksum: file.checksum, createdAt: file.createdAt, plans, confirmation: confirmationFor(file.checksum) };
}

/**
 * Puts back every record in the file (except the append-only logs), replacing the current version
 * of each by id. Records added since the backup stay. Secrets stripped from the file (admins'
 * authenticator records) are kept from the current data, so nobody is locked out.
 * The caller has already checked the role, permission and a fresh authenticator code.
 */
export async function restore(actor: Actor, bytes: Uint8Array, typed: string): Promise<{ checksum: string; restored: number; failed: number; plans: CollectionPlan[] }> {
  const store = await db();
  const { result, file } = verifyBackup(parseUpload(bytes));
  if (!file) throw new BackupError(`This file can't be restored: ${result.problems[0] ?? "it didn't pass the checks."}`, 422);
  if (typed.trim() !== confirmationFor(file.checksum)) throw new BackupError(`Type “${confirmationFor(file.checksum)}” exactly to confirm.`, 422);
  const recentDryRun = await store
    .collection(STORE_COLLECTIONS.audit)
    .findOne({ action: "backup.dry-run", actorId: actor._id, target: file.checksum, at: { $gte: new Date(Date.now() - DRY_RUN_VALID_MS) } });
  if (!recentDryRun) throw new BackupError("Run a dry run of this file first (in the last 30 minutes), and check what it will change.", 409);

  const plans = await plan(store, file);
  let restored = 0;
  let failed = 0;
  for (const row of plans) {
    if (row.skipped) continue;
    const collection = store.collection(row.name);
    const keep = STRIPPED_FIELDS[row.name] ?? [];
    for (const raw of file.collections[row.name]!) {
      const doc = decode(raw) as Doc;
      try {
        const current = await collection.findOne({ _id: doc._id });
        if (current && sameJson(exportDoc(row.name, current), raw)) continue;
        for (const field of keep) if (current && current[field] !== undefined) (doc as Record<string, unknown>)[field] = current[field];
        if (current) await collection.deleteOne({ _id: doc._id });
        try {
          await collection.insertOne(doc);
        } catch (error) {
          // Put the current record back if the old one can't go in (for example a duplicate email).
          if (current) await collection.insertOne(current).catch(() => undefined);
          throw error;
        }
        restored += 1;
      } catch {
        failed += 1;
      }
    }
  }
  await audit({ actorId: actor._id, actorEmail: actor.email, action: "backup.restore", target: file.checksum, outcome: failed ? "failed" : "ok", detail: `${restored} records restored, ${failed} failed, from a backup made ${file.createdAt.slice(0, 16)}` }, store);
  return { checksum: file.checksum, restored, failed, plans };
}
