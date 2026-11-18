import "server-only";
import { randomUUID } from "node:crypto";
import { adminEmails, type UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Doc, type Store } from "@/lib/database/store";
import { audit } from "@/lib/security/audit";
import type { AdminAccess, AdminMemberDoc } from "./rbac";
import { notify } from "@/features/notifications/service";

/**
 * Account restrictions: timed suspensions, timed or permanent bans, appeals and their history.
 *
 * A restricted account has `status: "blocked"` (so every existing check keeps working) and, for
 * timed ones, `restrictedUntil`. When that passes, the account is restored on its next sign-in
 * (see `liftIfExpired`). Every restriction is kept as a record with its reason, the admin who set
 * it, when it ended and why, and any appeal.
 */

export const REASONS = {
  spam: "Spam or advertising",
  abuse: "Abuse or harassment",
  misinformation: "Deliberately false travel information",
  copyright: "Copyright infringement",
  security: "Account security (compromised or suspicious)",
  other: "Other",
} as const;
export type Reason = keyof typeof REASONS;

export interface Appeal {
  message: string;
  submittedAt: Date;
  status: "open" | "upheld" | "overturned";
  decidedAt?: Date;
  decidedBy?: string;
  note?: string;
}

export interface RestrictionDoc extends Doc {
  userId: string;
  email: string;
  kind: "suspension" | "ban";
  permanent: boolean;
  reason: Reason;
  /** Admin's explanation; shown to other admins, not to the user. */
  note: string;
  /** A reference to the evidence (report id, comment id, link); never the content itself. */
  evidence?: string;
  startsAt: Date;
  endsAt?: Date;
  createdBy: string;
  createdByEmail: string;
  liftedAt?: Date;
  /** An admin's id, or "expiry" when a timed restriction ran out. */
  liftedBy?: string;
  liftNote?: string;
  appeal?: Appeal;
}

export class RestrictionError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

interface Actor {
  user: Pick<UserDoc, "_id" | "email">;
  access: AdminAccess;
}

async function db(): Promise<Store> {
  const store = await getStore();
  if (!store) throw new RestrictionError("The database isn't connected.", 503);
  return store;
}

const restrictions = (store: Store) => store.collection<RestrictionDoc>(STORE_COLLECTIONS.restrictions);
export const isActive = (r: RestrictionDoc, now = Date.now()) => !r.liftedAt && (r.permanent || !r.endsAt || r.endsAt.getTime() > now);

export async function activeRestriction(userId: string, store?: Store): Promise<RestrictionDoc | null> {
  const rows = await restrictions(store ?? (await db())).find({ userId }, { sort: { startsAt: -1 }, limit: 10 }).toArray();
  return rows.find((r) => isActive(r)) ?? null;
}

export async function restrictionHistory(userId: string): Promise<RestrictionDoc[]> {
  return restrictions(await db()).find({ userId }, { sort: { startsAt: -1 }, limit: 50 }).toArray();
}

