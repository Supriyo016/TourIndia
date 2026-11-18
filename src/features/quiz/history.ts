import "server-only";
import { randomUUID } from "node:crypto";
import { destinations } from "@/data";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";
import { readAnswers, writeQuery } from "./params";
import { scoreDestinations, toCandidate } from "./score";
import type { QuizAnswers } from "./questions";

/**
 * Travel quiz results kept for signed-in people. Only the answers are taken from the browser;
 * the matches are worked out again here, so a saved result is always one the quiz really gives.
 */

export const ATTEMPT_LIMIT = 50;

export interface QuizAttemptDoc extends Doc {
  userId: string;
  /** The answers as the quiz writes them in the address bar, without the step. */
  answers: string;
  /** The top matches, best first. */
  matches: string[];
  createdAt: Date;
}

export interface QuizAttemptView {
  id: string;
  answers: QuizAnswers;
  query: string;
  matches: { slug: string; name: string }[];
  createdAt: string;
}

const names = new Map(destinations.map((d) => [d.slug, d.name]));
let candidates: ReturnType<typeof toCandidate>[] | null = null;
const allCandidates = () => (candidates ??= destinations.map(toCandidate));

async function attempts() {
  return (await getStore())?.collection<QuizAttemptDoc>(STORE_COLLECTIONS.quizAttempts) ?? null;
}

/** Normalises answers from a query string; null when nothing was answered. */
export function normaliseAnswers(query: string): { answers: QuizAnswers; query: string } | null {
  const answers = readAnswers(new URLSearchParams(query));
  const normal = writeQuery(answers, "intro");
  return normal ? { answers, query: normal } : null;
}

/** Saves one result. A repeat of the latest result is not saved twice. Oldest go past the limit. */
export async function saveAttempt(userId: string, query: string): Promise<{ saved: boolean } | null> {
  const collection = await attempts();
  if (!collection) return null;
  const normal = normaliseAnswers(query);
  if (!normal) return { saved: false };
  const [latest] = await collection.find({ userId }, { sort: { createdAt: -1 }, limit: 1 }).toArray();
  if (latest?.answers === normal.query) return { saved: false };
  const matches = scoreDestinations(allCandidates(), normal.answers).map((match) => match.slug);
  await collection.insertOne({ _id: randomUUID(), userId, answers: normal.query, matches, createdAt: new Date() });
  const extra = await collection.find({ userId }, { sort: { createdAt: -1 }, skip: ATTEMPT_LIMIT, limit: 100 }).toArray();
  for (const row of extra) await collection.deleteOne({ _id: row._id, userId });
  return { saved: true };
}

export async function listAttempts(userId: string): Promise<QuizAttemptView[]> {
  const rows = (await (await attempts())?.find({ userId }, { sort: { createdAt: -1 }, limit: ATTEMPT_LIMIT }).toArray()) ?? [];
  return rows.map((row) => ({
    id: row._id,
    answers: readAnswers(new URLSearchParams(row.answers)),
    query: row.answers,
    matches: row.matches.flatMap((slug) => (names.has(slug) ? [{ slug, name: names.get(slug)! }] : [])),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function attemptCount(userId: string): Promise<number> {
  return (await (await attempts())?.countDocuments({ userId })) ?? 0;
}

/** Removes one result; someone else's looks the same as one that doesn't exist. */
export async function deleteAttempt(userId: string, id: string): Promise<boolean> {
  const result = await (await attempts())?.deleteOne({ _id: id, userId });
  return Boolean(result?.deletedCount);
}

export async function deleteAttempts(userId: string) {
  await (await attempts())?.deleteMany({ userId });
}
