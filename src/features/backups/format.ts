import "server-only";
import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/database/mongo";
import { STORE_COLLECTIONS, type Doc } from "@/lib/database/store";

/**
 * The backup file format. A backup is one JSON document, gzip-compressed:
 *
 *   { "format": "tour-india-backup", "version": 1, "createdAt": "<ISO>",
 *     "collections": { "<name>": [<doc>, …], … },
 *     "counts": { "<name>": <n>, … }, "checksum": "<sha256 hex>" }
 *
 * Dates are written as {"$date": "<ISO>"} and MongoDB object ids as {"$oid": "<hex>"}, so a restore
 * puts back the same types. The checksum is SHA-256 over, for each collection in file order and each
 * document in order, `<name>\n<the document's JSON>\n`. JSON.parse then JSON.stringify gives the same
 * text back, so the checksum can be checked from the parsed file.
 */

export const BACKUP_FORMAT = "tour-india-backup";
export const BACKUP_VERSION = 1;

/** Never exported: sign-in codes, session token hashes, rate-limit counters, caches and the backup history itself. */
export const EXCLUDED_COLLECTIONS = new Set<string>([STORE_COLLECTIONS.otps, STORE_COLLECTIONS.sessions, COLLECTIONS.rateLimits, STORE_COLLECTIONS.translations, STORE_COLLECTIONS.appErrors, STORE_COLLECTIONS.backups]);

/** Fields removed before export because they are secrets: admins' encrypted authenticator secrets and recovery-code hashes. */
export const STRIPPED_FIELDS: Record<string, string[]> = { [STORE_COLLECTIONS.adminMembers]: ["mfa"] };

/** In the file for the record, but never written back: the append-only logs can't be rewritten. */
export const NOT_RESTORED = new Set<string>([STORE_COLLECTIONS.audit, STORE_COLLECTIONS.securityEvents]);

/** Every collection the app knows about, minus the excluded ones, in a fixed order. */
export function exportedCollections(): string[] {
  return [...new Set([...Object.values(STORE_COLLECTIONS), ...Object.values(COLLECTIONS)])].filter((name) => !EXCLUDED_COLLECTIONS.has(name)).sort();
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

const isObjectId = (value: unknown): value is { toHexString(): string } => Boolean(value && typeof value === "object" && (value as { _bsontype?: string })._bsontype === "ObjectId");

export function encode(value: unknown): Json {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return { $date: value.toISOString() };
  if (isObjectId(value)) return { $oid: value.toHexString() };
  if (Array.isArray(value)) return value.map(encode);
  if (typeof value === "object") {
    const out: Record<string, Json> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) if (item !== undefined && typeof item !== "function") out[key] = encode(item);
    return out;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  return String(value);
}

export function decode(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length === 1 && typeof record.$date === "string") return new Date(record.$date);
    if (keys.length === 1 && typeof record.$oid === "string" && /^[0-9a-f]{24}$/i.test(record.$oid)) return new ObjectId(record.$oid);
    return Object.fromEntries(keys.map((key) => [key, decode(record[key])]));
  }
  return value;
}

/** A document as it goes into the file: secrets stripped, types encoded. */
export function exportDoc(collection: string, doc: Doc): Json {
  const copy: Record<string, unknown> = { ...doc };
  for (const field of STRIPPED_FIELDS[collection] ?? []) delete copy[field];
  return encode(copy);
}

export const checksumPart = (collection: string, json: string) => `${collection}\n${json}\n`;

export interface BackupFile {
  format: string;
  version: number;
  createdAt: string;
  collections: Record<string, unknown[]>;
  counts: Record<string, number>;
  checksum: string;
}

export interface VerifyResult {
  ok: boolean;
  problems: string[];
  createdAt?: string;
  checksum?: string;
  counts?: Record<string, number>;
  /** Collections in the file that this version of the site doesn't know. */
  unknown?: string[];
}

export const MAX_DOCS = 250_000;

/** Checks a parsed backup's structure and checksum. Writes nothing. */
export function verifyBackup(data: unknown): { result: VerifyResult; file?: BackupFile } {
  const problems: string[] = [];
  if (!data || typeof data !== "object" || Array.isArray(data)) return { result: { ok: false, problems: ["This isn't a Tour India backup file."] } };
  const file = data as Partial<BackupFile>;
  if (file.format !== BACKUP_FORMAT) return { result: { ok: false, problems: ["This isn't a Tour India backup file."] } };
  if (file.version !== BACKUP_VERSION) return { result: { ok: false, problems: [`This backup uses format version ${String(file.version)}, which this site can't read.`] } };
  if (!file.collections || typeof file.collections !== "object" || Array.isArray(file.collections)) return { result: { ok: false, problems: ["The file has no collections."] } };
  if (typeof file.checksum !== "string" || !/^[0-9a-f]{64}$/.test(file.checksum)) problems.push("The checksum is missing, so the file may be incomplete.");
  if (typeof file.createdAt !== "string" || Number.isNaN(Date.parse(file.createdAt))) problems.push("The creation date is missing or unreadable.");

  const hash = createHash("sha256");
  const counts: Record<string, number> = {};
  let total = 0;
  for (const [name, docs] of Object.entries(file.collections)) {
    if (!Array.isArray(docs)) {
      problems.push(`“${name}” isn't a list of records.`);
      continue;
    }
    counts[name] = docs.length;
    total += docs.length;
    for (const doc of docs) {
      if (!doc || typeof doc !== "object" || Array.isArray(doc) || !("_id" in doc)) {
        problems.push(`“${name}” has a record without an id.`);
        break;
      }
      hash.update(checksumPart(name, JSON.stringify(doc)));
    }
  }
  if (total > MAX_DOCS) problems.push(`The file has ${total} records, more than the ${MAX_DOCS} this page can handle.`);
  const declared = file.counts ?? {};
  for (const name of new Set([...Object.keys(declared), ...Object.keys(counts)])) {
    if (declared[name] !== counts[name]) problems.push(`“${name}” should have ${declared[name] ?? 0} records but has ${counts[name] ?? 0}.`);
  }
  if (typeof file.checksum === "string" && hash.digest("hex") !== file.checksum) problems.push("The checksum doesn't match: the file was changed or damaged after it was made.");
  const known = new Set(exportedCollections());
  const unknown = Object.keys(file.collections).filter((name) => !known.has(name));
  return {
    result: { ok: problems.length === 0, problems, createdAt: file.createdAt, checksum: file.checksum, counts, ...(unknown.length ? { unknown } : {}) },
    file: problems.length === 0 ? (file as BackupFile) : undefined,
  };
}
