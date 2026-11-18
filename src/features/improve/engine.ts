import "server-only";
import type { UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Doc, type Store } from "@/lib/database/store";
import { audit } from "@/lib/security/audit";
import { contentFor } from "@/features/community/content";
import { TARGET_TYPES, type TargetType } from "@/features/community/targets";
import { gaps } from "@/features/media/library";

/**
 * The improvement engine: recommendations built only from what the site has recorded, never
 * estimated. Each one names its evidence (how many, from where) and keeps a review state
 * (new → accepted / dismissed → done) with who decided. Evidence is recomputed on each visit;
 * a decision stays with its recommendation, and one whose evidence has gone is marked as resolved.
 */

export const REC_KINDS = {
  "zero-search": "Searches with no results",
  "yatri-gap": "Questions Yatri couldn't answer well",
  "wrong-report": "Comments reported as wrong",
  "missing-image": "Pages without their own image",
  "missing-alt": "Images without alt text or credit",
} as const;
export type RecKind = keyof typeof REC_KINDS;
export const REC_STATES = ["new", "accepted", "dismissed", "done"] as const;
export type RecState = (typeof REC_STATES)[number];

export interface RecDoc extends Doc {
  kind: RecKind;
  title: string;
  evidence: string;
  count: number;
  href?: string;
  state: RecState;
  /** False once the evidence is no longer there (for example, the image was added). */
  active: boolean;
  firstSeen: Date;
  lastSeen: Date;
  decidedBy?: string;
  decidedByEmail?: string;
  decidedAt?: Date;
  note?: string;
}

type Finding = Pick<RecDoc, "_id" | "kind" | "title" | "evidence" | "count" | "href">;

/**
 * Phase 6's analytics: daily search totals (`analytics_daily`, dim "search", `zero` = searches with no
 * results) and raw events (`analytics_events`, name "search", `results`). Both are read defensively, so
 * a missing collection or a different shape just means no search recommendations.
 */
export const ANALYTICS_SEARCH_SOURCES = { daily: "analytics_daily", events: "analytics_events" } as const;

async function zeroSearches(db: Store, since: Date): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const add = (query: unknown, amount: unknown) => {
    const key = typeof query === "string" ? query.trim().toLowerCase().slice(0, 80) : "";
    const n = Number(amount);
    if (key && Number.isFinite(n) && n > 0) counts.set(key, (counts.get(key) ?? 0) + n);
  };
  try {
    const daily = await db.collection(ANALYTICS_SEARCH_SOURCES.daily).find({ dim: "search", zero: { $gt: 0 } }, { limit: 5000 }).toArray();
    const sinceDay = since.toISOString().slice(0, 10);
    for (const row of daily) if (typeof row.day !== "string" || row.day >= sinceDay) add(row.key, row.zero);
  } catch {
    // No analytics yet.
  }
  if (counts.size) return counts;
  try {
    const events = await db.collection(ANALYTICS_SEARCH_SOURCES.events).find({ name: "search", results: 0 }, { limit: 5000 }).toArray();
    for (const row of events) if (!(row.at instanceof Date) || row.at >= since) add(row.query, 1);
  } catch {
    // No analytics yet.
  }
  return counts;
}

const slugify = (text: string) => text.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "x";

