import "server-only";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";
import type { LogRecord } from "@/lib/security/audit";
import { openAppeals } from "./restrictions";

/**
 * The moderation queue: one read-only overview of everything waiting for a decision, grouped the
 * way moderators think about it. Decisions are made on the pages each group links to.
 */

export interface QueueGroup {
  id: string;
  title: string;
  description: string;
  count: number;
  href: string;
  /** A few examples, newest first. */
  examples: { text: string; meta: string }[];
}

const REPORT_GROUP: Record<string, "inappropriate" | "spam" | "wrong" | "personal"> = {
  disrespectful: "inappropriate",
  hateful: "inappropriate",
  spam: "spam",
  wrong: "wrong",
  personal: "personal",
};

const short = (text: unknown, length = 110) => {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
};
const day = (value: unknown) => (value instanceof Date ? value.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "");

export async function moderationQueue(): Promise<{ groups: QueueGroup[]; recent: { at: Date; action: string; by?: string; target?: string }[] }> {
  const store = await getStore();
  if (!store) return { groups: [], recent: [] };

  const [reports, held, edits, tickets, appeals, recent] = await Promise.all([
    store.collection<Doc & { commentId: string; reason: string; createdAt: Date }>(STORE_COLLECTIONS.reports).find({}, { sort: { createdAt: -1 }, limit: 500 }).toArray(),
    store.collection(STORE_COLLECTIONS.comments).find({ status: "pending" }, { sort: { createdAt: -1 }, limit: 50 }).toArray(),
    store.collection(STORE_COLLECTIONS.edits).find({ status: "pending" }, { sort: { createdAt: -1 }, limit: 50 }).toArray(),
    store.collection(STORE_COLLECTIONS.tickets).find({ status: { $in: ["new", "under_review", "in_progress"] }, category: { $in: ["copyright", "correction", "privacy", "accessibility"] } }, { sort: { createdAt: -1 }, limit: 200 }).toArray(),
    openAppeals(50),
    store.collection<LogRecord>(STORE_COLLECTIONS.audit).find({ action: { $in: ["edit.approve", "edit.reject", "comment.visible", "comment.removed", "appeal.upheld", "appeal.overturned", "user.suspension", "user.ban", "user.restore", "ticket.update"] } }, { sort: { seq: -1 }, limit: 15 }).toArray(),
  ]);

  // Reports only count while their comment is still up (visible or hidden pending review).
  const commentIds = [...new Set(reports.map((r) => r.commentId))];
  const comments = commentIds.length ? await store.collection(STORE_COLLECTIONS.comments).find({ _id: { $in: commentIds }, status: { $in: ["visible", "hidden"] } }, { limit: 500 }).toArray() : [];
  const live = new Map(comments.map((c) => [c._id, c]));
  const reported: Record<"inappropriate" | "spam" | "wrong" | "personal", { count: Set<string>; examples: QueueGroup["examples"] }> = {
    inappropriate: { count: new Set(), examples: [] },
    spam: { count: new Set(), examples: [] },
    wrong: { count: new Set(), examples: [] },
    personal: { count: new Set(), examples: [] },
  };
  for (const r of reports) {
    const comment = live.get(r.commentId);
    const group = REPORT_GROUP[r.reason];
    if (!comment || !group || reported[group].count.has(r.commentId)) continue;
    reported[group].count.add(r.commentId);
    if (reported[group].examples.length < 3) reported[group].examples.push({ text: short(comment.body), meta: `${String(comment.status)} · reported ${day(r.createdAt)}` });
  }

  const ticketsBy = (category: string) => tickets.filter((t) => t.category === category);
  const ticketExamples = (rows: Doc[]) => rows.slice(0, 3).map((t) => ({ text: short(t.subject, 90), meta: `${String(t.reference)} · ${day(t.createdAt)}` }));
  const group = (id: string, title: string, description: string, count: number, href: string, examples: QueueGroup["examples"]): QueueGroup => ({ id, title, description, count, href, examples });

  return {
    groups: [
      group("inappropriate", "Inappropriate comments", "Reported as disrespectful or hateful.", reported.inappropriate.count.size, "/admin#reported-title", reported.inappropriate.examples),
      group("spam", "Spam and malicious links", "Reported as spam or advertising.", reported.spam.count.size, "/admin#reported-title", reported.spam.examples),
      group("held", "Held by the filter", "Comments the automatic check held for a person to read.", held.length, "/admin#held-title", held.slice(0, 3).map((c) => ({ text: short(c.body), meta: day(c.createdAt) }))),
      group(
        "wrong",
        "Incorrect information",
        "Comments reported as wrong, suggested corrections, and correction tickets.",
        reported.wrong.count.size + edits.length + ticketsBy("correction").length,
        "/admin#edits-title",
        [...edits.slice(0, 2).map((e) => ({ text: `${String(e.field)}: ${short(e.value, 80)}`, meta: `suggested edit · ${day(e.createdAt)}` })), ...ticketExamples(ticketsBy("correction")).slice(0, 1)],
      ),
      group("personal", "Privacy", "Comments reported for sharing personal details, and privacy requests.", reported.personal.count.size + ticketsBy("privacy").length, "/admin/support?category=privacy", [...reported.personal.examples.slice(0, 2), ...ticketExamples(ticketsBy("privacy")).slice(0, 1)]),
      group("copyright", "Copyright complaints", "Copyright and photo-credit tickets.", ticketsBy("copyright").length, "/admin/support?category=copyright", ticketExamples(ticketsBy("copyright"))),
      group("accessibility", "Accessibility problems", "Tickets about something that's hard to use.", ticketsBy("accessibility").length, "/admin/support?category=accessibility", ticketExamples(ticketsBy("accessibility"))),
      group("appeals", "Appeals", "People asking for a suspension or ban to be reviewed.", appeals.length, "/admin/users", appeals.slice(0, 3).map((a) => ({ text: short(a.appeal?.message), meta: `${a.email} · ${day(a.appeal?.submittedAt)}` }))),
    ],
    recent: recent.map((r) => ({ at: r.at, action: r.action, by: r.actorEmail, target: r.target })),
  };
}
