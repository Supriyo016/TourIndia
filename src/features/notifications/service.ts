import "server-only";
import { randomUUID } from "node:crypto";
import { getStore, STORE_COLLECTIONS, type Doc, type Store } from "@/lib/database/store";

/**
 * In-app notifications for signed-in people. Email to members waits until a sending domain is
 * verified (owner decision), so this is the only channel. Every read and change is filtered by the
 * owner's id. Notifications hold short fixed wording written here, never other people's words,
 * and expire after 180 days (TTL index in scripts/db-setup.mjs).
 */

export const NOTIFICATION_KINDS = ["support", "appeal", "account", "edit", "comment"] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface NotificationDoc extends Doc {
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  /** An internal path only. */
  href?: string;
  createdAt: Date;
  readAt?: Date;
  expiresAt: Date;
}

export interface PublicNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
  createdAt: string;
  read: boolean;
}

const KEEP_MS = 180 * 86_400_000;
export const NOTIFICATIONS_PAGE = 30;

const collection = (store: Store) => store.collection<NotificationDoc>(STORE_COLLECTIONS.notifications);

export const toPublic = (doc: NotificationDoc): PublicNotification => ({
  id: doc._id,
  kind: doc.kind,
  title: doc.title,
  ...(doc.body ? { body: doc.body } : {}),
  ...(doc.href ? { href: doc.href } : {}),
  createdAt: doc.createdAt.toISOString(),
  read: Boolean(doc.readAt),
});

/** Adds a notification. Never throws: a notification must not undo the action it reports. */
export async function notify(userId: string | null | undefined, input: { kind: NotificationKind; title: string; body?: string; href?: string }, store?: Store | null): Promise<void> {
  if (!userId || userId === "deleted") return;
  try {
    const db = store ?? (await getStore());
    if (!db) return;
    const now = new Date();
    const href = input.href && input.href.startsWith("/") && !input.href.startsWith("//") ? input.href.slice(0, 200) : undefined;
    await collection(db).insertOne({
      _id: randomUUID(),
      userId,
      kind: input.kind,
      title: input.title.slice(0, 140),
      ...(input.body ? { body: input.body.slice(0, 400) } : {}),
      ...(href ? { href } : {}),
      createdAt: now,
      expiresAt: new Date(now.getTime() + KEEP_MS),
    });
  } catch {
    console.error("[notifications] could not add a notification");
  }
}

/** Notifies the account that uses this address, if there is one. */
export async function notifyEmail(email: string, input: Parameters<typeof notify>[1], store?: Store | null): Promise<void> {
  try {
    const db = store ?? (await getStore());
    if (!db) return;
    const user = await db.collection(STORE_COLLECTIONS.users).findOne({ email: email.trim().toLowerCase() });
    if (user) await notify(user._id, input, db);
  } catch {
    // As for notify: never in the way.
  }
}

async function db(): Promise<Store> {
  const store = await getStore();
  if (!store) throw Object.assign(new Error("unavailable"), { status: 503 });
  return store;
}

export async function unreadCount(userId: string): Promise<number> {
  return collection(await db()).countDocuments({ userId, readAt: { $exists: false } });
}

export async function listNotifications(userId: string, options: { limit?: number; page?: number } = {}) {
  const store = await db();
  const limit = Math.min(Math.max(1, options.limit ?? NOTIFICATIONS_PAGE), 100);
  const total = await collection(store).countDocuments({ userId });
  const pages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.max(1, Math.floor(options.page ?? 1)), pages);
  const rows = await collection(store).find({ userId }, { sort: { createdAt: -1 }, skip: (page - 1) * limit, limit }).toArray();
  return { rows: rows.map(toPublic), total, page, pages };
}

/** Marks the owner's own notifications as read. Ids belonging to someone else match nothing. */
export async function markRead(userId: string, ids: string[] | "all"): Promise<number> {
  const store = await db();
  const now = new Date();
  if (ids === "all") {
    const unread = await collection(store).find({ userId, readAt: { $exists: false } }, { limit: 1000 }).toArray();
    for (const row of unread) await collection(store).updateOne({ _id: row._id, userId }, { $set: { readAt: now } });
    return unread.length;
  }
  let changed = 0;
  for (const id of ids.slice(0, 100)) {
    const result = await collection(store).updateOne({ _id: id, userId, readAt: { $exists: false } }, { $set: { readAt: now } });
    changed += result.matchedCount;
  }
  return changed;
}

export async function deleteNotifications(userId: string, store?: Store): Promise<void> {
  await collection(store ?? (await db())).deleteMany({ userId });
}
