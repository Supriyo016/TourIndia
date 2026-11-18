import "server-only";
import type { CommentDoc, EditDoc } from "@/features/community/service";
import { contentFor } from "@/features/community/content";
import { EDITABLE_FIELDS, TARGET_TYPES, type Target, type TargetType } from "@/features/community/targets";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";

/**
 * What the person has given to the guide: their comments and where each stands, suggested edits
 * and their outcome, reports they filed and what became of the comment, and the helpful votes
 * their comments received. Read from the existing community collections, for the owner only.
 * Moderators' private notes are never shown here.
 */

const LIMIT = 100;

interface ReportDoc extends Doc {
  commentId: string;
  userId: string;
  reason: string;
  createdAt: Date;
}

export interface PageRef {
  title: string;
  path: string | null;
}

export interface MyComment {
  id: string;
  page: PageRef;
  body: string;
  isReply: boolean;
  status: CommentDoc["status"];
  helpful: number;
  createdAt: string;
}

export interface MyEdit {
  id: string;
  page: PageRef;
  field: string;
  status: EditDoc["status"];
  createdAt: string;
  reviewedAt: string | null;
}

export interface MyReport {
  id: string;
  page: PageRef;
  reason: string;
  /** What has happened to the comment since: still up, hidden after reports, removed, or gone. */
  outcome: "visible" | "pending" | "hidden" | "removed" | "gone";
  createdAt: string;
}

export interface Contributions {
  comments: MyComment[];
  edits: MyEdit[];
  reports: MyReport[];
  helpful: { total: number; comments: number };
}

function page(key: string): PageRef {
  const at = key.indexOf(":");
  const type = key.slice(0, at) as TargetType;
  if (at < 1 || !TARGET_TYPES.includes(type)) return { title: "A page that's no longer here", path: null };
  const content = contentFor({ type, id: key.slice(at + 1) } satisfies Target);
  return content ? { title: content.title, path: content.path } : { title: "A page that's no longer here", path: null };
}

export async function contributionsOf(userId: string): Promise<Contributions | null> {
  const store = await getStore();
  if (!store) return null;
  const commentRows = store.collection<CommentDoc>(STORE_COLLECTIONS.comments);
  const [comments, visible, edits, reports] = await Promise.all([
    commentRows.find({ userId }, { sort: { createdAt: -1 }, limit: LIMIT }).toArray(),
    commentRows.find({ userId, status: "visible" }, { limit: 1000 }).toArray(),
    store.collection<EditDoc>(STORE_COLLECTIONS.edits).find({ userId }, { sort: { createdAt: -1 }, limit: LIMIT }).toArray(),
    store.collection<ReportDoc>(STORE_COLLECTIONS.reports).find({ userId }, { sort: { createdAt: -1 }, limit: LIMIT }).toArray(),
  ]);
  const reported = reports.length ? await commentRows.find({ _id: { $in: reports.map((row) => row.commentId) } }, { limit: reports.length }).toArray() : [];
  const reportedById = new Map(reported.map((row) => [row._id, row]));

  return {
    comments: comments.map((row) => ({
      id: row._id,
      page: page(row.target),
      body: row.body,
      isReply: Boolean(row.parentId),
      status: row.status,
      helpful: row.helpful ?? 0,
      createdAt: row.createdAt.toISOString(),
    })),
    edits: edits.map((row) => {
      const ref = page(row.target);
      const type = row.target.slice(0, row.target.indexOf(":")) as TargetType;
      return {
        id: row._id,
        page: { title: row.title || ref.title, path: ref.path },
        field: EDITABLE_FIELDS[type]?.[row.field]?.label ?? row.field,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
      };
    }),
    reports: reports.map((row) => {
      const comment = reportedById.get(row.commentId);
      return {
        id: row._id,
        page: comment ? page(comment.target) : { title: "A comment that's since been deleted", path: null },
        reason: row.reason,
        outcome: comment ? comment.status : "gone",
        createdAt: row.createdAt.toISOString(),
      };
    }),
    helpful: { total: visible.reduce((sum, row) => sum + (row.helpful ?? 0), 0), comments: visible.filter((row) => (row.helpful ?? 0) > 0).length },
  };
}
