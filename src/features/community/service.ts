import "server-only";
import { audit as appendAudit } from "@/lib/security/audit";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { site } from "@/config/site";
import type { UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Doc, type Store } from "@/lib/database/store";
import { contentFor, currentFieldValue } from "./content";
import { moderate } from "./moderation";
import { commentLinks } from "@/features/profile/service";
import { EDITABLE_FIELDS, targetKey, textToField, type CommentKind, type Target } from "./targets";

export type CommentStatus = "visible" | "pending" | "hidden" | "removed";

export interface CommentDoc extends Doc {
  target: string;
  parentId: string | null;
  userId: string | null;
  authorName: string;
  kind: CommentKind;
  body: string;
  status: CommentStatus;
  reports: number;
  helpful: number;
  createdAt: Date;
  reviewNote?: string;
}

interface StatsDoc extends Doc {
  loves: number;
  ratingCount: number;
  ratingSum: number;
  comments: number;
}

export interface EditDoc extends Doc {
  target: string;
  title: string;
  path: string;
  field: string;
  current: unknown;
  proposed: string | string[];
  reason: string;
  userId: string;
  authorName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNote?: string;
}

export class CommunityError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

const REPORTS_TO_HIDE = 3;
const ownHost = () => new URL(site.url).hostname.replace(/^www\./, "");

async function store(): Promise<Store> {
  const value = await getStore();
  if (!value) throw new CommunityError("This feature isn't available right now.", 503);
  return value;
}

function requireTarget(target: Target) {
  const content = contentFor(target);
  if (!content) throw new CommunityError("That page doesn't exist.", 404);
  return content;
}

const displayName = (user: UserDoc) => user.name?.trim() || "Traveller";

export interface PublicComment {
  id: string;
  parentId: string | null;
  authorName: string;
  /** Set when the author chose to link their comments to a public profile. */
  author?: { username: string; avatar: string };
  kind: CommentKind;
  body: string;
  helpful: number;
  createdAt: string;
  mine: boolean;
}

export async function getThread(target: Target, viewer: UserDoc | null) {
  requireTarget(target);
  const db = await store();
  const key = targetKey(target);
  const [stats, comments, love, rating] = await Promise.all([
    db.collection<StatsDoc>(STORE_COLLECTIONS.stats).findOne({ _id: key }),
    db.collection<CommentDoc>(STORE_COLLECTIONS.comments).find({ target: key, status: "visible" }, { sort: { createdAt: -1 }, limit: 200 }).toArray(),
    viewer ? db.collection(STORE_COLLECTIONS.reactions).findOne({ _id: `${key}:${viewer._id}` }) : null,
    viewer ? db.collection<Doc & { stars: number }>(STORE_COLLECTIONS.ratings).findOne({ _id: `${key}:${viewer._id}` }) : null,
  ]);
  const links = await commentLinks(comments.map((comment) => comment.userId ?? "")).catch(() => new Map<string, { username: string; avatar: string }>());
  return {
    stats: {
      loves: stats?.loves ?? 0,
      comments: stats?.comments ?? 0,
      ratingCount: stats?.ratingCount ?? 0,
      ratingAverage: stats?.ratingCount ? Math.round((stats.ratingSum / stats.ratingCount) * 10) / 10 : null,
    },
    comments: comments.map<PublicComment>((comment) => ({
      id: comment._id,
      parentId: comment.parentId,
      authorName: comment.authorName,
      ...(comment.userId && links.has(comment.userId) ? { author: links.get(comment.userId) } : {}),
      kind: comment.kind,
      body: comment.body,
      helpful: comment.helpful ?? 0,
      createdAt: comment.createdAt.toISOString(),
      mine: Boolean(viewer && comment.userId === viewer._id),
    })),
    me: viewer ? { loved: Boolean(love), rating: rating?.stars ?? null } : null,
  };
}