/** Everything the data shows right now. */
export async function findings(db: Store, now = new Date()): Promise<Finding[]> {
  const since = new Date(now.getTime() - 30 * 86_400_000);
  const found: Finding[] = [];

  for (const [query, count] of [...(await zeroSearches(db, since))].sort((a, b) => b[1] - a[1]).slice(0, 50)) {
    if (count < 2) continue;
    found.push({ _id: `zero-search:${slugify(query)}`, kind: "zero-search", title: `Add or link content for “${query}”`, evidence: `${count} searches in the last 30 days found nothing.`, count, href: "/admin/content" });
  }

  const questions = await db
    .collection<Doc & { question: string | null; confidence: string; feedback: string | null; status: string }>(STORE_COLLECTIONS.yatriQuestions)
    .find({ status: "new", expiresAt: { $gt: now } }, { limit: 5000 })
    .toArray();
  const weak = questions.filter((row) => row.confidence !== "ok" || row.feedback === "down");
  const byText = new Map<string, number>();
  for (const row of weak) if (row.question) byText.set(row.question.toLowerCase(), (byText.get(row.question.toLowerCase()) ?? 0) + 1);
  for (const [question, count] of [...byText].sort((a, b) => b[1] - a[1]).slice(0, 30)) {
    found.push({ _id: `yatri-gap:${slugify(question)}`, kind: "yatri-gap", title: `Help Yatri answer “${question.slice(0, 80)}”`, evidence: `Asked ${count} ${count === 1 ? "time" : "times"} in the last 30 days and answered poorly or rated unhelpful.`, count, href: "/admin/yatri" });
  }
  const wordless = weak.filter((row) => !row.question).length;
  if (wordless) found.push({ _id: "yatri-gap:without-words", kind: "yatri-gap", title: "Review Yatri's weak answers", evidence: `${wordless} weak answers whose words weren't kept (no consent).`, count: wordless, href: "/admin/yatri" });

  const reports = await db.collection<Doc & { commentId: string; reason: string }>(STORE_COLLECTIONS.reports).find({ reason: "wrong" }, { limit: 5000 }).toArray();
  if (reports.length) {
    const comments = await db.collection<Doc & { target: string; status: string }>(STORE_COLLECTIONS.comments).find({ _id: { $in: [...new Set(reports.map((row) => row.commentId))] } }).toArray();
    const byTarget = new Map<string, number>();
    for (const report of reports) {
      const comment = comments.find((row) => row._id === report.commentId);
      if (comment && comment.status !== "removed") byTarget.set(comment.target, (byTarget.get(comment.target) ?? 0) + 1);
    }
    for (const [target, count] of byTarget) {
      const [type, id] = target.split(":");
      const page = (TARGET_TYPES as readonly string[]).includes(type ?? "") ? contentFor({ type: type as TargetType, id: id ?? "" }) : undefined;
      found.push({ _id: `wrong-report:${target}`, kind: "wrong-report", title: `Check the facts on ${page?.title ?? target}`, evidence: `${count} ${count === 1 ? "report" : "reports"} that a comment here is wrong.`, count, href: page?.path });
    }
  }

  for (const gap of gaps()) {
    const kind: RecKind = gap.kind === "missing-image" ? "missing-image" : "missing-alt";
    found.push({ _id: `${kind}:${slugify(gap.href + gap.label.toLowerCase())}`, kind, title: kind === "missing-image" ? `Find a licensed image for ${gap.label}` : `Fix the details of ${gap.label}`, evidence: gap.detail, count: 1, href: gap.href });
  }
  return found;
}

/** Recomputes the evidence and merges it with the stored review states. */
export async function refresh(now = new Date()): Promise<RecDoc[]> {
  const db = await getStore();
  if (!db) return [];
  const recs = db.collection<RecDoc>(STORE_COLLECTIONS.recommendations);
  const current = await findings(db, now);
  const ids = new Set(current.map((row) => row._id));
  for (const finding of current) {
    await recs.updateOne({ _id: finding._id }, { $set: { kind: finding.kind, title: finding.title, evidence: finding.evidence, count: finding.count, href: finding.href, active: true, lastSeen: now }, $setOnInsert: { state: "new", firstSeen: now } }, { upsert: true });
  }
  for (const old of await recs.find({ active: true }, { limit: 5000 }).toArray()) if (!ids.has(old._id)) await recs.updateOne({ _id: old._id }, { $set: { active: false } });
  return recs.find({}, { sort: { count: -1 }, limit: 1000 }).toArray();
}

export class RecError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export async function decide(admin: UserDoc, id: string, state: RecState, note = "") {
  const db = await getStore();
  if (!db) throw new RecError("This isn't available right now.", 503);
  const recs = db.collection<RecDoc>(STORE_COLLECTIONS.recommendations);
  const rec = await recs.findOne({ _id: id });
  if (!rec) throw new RecError("That recommendation doesn't exist.", 404);
  await recs.updateOne({ _id: id }, { $set: { state, decidedBy: admin._id, decidedByEmail: admin.email, decidedAt: new Date(), note: note.slice(0, 300) } });
  await audit({ actorId: admin._id, actorEmail: admin.email, action: "improve.decide", target: id.slice(0, 120), before: { state: rec.state }, after: { state }, detail: note.slice(0, 200) || undefined, outcome: "ok" }, db);
}
