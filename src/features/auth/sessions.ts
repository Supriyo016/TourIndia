import "server-only";
import { hmac, type SessionDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS } from "@/lib/database/store";
import type { LogRecord } from "@/lib/security/audit";

/**
 * A person's own sessions and sign-in history. Every function takes the owner's user id and
 * filters by it, so nobody can list or end someone else's sessions through these.
 */

export interface SessionSummary {
  id: string;
  device: string;
  country?: string;
  role: "user" | "admin";
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
}

export interface SignInEvent {
  at: string;
  method: "email" | "google" | "admin";
  outcome: "ok" | "failed" | "denied";
  device?: string;
  country?: string;
}

async function store() {
  const db = await getStore();
  if (!db) throw new Error("store unavailable");
  return db;
}

export async function listSessions(userId: string, currentSessionId: string): Promise<SessionSummary[]> {
  const rows = await (await store()).collection<SessionDoc>(STORE_COLLECTIONS.sessions).find({ userId }, { sort: { lastSeenAt: -1 }, limit: 50 }).toArray();
  const now = Date.now();
  return rows
    .filter((row) => row.expiresAt.getTime() > now)
    .map((row) => ({
      // Sessions from before public ids existed get one from their hash's prefix (never the whole hash).
      id: row.publicId ?? row._id.slice(0, 12),
      device: row.device ?? "Unknown device",
      country: row.country,
      role: row.role,
      createdAt: row.createdAt.toISOString(),
      lastSeenAt: (row.lastSeenAt ?? row.createdAt).toISOString(),
      current: row._id === currentSessionId,
    }));
}

/** Ends one of the owner's sessions by its public id. Returns false if it isn't theirs. */
export async function endOwnSession(userId: string, publicId: string): Promise<boolean> {
  const sessions = (await store()).collection<SessionDoc>(STORE_COLLECTIONS.sessions);
  const mine = await sessions.find({ userId }, { limit: 100 }).toArray();
  const target = mine.find((row) => (row.publicId ?? row._id.slice(0, 12)) === publicId);
  if (!target) return false;
  await sessions.deleteOne({ _id: target._id, userId });
  return true;
}

/** Ends every session of the owner except the current one; returns how many ended. */
export async function endOtherSessions(userId: string, currentSessionId: string): Promise<number> {
  const result = await (await store()).collection(STORE_COLLECTIONS.sessions).deleteMany({ userId, _id: { $ne: currentSessionId } });
  return result.deletedCount;
}

const METHOD: Record<string, SignInEvent["method"]> = { "login.login": "email", "login.google": "google", "login.admin": "admin" };

/**
 * The last sign-ins for an account, newest first, from the security log. Successful ones carry the
 * user id; failed ones are matched by the keyed hash of the address (the address itself isn't logged).
 */
export async function signInHistory(user: { _id: string; email: string }, limit = 15): Promise<SignInEvent[]> {
  const logs = (await store()).collection<LogRecord>(STORE_COLLECTIONS.securityEvents);
  const actions = Object.keys(METHOD);
  const emailKey = hmac(`email:${user.email}`).slice(0, 16);
  const [ok, failed] = await Promise.all([
    logs.find({ actorId: user._id, action: { $in: actions } }, { sort: { seq: -1 }, limit }).toArray(),
    logs.find({ target: emailKey, action: { $in: actions } }, { sort: { seq: -1 }, limit }).toArray(),
  ]);
  return [...ok, ...failed]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit)
    .map((row) => ({
      at: row.at.toISOString(),
      method: METHOD[row.action] ?? "email",
      outcome: row.outcome,
      // Successful sign-ins record the device label in `detail`; failures record a reason, which isn't shown.
      device: row.outcome === "ok" ? row.detail : undefined,
      country: row.country,
    }));
}