export async function restrict(
  actor: Actor,
  userId: string,
  input: { kind: "suspension" | "ban"; days: number | null; reason: Reason; note: string; evidence?: string },
): Promise<RestrictionDoc> {
  if (userId === actor.user._id) throw new RestrictionError("You can't restrict your own account.", 403);
  if (input.kind === "suspension" && (input.days === null || input.days < 1 || input.days > 90)) throw new RestrictionError("A suspension lasts 1 to 90 days.");
  if (input.kind === "ban" && input.days !== null && (input.days < 1 || input.days > 3650)) throw new RestrictionError("A timed ban lasts 1 day to 10 years.");

  const store = await db();
  const user = await store.collection<UserDoc>(STORE_COLLECTIONS.users).findOne({ _id: userId });
  if (!user) throw new RestrictionError("That account doesn't exist.", 404);
  if (adminEmails().has(user.email)) throw new RestrictionError("Owner accounts (ADMIN_EMAILS) can't be restricted.", 403);
  const member = await store.collection<AdminMemberDoc>(STORE_COLLECTIONS.adminMembers).findOne({ _id: userId });
  if (member?.roles.length && !actor.access.superAdmin) throw new RestrictionError("Only a Super Admin can restrict another admin.", 403);
  if (await activeRestriction(userId, store)) throw new RestrictionError("This account is already restricted. Lift that first to change it.", 409);

  const now = new Date();
  const endsAt = input.days === null ? undefined : new Date(now.getTime() + input.days * 86_400_000);
  const doc: RestrictionDoc = {
    _id: randomUUID(),
    userId,
    email: user.email,
    kind: input.kind,
    permanent: input.days === null,
    reason: input.reason,
    note: input.note.trim().slice(0, 500),
    ...(input.evidence ? { evidence: input.evidence.trim().slice(0, 200) } : {}),
    startsAt: now,
    ...(endsAt ? { endsAt } : {}),
    createdBy: actor.user._id,
    createdByEmail: actor.user.email,
  };
  await restrictions(store).insertOne(doc);
  await store.collection(STORE_COLLECTIONS.users).updateOne({ _id: userId }, endsAt ? { $set: { status: "blocked", restrictedUntil: endsAt } } : { $set: { status: "blocked" }, $unset: { restrictedUntil: "" } });
  // Restricted accounts are signed out everywhere at once.
  await store.collection(STORE_COLLECTIONS.sessions).deleteMany({ userId });
  await audit(
    { actorId: actor.user._id, actorEmail: actor.user.email, action: `user.${input.kind}`, target: userId, outcome: "ok", detail: `${input.reason}, ${endsAt ? `until ${endsAt.toISOString().slice(0, 10)}` : "permanent"}`, after: { kind: input.kind, permanent: doc.permanent } },
    store,
  );
  // Seen once they can sign in again; the appeal page is open to them now.
  await notify(
    userId,
    {
      kind: "account",
      title: input.kind === "suspension" ? `Your account was suspended until ${endsAt!.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : endsAt ? "Your account was banned for a time" : "Your account was banned",
      body: `Reason: ${REASONS[input.reason]}. If you think this is wrong, you can ask for a review.`,
      href: "/appeal",
    },
    store,
  );
  return doc;
}

/** Ends a restriction early and restores the account. `quiet` skips the notification when the caller sends its own. */
export async function lift(actor: Actor, restrictionId: string, note: string, options: { quiet?: boolean } = {}): Promise<void> {
  const store = await db();
  const row = await restrictions(store).findOne({ _id: restrictionId });
  if (!row) throw new RestrictionError("That restriction doesn't exist.", 404);
  if (!isActive(row)) throw new RestrictionError("That restriction has already ended.", 409);
  await restrictions(store).updateOne({ _id: restrictionId }, { $set: { liftedAt: new Date(), liftedBy: actor.user._id, liftNote: note.trim().slice(0, 300) } });
  await store.collection(STORE_COLLECTIONS.users).updateOne({ _id: row.userId }, { $set: { status: "active" }, $unset: { restrictedUntil: "" } });
  await audit({ actorId: actor.user._id, actorEmail: actor.user.email, action: "user.restore", target: row.userId, outcome: "ok", detail: note.slice(0, 120), before: { kind: row.kind } }, store);
  if (!options.quiet) await notify(row.userId, { kind: "account", title: "Your account has been restored", body: "Welcome back. Everything works as before." }, store);
}

/**
 * Called when someone signs in: a timed restriction that has run out is lifted and the account
 * restored. Returns the user as it should now be treated.
 */
export async function liftIfExpired(user: UserDoc, store?: Store): Promise<UserDoc> {
  const until = user.restrictedUntil instanceof Date ? user.restrictedUntil : null;
  if (user.status !== "blocked" || !until || until.getTime() > Date.now()) return user;
  const db = store ?? (await getStore());
  if (!db) return user;
  await db.collection(STORE_COLLECTIONS.users).updateOne({ _id: user._id }, { $set: { status: "active" }, $unset: { restrictedUntil: "" } });
  const rows = await db.collection<RestrictionDoc>(STORE_COLLECTIONS.restrictions).find({ userId: user._id }, { sort: { startsAt: -1 }, limit: 5 }).toArray();
  for (const row of rows) if (!row.liftedAt && !row.permanent) await db.collection(STORE_COLLECTIONS.restrictions).updateOne({ _id: row._id }, { $set: { liftedAt: new Date(), liftedBy: "expiry" } });
  await audit({ action: "user.restore", target: user._id, outcome: "ok", detail: "timed restriction expired" }, db);
  await notify(user._id, { kind: "account", title: "Your account restriction has ended", body: "Welcome back. Everything works as before." }, db);
  return { ...user, status: "active", restrictedUntil: undefined };
}

/**
 * A restricted person asks for a review. Always answers the same way, whether or not the address
 * exists or is restricted, so the form can't be used to find out.
 */
export async function submitAppeal(email: string, message: string): Promise<void> {
  const store = await db();
  const user = await store.collection<UserDoc>(STORE_COLLECTIONS.users).findOne({ email: email.trim().toLowerCase() });
  if (!user) return;
  const active = await activeRestriction(user._id, store);
  if (!active || active.appeal?.status === "open") return;
  if (active.appeal) return; // One appeal per restriction; a decided appeal is final.
  await restrictions(store).updateOne({ _id: active._id }, { $set: { appeal: { message: message.trim().slice(0, 2000), submittedAt: new Date(), status: "open" } } });
  await audit({ actorId: user._id, action: "appeal.submit", target: active._id, outcome: "ok" }, store);
}

export async function openAppeals(limit = 50): Promise<RestrictionDoc[]> {
  const rows = await restrictions(await db()).find({ liftedAt: { $exists: false } }, { sort: { startsAt: -1 }, limit: 500 }).toArray();
  return rows.filter((r) => r.appeal?.status === "open").slice(0, limit);
}

export async function decideAppeal(actor: Actor, restrictionId: string, decision: "upheld" | "overturned", note: string): Promise<void> {
  const store = await db();
  const row = await restrictions(store).findOne({ _id: restrictionId });
  if (!row?.appeal || row.appeal.status !== "open") throw new RestrictionError("There's no open appeal for that restriction.", 404);
  if (row.createdBy === actor.user._id && !actor.access.superAdmin) throw new RestrictionError("Someone other than the admin who set the restriction should decide the appeal.", 403);
  await restrictions(store).updateOne({ _id: restrictionId }, { $set: { appeal: { ...row.appeal, status: decision, decidedAt: new Date(), decidedBy: actor.user._id, note: note.trim().slice(0, 500) } } });
  await audit({ actorId: actor.user._id, actorEmail: actor.user.email, action: `appeal.${decision}`, target: restrictionId, outcome: "ok", detail: note.slice(0, 120) }, store);
  if (decision === "overturned") {
    await lift(actor, restrictionId, `Appeal overturned: ${note}`, { quiet: true });
    await notify(row.userId, { kind: "appeal", title: "Your appeal was accepted", body: "The restriction has been lifted and your account is restored." }, store);
  } else {
    await notify(row.userId, { kind: "appeal", title: "Your appeal was reviewed", body: "After a second look, the restriction stays in place. This decision is final." }, store);
  }
}
