import "server-only";
import { adminEmails, type SessionDoc, type UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Filter } from "@/lib/database/store";
import { audit, type LogRecord } from "@/lib/security/audit";
import type { AdminMemberDoc } from "./rbac";
import { isActive, restrictionHistory, type RestrictionDoc } from "./restrictions";

/** The admin user directory: search, paging and one person's record. Reads only. */

export const PAGE_SIZE = 25;
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface DirectoryRow {
  id: string;
  name: string;
  email: string;
  status: "active" | "blocked";
  restrictedUntil?: string;
  createdAt: string;
  lastLoginAt?: string;
  google: boolean;
  adminRoles: string[];
}

export interface DirectoryPage {
  rows: DirectoryRow[];
  total: number;
  page: number;
  pages: number;
}

export async function searchUsers(input: { q?: string; status?: "active" | "restricted" | "all"; page?: number }): Promise<DirectoryPage> {
  const store = await getStore();
  if (!store) return { rows: [], total: 0, page: 1, pages: 0 };
  const filter: Filter = {};
  const q = input.q?.trim().slice(0, 80);
  if (q) filter.$or = [{ email: { $regex: `^${escape(q.toLowerCase())}`, $options: "i" } }, { name: { $regex: escape(q), $options: "i" } }];
  if (input.status === "active") filter.status = "active";
  if (input.status === "restricted") filter.status = "blocked";

  const users = store.collection<UserDoc>(STORE_COLLECTIONS.users);
  const total = await users.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(input.page ?? 1)), pages);
  const rows = await users.find(filter, { sort: { createdAt: -1 }, skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }).toArray();
  const members = rows.length
    ? await store.collection<AdminMemberDoc>(STORE_COLLECTIONS.adminMembers).find({ _id: { $in: rows.map((r) => r._id) } }, { limit: PAGE_SIZE }).toArray()
    : [];
  const rolesById = new Map(members.map((m) => [m._id, m.roles]));
  return {
    total,
    page,
    pages,
    rows: rows.map((user) => ({
      id: user._id,
      name: user.name || "",
      email: user.email,
      status: user.status,
      restrictedUntil: user.restrictedUntil instanceof Date ? user.restrictedUntil.toISOString() : undefined,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      google: Boolean(user.googleSub),
      // Owners (ADMIN_EMAILS) are Super Admins even without a stored role.
      adminRoles: adminEmails().has(user.email) ? ["super_admin", ...(rolesById.get(user._id) ?? []).filter((r) => r !== "super_admin")] : (rolesById.get(user._id) ?? []),
    })),
  };
}

export interface UserRecord {
  user: DirectoryRow & { homeState?: string; country?: string; interests: string[]; marketingConsent: boolean };
  sessions: { device: string; country?: string; lastSeenAt: string; role: string }[];
  restrictions: RestrictionDoc[];
  /** The restriction in force now, if any. */
  active: RestrictionDoc | null;
  comments: { id: string; body: string; status: string; target: string; createdAt: string }[];
  moderationLog: { at: string; action: string; by?: string; detail?: string }[];
}

/** One person's record for admins. Each view is written to the audit log. */
export async function userRecord(userId: string, viewer: { _id: string; email: string }): Promise<UserRecord | null> {
  const store = await getStore();
  if (!store) return null;
  const user = await store.collection<UserDoc>(STORE_COLLECTIONS.users).findOne({ _id: userId });
  if (!user) return null;
  const [sessions, restrictions, comments, logs, member] = await Promise.all([
    store.collection<SessionDoc>(STORE_COLLECTIONS.sessions).find({ userId }, { sort: { lastSeenAt: -1 }, limit: 20 }).toArray(),
    restrictionHistory(userId),
    store.collection(STORE_COLLECTIONS.comments).find({ userId }, { sort: { createdAt: -1 }, limit: 10 }).toArray(),
    store.collection<LogRecord>(STORE_COLLECTIONS.audit).find({ target: userId }, { sort: { seq: -1 }, limit: 20 }).toArray(),
    store.collection<AdminMemberDoc>(STORE_COLLECTIONS.adminMembers).findOne({ _id: userId }),
  ]);
  await audit({ actorId: viewer._id, actorEmail: viewer.email, action: "user.view", target: userId, outcome: "ok" }, store);
  return {
    user: {
      id: user._id,
      name: user.name || "",
      email: user.email,
      status: user.status,
      restrictedUntil: user.restrictedUntil instanceof Date ? user.restrictedUntil.toISOString() : undefined,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      google: Boolean(user.googleSub),
      adminRoles: adminEmails().has(user.email) ? ["super_admin", ...(member?.roles ?? []).filter((r) => r !== "super_admin")] : (member?.roles ?? []),
      homeState: user.homeState,
      country: user.country,
      interests: user.interests ?? [],
      marketingConsent: Boolean(user.marketingConsent),
    },
    sessions: sessions
      .filter((s) => s.expiresAt.getTime() > Date.now())
      .map((s) => ({ device: s.device ?? "Unknown device", country: s.country, lastSeenAt: (s.lastSeenAt ?? s.createdAt).toISOString(), role: s.role })),
    restrictions,
    active: restrictions.find((r) => isActive(r)) ?? null,
    comments: comments.map((c) => ({ id: c._id, body: String(c.body ?? "").slice(0, 280), status: String(c.status ?? ""), target: String(c.target ?? ""), createdAt: (c.createdAt as Date).toISOString() })),
    moderationLog: logs.filter((l) => l.action !== "user.view").map((l) => ({ at: l.at.toISOString(), action: l.action, by: l.actorEmail, detail: l.detail })),
  };
}
