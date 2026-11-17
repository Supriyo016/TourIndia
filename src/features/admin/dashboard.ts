import "server-only";
import { COLLECTIONS } from "@/lib/database/mongo";
import { STORE_COLLECTIONS, type Doc, type FindOptions, type Store, type StoreCollection } from "@/lib/database/store";

/**
 * Read-only figures for the admin dashboard. Every helper takes the store, so tests
 * run them against the in-memory store, and every count runs in parallel.
 * Nothing here returns an email address, phone number or full name.
 */

const DAY = 86_400_000;
const since = (now: Date, days: number) => new Date(now.getTime() - days * DAY);

/** Only these fields of a document are ever read for the short lists. */
const pick = (fields: string[]): FindOptions => ({ projection: Object.fromEntries(fields.map((field) => [field, 1])) }) as FindOptions;

export const firstName = (name: unknown) => String(name ?? "").trim().split(/\s+/)[0] || "Traveller";

const snippet = (text: unknown, max = 70) => {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

export interface AccountStats {
  total: number;
  new7: number;
  new30: number;
  blocked: number;
  google: number;
}

export async function accountStats(store: Store, now = new Date()): Promise<AccountStats> {
  const users = store.collection(STORE_COLLECTIONS.users);
  const [total, new7, new30, blocked, google] = await Promise.all([
    users.countDocuments({}),
    users.countDocuments({ createdAt: { $gte: since(now, 7) } }),
    users.countDocuments({ createdAt: { $gte: since(now, 30) } }),
    users.countDocuments({ status: "blocked" }),
    users.countDocuments({ googleSub: { $exists: true } }),
  ]);
  return { total, new7, new30, blocked, google };
}

export interface ActionItem {
  id: string;
  kind: "edit" | "held" | "hidden";
  label: string;
  detail: string;
  createdAt: Date;
  href: string;
}

export interface CommunityStats {
  comments: { total: number; pending: number; hidden: number; reported: number };
  loves: number;
  ratings: { count: number; average: number | null };
  edits: { pending: number; approved: number; rejected: number };
  needsAction: ActionItem[];
}

type AggregateCollection = StoreCollection & { aggregate?: (pipeline: object[]) => { toArray(): Promise<Doc[]> } };

/** Sums ratings across pages: MongoDB groups on the server; the in-memory store adds them up. */
export async function ratingTotals(store: Store): Promise<{ count: number; sum: number }> {
  const stats = store.collection(STORE_COLLECTIONS.stats) as AggregateCollection;
  if (typeof stats.aggregate === "function") {
    const [row] = await stats.aggregate([{ $group: { _id: null, count: { $sum: "$ratingCount" }, sum: { $sum: "$ratingSum" } } }]).toArray();
    return { count: Number(row?.count) || 0, sum: Number(row?.sum) || 0 };
  }
  const rows = await stats.find({}).toArray();
  return rows.reduce((total, row) => ({ count: total.count + (Number(row.ratingCount) || 0), sum: total.sum + (Number(row.ratingSum) || 0) }), { count: 0, sum: 0 });
}

export async function communityStats(store: Store): Promise<CommunityStats> {
  const comments = store.collection(STORE_COLLECTIONS.comments);
  const edits = store.collection(STORE_COLLECTIONS.edits);
  const latest = { sort: { createdAt: -1 as const }, limit: 5 };
  const [total, pending, hidden, reported, loves, ratings, editsPending, approved, rejected, pendingEdits, held, hiddenList] = await Promise.all([
    comments.countDocuments({}),
    comments.countDocuments({ status: "pending" }),
    comments.countDocuments({ status: "hidden" }),
    comments.countDocuments({ status: "visible", reports: { $gt: 0 } }),
    store.collection(STORE_COLLECTIONS.reactions).countDocuments({ kind: "love" }),
    ratingTotals(store),
    edits.countDocuments({ status: "pending" }),
    edits.countDocuments({ status: "approved" }),
    edits.countDocuments({ status: "rejected" }),
    edits.find({ status: "pending" }, { ...latest, ...pick(["title", "field", "createdAt"]) }).toArray(),
    comments.find({ status: "pending" }, { ...latest, ...pick(["target", "body", "createdAt"]) }).toArray(),
    comments.find({ status: "hidden" }, { ...latest, ...pick(["target", "body", "createdAt"]) }).toArray(),
  ]);
  const needsAction: ActionItem[] = [
    ...pendingEdits.map((edit) => ({ id: edit._id, kind: "edit" as const, label: String(edit.title ?? "Suggested edit"), detail: `Field: ${String(edit.field ?? "")}`, createdAt: edit.createdAt as Date, href: "/admin#edits-title" })),
    ...held.map((comment) => ({ id: comment._id, kind: "held" as const, label: String(comment.target ?? ""), detail: snippet(comment.body), createdAt: comment.createdAt as Date, href: "/admin#held-title" })),
    ...hiddenList.map((comment) => ({ id: comment._id, kind: "hidden" as const, label: String(comment.target ?? ""), detail: snippet(comment.body), createdAt: comment.createdAt as Date, href: "/admin#hidden-title" })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  return {
    comments: { total, pending, hidden, reported },
    loves,
    ratings: { count: ratings.count, average: ratings.count ? Math.round((ratings.sum / ratings.count) * 10) / 10 : null },
    edits: { pending: editsPending, approved, rejected },
    needsAction,
  };
}

export interface RecentBooking {
  reference: string;
  createdAt: Date;
  destination: string;
  firstName: string;
  status: string;
}

export interface RequestStats {
  bookings: { total: number; last7: number; recent: RecentBooking[] };
  contact: { total: number; unread: number; last7: number };
  newsletter: number;
  stories: { pending: number; approved: number };
}

export async function requestStats(store: Store, now = new Date()): Promise<RequestStats> {
  const bookings = store.collection(STORE_COLLECTIONS.bookings);
  const contact = store.collection(COLLECTIONS.contact);
  const stories = store.collection(COLLECTIONS.stories);
  const [total, last7, recent, contactTotal, unread, contact7, newsletter, storiesPending, storiesApproved] = await Promise.all([
    bookings.countDocuments({}),
    bookings.countDocuments({ createdAt: { $gte: since(now, 7) } }),
    bookings.find({}, { sort: { createdAt: -1 }, limit: 5, ...pick(["reference", "createdAt", "destinationName", "name", "status"]) }).toArray(),
    contact.countDocuments({}),
    contact.countDocuments({ status: "new" }),
    contact.countDocuments({ createdAt: { $gte: since(now, 7) } }),
    store.collection(COLLECTIONS.newsletter).countDocuments({ status: "subscribed" }),
    stories.countDocuments({ status: "pending" }),
    stories.countDocuments({ status: "approved" }),
  ]);
  return {
    bookings: {
      total,
      last7,
      // Rebuilt field by field, so an email address or phone number can't slip through.
      recent: recent.map((row) => ({
        reference: String(row.reference ?? ""),
        createdAt: row.createdAt as Date,
        destination: String(row.destinationName ?? ""),
        firstName: firstName(row.name),
        status: String(row.status ?? "new"),
      })),
    },
    contact: { total: contactTotal, unread, last7: contact7 },
    newsletter,
    stories: { pending: storiesPending, approved: storiesApproved },
  };
}
