import "server-only";
import { getDatabase, isDatabaseConfigured } from "./mongo";

/**
 * The small slice of the MongoDB API that accounts and community features use.
 * MongoDB provides it in production; an in-memory version runs in development and
 * tests, so every feature works locally without a database server.
 * In production with no MONGODB_URI, getStore() returns null and features report
 * that they are unavailable rather than keeping data in memory.
 */
export type Doc = { _id: string } & Record<string, unknown>;
export type Filter = Record<string, unknown>;
export interface Update {
  $set?: Record<string, unknown>;
  $setOnInsert?: Record<string, unknown>;
  $inc?: Record<string, number>;
  $unset?: Record<string, "">;
}
export interface FindOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

export interface StoreCollection<T extends Doc = Doc> {
  insertOne(doc: T): Promise<unknown>;
  findOne(filter: Filter): Promise<T | null>;
  find(filter: Filter, options?: FindOptions): { toArray(): Promise<T[]> };
  updateOne(filter: Filter, update: Update, options?: { upsert?: boolean }): Promise<{ matchedCount: number }>;
  findOneAndUpdate(filter: Filter, update: Update, options: { upsert?: boolean; returnDocument: "before" | "after" }): Promise<T | null>;
  deleteOne(filter: Filter): Promise<{ deletedCount: number }>;
  deleteMany(filter: Filter): Promise<{ deletedCount: number }>;
  countDocuments(filter: Filter): Promise<number>;
}

export interface Store {
  collection<T extends Doc = Doc>(name: string): StoreCollection<T>;
}

export const STORE_COLLECTIONS = {
  users: "users",
  otps: "otp_codes",
  sessions: "sessions",
  comments: "comments",
  reactions: "reactions",
  ratings: "ratings",
  stats: "target_stats",
  edits: "edit_proposals",
  overrides: "content_overrides",
  reports: "reports",
  audit: "audit_log",
  securityEvents: "security_events",
  adminRoles: "admin_roles",
  adminMembers: "admin_members",
  bookings: "booking_requests",
  translations: "translations",
} as const;

// ---- In-memory implementation -------------------------------------------------

const OPERATORS = new Set(["$in", "$nin", "$ne", "$gt", "$gte", "$lt", "$lte", "$exists"]);

function compare(a: unknown, b: unknown): number {
  const x = a instanceof Date ? a.getTime() : a;
  const y = b instanceof Date ? b.getTime() : b;
  if (x === y) return 0;
  if (x === undefined || x === null) return -1;
  if (y === undefined || y === null) return 1;
  return (x as number) < (y as number) ? -1 : 1;
}

const same = (a: unknown, b: unknown) => compare(a, b) === 0;

function matchesValue(value: unknown, condition: unknown): boolean {
  if (condition && typeof condition === "object" && !(condition instanceof Date) && !Array.isArray(condition)) {
    const entries = Object.entries(condition as Record<string, unknown>);
    if (entries.length && entries.every(([key]) => OPERATORS.has(key))) {
      return entries.every(([operator, operand]) => {
        switch (operator) {
          case "$in":
            return (operand as unknown[]).some((item) => same(value, item));
          case "$nin":
            return !(operand as unknown[]).some((item) => same(value, item));
          case "$ne":
            return !same(value, operand);
          case "$gt":
            return compare(value, operand) > 0;
          case "$gte":
            return compare(value, operand) >= 0;
          case "$lt":
            return compare(value, operand) < 0;
          case "$lte":
            return compare(value, operand) <= 0;
          case "$exists":
            return (value !== undefined) === Boolean(operand);
          default:
            return false;
        }
      });
    }
  }
  return same(value, condition);
}

export const matches = (doc: Doc, filter: Filter) => Object.entries(filter).every(([key, condition]) => matchesValue(doc[key], condition));

function applyUpdate(doc: Doc, update: Update, inserted: boolean) {
  if (inserted && update.$setOnInsert) Object.assign(doc, structuredClone(update.$setOnInsert));
  if (update.$set) Object.assign(doc, structuredClone(update.$set));
  for (const [key, amount] of Object.entries(update.$inc ?? {})) doc[key] = (Number(doc[key]) || 0) + amount;
  for (const key of Object.keys(update.$unset ?? {})) delete doc[key];
}

/** Keys that must be unique, as unique indexes enforce in MongoDB. */
const UNIQUE: Record<string, string[]> = { [STORE_COLLECTIONS.users]: ["email"] };

class MemoryCollection<T extends Doc> implements StoreCollection<T> {
  private docs: T[] = [];
  constructor(private readonly name: string) {}

