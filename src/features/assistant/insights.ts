import "server-only";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Doc, type Store } from "@/lib/database/store";
import { audit } from "@/lib/security/audit";

/**
 * What Yatri's admins can see. Every answer gets a record with an id and a secret feedback token
 * (only the browser that asked holds the token, so only it can rate the answer). The question's
 * text is kept only when the visitor has accepted optional storage, with emails, phone numbers and
 * links removed, and every record expires after 30 days. Daily counts hold no personal data.
 */

export const RETENTION_DAYS = 30;
export type Confidence = "ok" | "low" | "unanswered";
export type Vote = "up" | "down";

export interface QuestionDoc extends Doc {
  /** Null when the visitor didn't consent to optional storage. */
  question: string | null;
  mode: "ai" | "guide";
  confidence: Confidence;
  tokenHash: string;
  feedback: Vote | null;
  status: "new" | "handled";
  handledBy?: string;
  handledAt?: Date;
  handledNote?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface UsageDoc extends Doc {
  questions?: number;
  ai?: number;
  guide?: number;
  low?: number;
  unanswered?: number;
  up?: number;
  down?: number;
}

export class YatriError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const day = (date = new Date()) => date.toISOString().slice(0, 10);

/** Removes things that could identify someone before a question is kept. */
export function redact(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
    .replace(/https?:\/\/\S+|www\.\S+/gi, "[link]")
    .replace(/\+?\d[\d\s-]{7,}\d/g, "[number]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

const UNANSWERED = /\b(i don'?t have a guide that matches|no guide matches|couldn'?t find|could not find|i'?m not sure|i don'?t know|no information)\b/i;

/** How well an answer was grounded in the guides: from the reply and what the tools returned. */
export function confidenceOf(text: string, toolOutput: string, mode: "ai" | "guide"): Confidence {
  if (!text.trim() || UNANSWERED.test(text)) return "unanswered";
  if (/"found":\s*false/.test(toolOutput) || (mode === "ai" && !toolOutput.trim()) || /^Here's what Tour India has on that/.test(text)) return "low";
  return "ok";
}

async function bump(db: Store, fields: Record<string, number>) {
  await db.collection<UsageDoc>(STORE_COLLECTIONS.yatriUsage).updateOne({ _id: day() }, { $inc: fields }, { upsert: true });
}

/** Records one answer. Never throws: logging must not break Yatri. Returns the id and token for feedback. */
export async function recordAnswer(input: { question: string; text: string; toolOutput: string; mode: "ai" | "guide"; consent: boolean }): Promise<{ id: string; token: string } | null> {
  try {
    const db = await getStore();
    if (!db) return null;
    const confidence = confidenceOf(input.text, input.toolOutput, input.mode);
    const token = randomBytes(18).toString("base64url");
    const now = new Date();
    const doc: QuestionDoc = {
      _id: randomUUID(),
      question: input.consent ? redact(input.question) : null,
      mode: input.mode,
      confidence,
      tokenHash: hash(token),
      feedback: null,
      status: "new",
      createdAt: now,
      expiresAt: new Date(now.getTime() + RETENTION_DAYS * 86_400_000),
    };
    await db.collection<QuestionDoc>(STORE_COLLECTIONS.yatriQuestions).insertOne(doc);
    await bump(db, { questions: 1, [input.mode]: 1, ...(confidence === "ok" ? {} : { [confidence === "low" ? "low" : "unanswered"]: 1 }) });
    return { id: doc._id, token };
  } catch (error) {
    console.error("[yatri] could not record an answer", error instanceof Error ? error.name : "");
    return null;
  }
}

/** Thumbs up or down, only from the browser that got the answer. A second vote replaces the first. */
export async function giveFeedback(id: string, token: string, vote: Vote) {
  const db = await getStore();
  if (!db) throw new YatriError("Feedback isn't available right now.", 503);
  const questions = db.collection<QuestionDoc>(STORE_COLLECTIONS.yatriQuestions);
  const doc = await questions.findOne({ _id: id });
  const given = Buffer.from(hash(token));
  if (!doc || doc.expiresAt < new Date() || !timingSafeEqual(given, Buffer.from(doc.tokenHash))) throw new YatriError("That answer can't be rated.", 404);
  if (doc.feedback === vote) return { vote };
  const updated = await questions.updateOne({ _id: id, feedback: doc.feedback }, { $set: { feedback: vote, ...(vote === "down" ? { status: "new" } : {}) } });
  if (updated.matchedCount) await bump(db, { [vote]: 1, ...(doc.feedback ? { [doc.feedback]: -1 } : {}) });
  return { vote };
}

export type QuestionFilter = "attention" | "unanswered" | "low" | "down" | "up" | "handled" | "all";

/** Questions for review, newest first. Expired records are removed first (MongoDB's TTL index does this too). */
export async function listQuestions(filter: QuestionFilter = "attention", limit = 100) {
  const db = await getStore();
  if (!db) return [];
  const questions = db.collection<QuestionDoc>(STORE_COLLECTIONS.yatriQuestions);
  await questions.deleteMany({ expiresAt: { $lt: new Date() } });
  const query: Record<string, unknown> =
    filter === "attention"
      ? { status: "new", $or: [{ confidence: { $in: ["low", "unanswered"] } }, { feedback: "down" }] }
      : filter === "unanswered" || filter === "low"
        ? { confidence: filter }
        : filter === "down" || filter === "up"
          ? { feedback: filter }
          : filter === "handled"
            ? { status: "handled" }
            : {};
  return questions.find(query, { sort: { createdAt: -1 }, limit }).toArray();
}

export async function usage(days = 14) {
  const db = await getStore();
  if (!db) return [];
  const since = day(new Date(Date.now() - (days - 1) * 86_400_000));
  return db.collection<UsageDoc>(STORE_COLLECTIONS.yatriUsage).find({ _id: { $gte: since } }, { sort: { _id: -1 }, limit: days }).toArray();
}

/** Marks a question handled (for example, the guide was updated) or reopens it. Audited. */
export async function setHandled(admin: UserDoc, id: string, handled: boolean, note = "") {
  const db = await getStore();
  if (!db) throw new YatriError("This isn't available right now.", 503);
  const questions = db.collection<QuestionDoc>(STORE_COLLECTIONS.yatriQuestions);
  const doc = await questions.findOne({ _id: id });
  if (!doc) throw new YatriError("That question has gone (they're kept for 30 days).", 404);
  await questions.updateOne(
    { _id: id },
    handled ? { $set: { status: "handled", handledBy: admin._id, handledAt: new Date(), handledNote: note.slice(0, 300) } } : { $set: { status: "new" }, $unset: { handledBy: "", handledAt: "", handledNote: "" } },
  );
  await audit({ actorId: admin._id, actorEmail: admin.email, action: handled ? "yatri.handle" : "yatri.reopen", target: id, detail: note.slice(0, 200) || undefined, before: { status: doc.status }, after: { status: handled ? "handled" : "new" }, outcome: "ok" }, db);
}