export async function toggleLove(target: Target, user: UserDoc): Promise<{ loved: boolean; loves: number }> {
  requireTarget(target);
  const db = await store();
  const key = targetKey(target);
  const reactions = db.collection(STORE_COLLECTIONS.reactions);
  const id = `${key}:${user._id}`;
  const removed = (await reactions.deleteOne({ _id: id })).deletedCount > 0;
  if (!removed) {
    try {
      await reactions.insertOne({ _id: id, target: key, userId: user._id, kind: "love", createdAt: new Date() });
    } catch {
      // A second tap raced the first; the love is already counted.
      const stats = await db.collection<StatsDoc>(STORE_COLLECTIONS.stats).findOne({ _id: key });
      return { loved: true, loves: stats?.loves ?? 1 };
    }
  }
  const stats = await db
    .collection<StatsDoc>(STORE_COLLECTIONS.stats)
    .findOneAndUpdate({ _id: key }, { $inc: { loves: removed ? -1 : 1 } }, { upsert: true, returnDocument: "after" });
  return { loved: !removed, loves: Math.max(0, stats?.loves ?? 0) };
}

export async function rate(target: Target, user: UserDoc, stars: number) {
  requireTarget(target);
  const db = await store();
  const key = targetKey(target);
  const before = await db
    .collection<Doc & { stars: number }>(STORE_COLLECTIONS.ratings)
    .findOneAndUpdate({ _id: `${key}:${user._id}` }, { $set: { stars, target: key, userId: user._id, updatedAt: new Date() } }, { upsert: true, returnDocument: "before" });
  const stats = await db.collection<StatsDoc>(STORE_COLLECTIONS.stats).findOneAndUpdate(
    { _id: key },
    { $inc: before ? { ratingSum: stars - before.stars } : { ratingSum: stars, ratingCount: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return { rating: stars, ratingCount: stats?.ratingCount ?? 1, ratingAverage: stats?.ratingCount ? Math.round((stats.ratingSum / stats.ratingCount) * 10) / 10 : stars };
}

export async function addComment(target: Target, user: UserDoc, input: { body: string; kind: CommentKind; parentId?: string }) {
  requireTarget(target);
  if (!user.profileComplete) throw new CommunityError("Add your name to your profile before posting.", 403);
  const db = await store();
  const key = targetKey(target);
  const comments = db.collection<CommentDoc>(STORE_COLLECTIONS.comments);
  if (input.parentId) {
    const parent = await comments.findOne({ _id: input.parentId, target: key, status: "visible", parentId: null });
    if (!parent) throw new CommunityError("That comment can't be replied to.", 404);
  }
  const checked = moderate(input.body, { allowedHosts: [ownHost()] });
  if (checked.action === "reject") throw new CommunityError(checked.reason, 422);
  const status: CommentStatus = checked.action === "review" ? "pending" : "visible";
  const doc: CommentDoc = {
    _id: randomUUID(),
    target: key,
    parentId: input.parentId ?? null,
    userId: user._id,
    authorName: displayName(user),
    kind: input.parentId ? "viewpoint" : input.kind,
    body: checked.text,
    status,
    reports: 0,
    helpful: 0,
    createdAt: new Date(),
  };
  await comments.insertOne(doc);
  if (status === "visible") await db.collection(STORE_COLLECTIONS.stats).updateOne({ _id: key }, { $inc: { comments: 1 } }, { upsert: true });
  return { id: doc._id, status, body: doc.body, note: checked.action === "review" ? checked.reason : checked.action === "mask" ? "Some words were hidden." : undefined };
}

/** Marks a comment as helpful once per person. */
export async function markHelpful(commentId: string, user: UserDoc) {
  const db = await store();
  const comment = await db.collection<CommentDoc>(STORE_COLLECTIONS.comments).findOne({ _id: commentId, status: "visible" });
  if (!comment) throw new CommunityError("That comment isn't available.", 404);
  try {
    await db.collection(STORE_COLLECTIONS.reactions).insertOne({ _id: `helpful:${commentId}:${user._id}`, target: comment.target, userId: user._id, kind: "helpful", createdAt: new Date() });
  } catch {
    return { helpful: comment.helpful ?? 0 };
  }
  const updated = await db.collection<CommentDoc>(STORE_COLLECTIONS.comments).findOneAndUpdate({ _id: commentId }, { $inc: { helpful: 1 } }, { returnDocument: "after" });
  return { helpful: updated?.helpful ?? 1 };
}

export async function deleteOwnComment(commentId: string, user: UserDoc) {
  const db = await store();
  const comment = await db.collection<CommentDoc>(STORE_COLLECTIONS.comments).findOne({ _id: commentId, userId: user._id });
  if (!comment) throw new CommunityError("That comment isn't yours to delete.", 404);
  await setCommentStatus(db, comment, "removed");
}

export async function report(commentId: string, user: UserDoc, reason: string) {
  const db = await store();
  const comments = db.collection<CommentDoc>(STORE_COLLECTIONS.comments);
  const comment = await comments.findOne({ _id: commentId, status: "visible" });
  if (!comment) return;
  try {
    await db.collection(STORE_COLLECTIONS.reports).insertOne({ _id: `${commentId}:${user._id}`, commentId, userId: user._id, reason, createdAt: new Date() });
  } catch {
    return; // Already reported by this person.
  }
  const updated = await comments.findOneAndUpdate({ _id: commentId }, { $inc: { reports: 1 } }, { returnDocument: "after" });
  if (updated && updated.reports >= REPORTS_TO_HIDE) await setCommentStatus(db, updated, "hidden");
}

async function setCommentStatus(db: Store, comment: CommentDoc, status: CommentStatus, note?: string) {
  if (comment.status === status) return;
  const result = await db.collection(STORE_COLLECTIONS.comments).updateOne({ _id: comment._id, status: comment.status }, { $set: { status, ...(note ? { reviewNote: note } : {}) } });
  if (result.matchedCount !== 1) return; // Someone else changed it first.
  const delta = (status === "visible" ? 1 : 0) - (comment.status === "visible" ? 1 : 0);
  if (delta) await db.collection(STORE_COLLECTIONS.stats).updateOne({ _id: comment.target }, { $inc: { comments: delta } }, { upsert: true });
}

export async function proposeEdit(target: Target, user: UserDoc, input: { field: string; text: string; reason: string }) {
  const content = requireTarget(target);
  const fields = EDITABLE_FIELDS[target.type] ?? {};
  const field = Object.hasOwn(fields, input.field) ? fields[input.field] : undefined;
  if (!field) throw new CommunityError("That part of the page can't be edited.", 400);
  if (!user.profileComplete) throw new CommunityError("Add your name to your profile before suggesting changes.", 403);
  for (const text of [input.text, input.reason]) {
    const checked = moderate(text, { allowedHosts: [ownHost()] });
    if (checked.action === "reject") throw new CommunityError(checked.reason, 422);
  }
  const db = await store();
  const edits = db.collection<EditDoc>(STORE_COLLECTIONS.edits);
  const key = targetKey(target);
  if ((await edits.countDocuments({ userId: user._id, status: "pending" })) >= 10) {
    throw new CommunityError("You have 10 suggestions waiting for review. Please wait for those first.", 429);
  }
  const doc: EditDoc = {
    _id: randomUUID(),
    target: key,
    title: content.title,
    path: content.path,
    field: input.field,
    current: (await overridesFor(target))[input.field] ?? currentFieldValue(target, input.field) ?? "",
    proposed: textToField(input.text, field.kind),
    reason: input.reason.trim(),
    userId: user._id,
    authorName: displayName(user),
    status: "pending",
    createdAt: new Date(),
  };
  await edits.insertOne(doc);
  return { id: doc._id };
}

/** Approved changes for a page, keyed by field. Empty when there is no database. */
export async function overridesFor(target: Target): Promise<Record<string, unknown>> {
  const db = await getStore().catch(() => null);
  if (!db) return {};
  const rows = await db.collection<Doc & { field: string; value: unknown }>(STORE_COLLECTIONS.overrides).find({ target: targetKey(target) }).toArray();
  return Object.fromEntries(rows.map((row) => [row.field, row.value]));
}

// ---- Admin -------------------------------------------------------------------

async function audit(db: Store, admin: UserDoc, action: string, subject: string, detail?: string) {
  // The shared, tamper-evident admin log (lib/security/audit).
  await appendAudit({ actorId: admin._id, actorEmail: admin.email, action, target: subject, detail, outcome: "ok" }, db);
}

export async function listEdits(status: EditDoc["status"] = "pending") {
  const db = await store();
  return db.collection<EditDoc>(STORE_COLLECTIONS.edits).find({ status }, { sort: { createdAt: status === "pending" ? 1 : -1 }, limit: 100 }).toArray();
}

export async function decideEdit(id: string, admin: UserDoc, approve: boolean, note: string) {
  const db = await store();
  const edits = db.collection<EditDoc>(STORE_COLLECTIONS.edits);
  const edit = await edits.findOneAndUpdate(
    { _id: id, status: "pending" },
    { $set: { status: approve ? "approved" : "rejected", reviewedAt: new Date(), reviewedBy: admin._id, reviewNote: note } },
    { returnDocument: "after" },
  );
  if (!edit) throw new CommunityError("That suggestion was already reviewed.", 409);
  if (approve) {
    await db.collection(STORE_COLLECTIONS.overrides).updateOne(
      { _id: `${edit.target}:${edit.field}` },
      { $set: { target: edit.target, field: edit.field, value: edit.proposed, editId: edit._id, approvedBy: admin._id, approvedAt: new Date() } },
      { upsert: true },
    );
    try {
      revalidatePath(edit.path.split("#")[0]!);
    } catch {
      // Outside a request (tests), there is no cache to clear.
    }
  }
  await audit(db, admin, approve ? "edit.approve" : "edit.reject", edit._id, `${edit.target} ${edit.field}`);
  return edit;
}

export async function listComments(status: Exclude<CommentStatus, "visible"> | "reported") {
  const db = await store();
  const filter = status === "reported" ? { status: "visible", reports: { $gt: 0 } } : { status };
  return db.collection<CommentDoc>(STORE_COLLECTIONS.comments).find(filter, { sort: { createdAt: -1 }, limit: 100 }).toArray();
}

export async function moderateComment(id: string, admin: UserDoc, status: "visible" | "removed", note: string) {
  const db = await store();
  const comment = await db.collection<CommentDoc>(STORE_COLLECTIONS.comments).findOne({ _id: id });
  if (!comment) throw new CommunityError("That comment doesn't exist.", 404);
  await setCommentStatus(db, comment, status, note);
  if (status === "visible") await db.collection(STORE_COLLECTIONS.comments).updateOne({ _id: id }, { $set: { reports: 0 } });
  await audit(db, admin, `comment.${status}`, id, note);
}

export async function adminOverview() {
  const db = await store();
  const [pendingEdits, pendingComments, hiddenComments, users] = await Promise.all([
    db.collection(STORE_COLLECTIONS.edits).countDocuments({ status: "pending" }),
    db.collection(STORE_COLLECTIONS.comments).countDocuments({ status: "pending" }),
    db.collection(STORE_COLLECTIONS.comments).countDocuments({ status: "hidden" }),
    db.collection(STORE_COLLECTIONS.users).countDocuments({}),
  ]);
  const recentAudit = await db.collection(STORE_COLLECTIONS.audit).find({}, { sort: { at: -1 }, limit: 20 }).toArray();
  return { pendingEdits, pendingComments, hiddenComments, users, recentAudit };
}
