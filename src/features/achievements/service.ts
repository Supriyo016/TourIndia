import "server-only";
import { states } from "@/data";
import { getSaved } from "@/features/saved/service";
import { computeBadges } from "@/features/user/badges";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";
import type { BadgeArtId } from "./art";

/**
 * Achievements come only from what the person has really done here: passport visits they
 * recorded, trips, collections and memories they saved, quiz results, comments others found
 * helpful and suggested edits that were accepted. Nothing is estimated or made up, and nothing
 * is given for simply signing up.
 *
 * Whether each one is earned is worked out fresh from that activity every time. The only thing
 * stored is the date each was first earned, so the page can say when.
 */

export type AchievementGroup = "Passport" | "Planning" | "Memories" | "Quiz" | "Community";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  group: AchievementGroup;
  art: BadgeArtId;
  earned: boolean;
  /** Where the person is against the target, for counted achievements. */
  progress?: { current: number; target: number };
  /** When it was first earned, if it has been. */
  earnedAt?: string;
}

interface AchievementsDoc extends Doc {
  earned: Record<string, Date>;
  updatedAt: Date;
}

export interface Activity {
  stamps: string[];
  trips: number;
  collections: number;
  memories: number;
  sharedMemories: number;
  quizzes: number;
  comments: number;
  helpfulReceived: number;
  editsAccepted: number;
}

const regionOf = (slug: string) => states.find((state) => state.slug === slug)?.region;

const PASSPORT_ART: Record<string, BadgeArtId> = { first: "stamp", five: "stamps", regions: "compass", coast: "wave", himalaya: "mountain", northeast: "hills", all: "india" };

/** Every achievement, earned or not, from a summary of real activity. */
export function achievementsFrom(activity: Activity): Achievement[] {
  // Passport badges come from badges.ts, so they match the passport page exactly.
  const passport: Achievement[] = computeBadges(activity.stamps, regionOf).map((badge) => ({
    id: `passport-${badge.id}`,
    name: badge.name,
    description: badge.description,
    group: "Passport",
    art: PASSPORT_ART[badge.id] ?? "stamp",
    earned: badge.earned,
  }));
  const counted = (id: string, name: string, description: string, group: AchievementGroup, art: BadgeArtId, current: number, target: number): Achievement => ({
    id,
    name,
    description,
    group,
    art,
    earned: current >= target,
    progress: { current: Math.min(current, target), target },
  });
  return [
    ...passport,
    counted("trip-first", "Plans in hand", "Save a trip from the planner to your account.", "Planning", "route", activity.trips, 1),
    counted("trip-five", "Itinerary maker", "Save five trips.", "Planning", "routes", activity.trips, 5),
    counted("collection-first", "Curator", "Make a collection of saved places.", "Planning", "folder", activity.collections, 1),
    counted("memory-first", "First page", "Write your first travel memory.", "Memories", "quill", activity.memories, 1),
    counted("memory-ten", "Storyteller", "Keep ten travel memories.", "Memories", "book", activity.memories, 10),
    counted("memory-shared", "Postcard home", "Share a memory with a read-only link.", "Memories", "postcard", activity.sharedMemories, 1),
    counted("quiz-first", "Curious traveller", "Finish the travel quiz while signed in.", "Quiz", "question", activity.quizzes, 1),
    counted("quiz-five", "Weighing it up", "Keep five quiz results.", "Quiz", "scales", activity.quizzes, 5),
    counted("comment-first", "Say hello", "Post a comment that's published on a guide.", "Community", "speech", activity.comments, 1),
    counted("helpful-first", "Good tip", "Have someone mark one of your comments as helpful.", "Community", "thumb", activity.helpfulReceived, 1),
    counted("helpful-ten", "Trusted voice", "Have your comments marked helpful ten times.", "Community", "star", activity.helpfulReceived, 10),
    counted("edit-accepted", "Fact checker", "Suggest an edit to a guide that's accepted.", "Community", "check", activity.editsAccepted, 1),
  ];
}

/** Reads the person's real activity from the account. */
export async function activityOf(userId: string): Promise<Activity | null> {
  const store = await getStore();
  if (!store) return null;
  const [saved, trips, collections, memories, sharedMemories, quizzes, comments, editsAccepted] = await Promise.all([
    getSaved(userId).catch(() => ({ stamps: [] as string[] })),
    store.collection(STORE_COLLECTIONS.trips).countDocuments({ userId }),
    store.collection(STORE_COLLECTIONS.collections).countDocuments({ userId }),
    store.collection(STORE_COLLECTIONS.memories).countDocuments({ userId }),
    store.collection(STORE_COLLECTIONS.memories).countDocuments({ userId, shareId: { $exists: true } }),
    store.collection(STORE_COLLECTIONS.quizAttempts).countDocuments({ userId }),
    store.collection<Doc & { helpful?: number }>(STORE_COLLECTIONS.comments).find({ userId, status: "visible" }, { limit: 1000 }).toArray(),
    store.collection(STORE_COLLECTIONS.edits).countDocuments({ userId, status: "approved" }),
  ]);
  return {
    stamps: saved.stamps,
    trips,
    collections,
    memories,
    sharedMemories,
    quizzes,
    comments: comments.length,
    helpfulReceived: comments.reduce((sum, comment) => sum + (comment.helpful ?? 0), 0),
    editsAccepted,
  };
}

/**
 * The person's achievements with the dates they were first earned. With `record`, newly earned
 * ones get today's date stored (used when the owner looks; a visitor's view never writes).
 */
export async function achievementsFor(userId: string, { record = false } = {}): Promise<Achievement[] | null> {
  const activity = await activityOf(userId);
  if (!activity) return null;
  const list = achievementsFrom(activity);
  const store = await getStore();
  const collection = store!.collection<AchievementsDoc>(STORE_COLLECTIONS.achievements);
  const doc = await collection.findOne({ _id: userId });
  const earned = { ...(doc?.earned ?? {}) };
  const fresh = list.filter((item) => item.earned && !earned[item.id]);
  if (record && fresh.length) {
    const now = new Date();
    for (const item of fresh) earned[item.id] = now;
    await collection.updateOne({ _id: userId }, { $set: { earned, updatedAt: now } }, { upsert: true });
  }
  return list.map((item) => (item.earned && earned[item.id] ? { ...item, earnedAt: new Date(earned[item.id]!).toISOString() } : item));
}

export type PublicAchievement = Pick<Achievement, "id" | "name" | "description" | "group" | "art">;

/** Only the earned ones, for the public page. */
export async function earnedAchievements(userId: string): Promise<PublicAchievement[]> {
  const list = (await achievementsFor(userId).catch(() => null)) ?? [];
  return list.filter((item) => item.earned).map(({ id, name, description, group, art }) => ({ id, name, description, group, art }));
}

export async function deleteAchievements(userId: string) {
  await (await getStore())?.collection(STORE_COLLECTIONS.achievements).deleteOne({ _id: userId });
}