  private checkUnique(candidate: Doc, self?: Doc) {
    for (const key of UNIQUE[this.name] ?? []) {
      if (candidate[key] !== undefined && this.docs.some((doc) => doc !== self && doc[key] === candidate[key])) {
        throw Object.assign(new Error(`duplicate key: ${key}`), { code: 11000 });
      }
    }
  }

  async insertOne(doc: T) {
    if (this.docs.some((item) => item._id === doc._id)) throw Object.assign(new Error("duplicate key: _id"), { code: 11000 });
    this.checkUnique(doc);
    this.docs.push(structuredClone(doc));
    return { acknowledged: true };
  }

  async findOne(filter: Filter) {
    const found = this.docs.find((doc) => matches(doc, filter));
    return found ? structuredClone(found) : null;
  }

  find(filter: Filter, options: FindOptions = {}) {
    let rows = this.docs.filter((doc) => matches(doc, filter));
    const sort = Object.entries(options.sort ?? {});
    if (sort.length) {
      rows = [...rows].sort((a, b) => {
        for (const [key, direction] of sort) {
          const order = compare(a[key], b[key]) * direction;
          if (order) return order;
        }
        return 0;
      });
    }
    rows = rows.slice(options.skip ?? 0, options.limit ? (options.skip ?? 0) + options.limit : undefined);
    return { toArray: async () => rows.map((row) => structuredClone(row)) };
  }

  private upsert(filter: Filter, update: Update, upsert?: boolean): { doc: T | null; before: T | null } {
    let doc = this.docs.find((item) => matches(item, filter)) ?? null;
    const before = doc ? structuredClone(doc) : null;
    const inserted = !doc && Boolean(upsert);
    if (inserted) {
      const seed = Object.fromEntries(Object.entries(filter).filter(([, value]) => typeof value !== "object" || value === null || value instanceof Date));
      doc = { _id: crypto.randomUUID(), ...seed } as T;
    }
    if (!doc) return { doc: null, before: null };
    const next = structuredClone(doc);
    applyUpdate(next, update, inserted);
    this.checkUnique(next, inserted ? undefined : doc);
    if (inserted) this.docs.push(next);
    else Object.assign(doc, next);
    return { doc: inserted ? next : doc, before };
  }

  async updateOne(filter: Filter, update: Update, options?: { upsert?: boolean }) {
    const { doc, before } = this.upsert(filter, update, options?.upsert);
    return { matchedCount: before ? 1 : 0, upserted: Boolean(doc && !before) };
  }

  async findOneAndUpdate(filter: Filter, update: Update, options: { upsert?: boolean; returnDocument: "before" | "after" }) {
    const { doc, before } = this.upsert(filter, update, options.upsert);
    const result = options.returnDocument === "after" ? doc : before;
    return result ? structuredClone(result) : null;
  }

  async deleteOne(filter: Filter) {
    const index = this.docs.findIndex((doc) => matches(doc, filter));
    if (index >= 0) this.docs.splice(index, 1);
    return { deletedCount: index >= 0 ? 1 : 0 };
  }

  async deleteMany(filter: Filter) {
    const before = this.docs.length;
    this.docs = this.docs.filter((doc) => !matches(doc, filter));
    return { deletedCount: before - this.docs.length };
  }

  async countDocuments(filter: Filter) {
    return this.docs.filter((doc) => matches(doc, filter)).length;
  }
}

declare global {
  var __tourIndiaMemoryStore: Map<string, MemoryCollection<Doc>> | undefined;
}

/** Shared across hot reloads in development. */
export function memoryStore(): Store {
  globalThis.__tourIndiaMemoryStore ??= new Map();
  const collections = globalThis.__tourIndiaMemoryStore;
  return {
    collection<T extends Doc>(name: string) {
      if (!collections.has(name)) collections.set(name, new MemoryCollection<Doc>(name));
      return collections.get(name) as unknown as StoreCollection<T>;
    },
  };
}

/** Test helper: empties the in-memory store. */
export function resetMemoryStore() {
  globalThis.__tourIndiaMemoryStore = new Map();
}

export function isStoreAvailable(): boolean {
  return isDatabaseConfigured() || process.env.NODE_ENV !== "production";
}

export async function getStore(): Promise<Store | null> {
  if (isDatabaseConfigured()) {
    const db = await getDatabase();
    return { collection: <T extends Doc>(name: string) => db.collection(name) as unknown as StoreCollection<T> };
  }
  return process.env.NODE_ENV === "production" ? null : memoryStore();
}
