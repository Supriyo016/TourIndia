import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { destinations } from "@/data";
import type { Itinerary, TripDay } from "@/features/itinerary/generate";
import { layoutSchema, restoreTrip, tripInputSchema, type StoredTripInput } from "@/features/itinerary/share";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";

/**
 * Trips saved to an account. A trip is stored as its planner settings plus the order of items
 * in each day; everything shown (places, activities, costs) is rebuilt from the guide, so a saved
 * trip never holds free text except its name and the expense list its owner types in.
 */

export const TRIP_LIMIT = 50;

export const expensesSchema = z
  .object({
    people: z.array(z.string().trim().min(1).max(40)).max(30),
    items: z
      .array(
        z.object({
          id: z.string().min(1).max(40),
          label: z.string().trim().min(1, "Say what it was for.").max(80),
          amount: z.number().positive().max(1e8),
          paidBy: z.string().trim().min(1).max(40),
        }),
      )
      .max(300),
  })
  .strict();
export type TripExpenses = z.infer<typeof expensesSchema>;

export const tripNameSchema = z.string().trim().min(1, "Give the trip a name.").max(80, "Keep the name under 80 characters.");

export interface TripDoc extends Doc {
  userId: string;
  name: string;
  input: StoredTripInput;
  layout: string[][];
  expenses: TripExpenses;
  status: "active" | "archived";
  /** Present while the read-only link is on; a new one each time sharing is turned on. */
  shareId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripSummary {
  id: string;
  name: string;
  status: TripDoc["status"];
  places: string[];
  days: number;
  travellers: number;
  startDate: string | null;
  shared: boolean;
  updatedAt: string;
}

export class TripError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

const names = new Map(destinations.map((d) => [d.slug, d.name]));
const placeNames = (input: StoredTripInput) => input.destinationSlugs.map((slug) => names.get(slug) ?? slug);

async function trips() {
  const store = await getStore();
  if (!store) throw new TripError("Saving trips to your account isn't available right now.", 503);
  return store.collection<TripDoc>(STORE_COLLECTIONS.trips);
}

const summary = (t: TripDoc): TripSummary => ({
  id: t._id,
  name: t.name,
  status: t.status,
  places: placeNames(t.input),
  days: t.input.days,
  travellers: t.input.travellers,
  startDate: t.input.startDate,
  shared: Boolean(t.shareId),
  updatedAt: t.updatedAt.toISOString(),
});

/** Checks settings and layout and makes sure the trip can actually be rebuilt from the guide. */
function check(input: unknown, layout: unknown): { input: StoredTripInput; layout: string[][] } {
  const parsedInput = tripInputSchema.safeParse(input);
  const parsedLayout = layoutSchema.safeParse(layout);
  if (!parsedInput.success || !parsedLayout.success) throw new TripError("That trip couldn't be read. Try planning it again.", 422);
  if (!restoreTrip(parsedInput.data, parsedLayout.data, destinations)) throw new TripError("That trip uses a place that isn't in the guide.", 422);
  return { input: parsedInput.data, layout: parsedLayout.data };
}

export async function listTrips(userId: string): Promise<TripSummary[]> {
  const rows = await (await trips()).find({ userId }, { sort: { updatedAt: -1 }, limit: TRIP_LIMIT }).toArray();
  return rows.map(summary);
}

export async function createTrip(userId: string, raw: { name: string; input: unknown; layout: unknown }): Promise<TripSummary> {
  const collection = await trips();
  if ((await collection.countDocuments({ userId })) >= TRIP_LIMIT) throw new TripError(`You can keep up to ${TRIP_LIMIT} trips. Delete an old one first.`, 422);
  const { input, layout } = check(raw.input, raw.layout);
  const now = new Date();
  const doc: TripDoc = { _id: randomUUID(), userId, name: raw.name, input, layout, expenses: { people: [], items: [] }, status: "active", createdAt: now, updatedAt: now };
  await collection.insertOne(doc);
  return summary(doc);
}

async function own(userId: string, id: string): Promise<TripDoc> {
  const found = await (await trips()).findOne({ _id: id, userId });
  // Someone else's trip looks the same as one that doesn't exist.
  if (!found) throw new TripError("That trip doesn't exist.", 404);
  return found;
}

async function patch(userId: string, id: string, set: Partial<TripDoc>, unset?: Record<string, "">) {
  await (await trips()).updateOne({ _id: id, userId }, { $set: { ...set, updatedAt: new Date() }, ...(unset ? { $unset: unset } : {}) });
}

/** Replaces the plan itself, for "Save changes" from the planner. */
export async function updatePlan(userId: string, id: string, raw: { input: unknown; layout: unknown }) {
  await own(userId, id);
  const { input, layout } = check(raw.input, raw.layout);
  await patch(userId, id, { input, layout });
}

export async function renameTrip(userId: string, id: string, name: string) {
  await own(userId, id);
  await patch(userId, id, { name });
}

export async function setStatus(userId: string, id: string, status: TripDoc["status"]) {
  await own(userId, id);
  await patch(userId, id, { status });
}

export async function duplicateTrip(userId: string, id: string): Promise<TripSummary> {
  const original = await own(userId, id);
  // Expenses and the share link stay with the original.
  return createTrip(userId, { name: `${original.name} (copy)`.slice(0, 80), input: original.input, layout: original.layout });
}

export async function deleteTrip(userId: string, id: string) {
  await own(userId, id);
  await (await trips()).deleteOne({ _id: id, userId });
}

export async function setExpenses(userId: string, id: string, expenses: TripExpenses) {
  await own(userId, id);
  await patch(userId, id, { expenses });
}

export async function shareTrip(userId: string, id: string, on: boolean): Promise<string | null> {
  await own(userId, id);
  if (!on) {
    await patch(userId, id, {}, { shareId: "" });
    return null;
  }
  const shareId = randomBytes(12).toString("base64url");
  await patch(userId, id, { shareId });
  return shareId;
}

export interface TripView {
  id: string;
  name: string;
  status: TripDoc["status"];
  shareId: string | null;
  input: StoredTripInput;
  trip: Itinerary;
  days: TripDay[];
  expenses: TripExpenses;
}

/** The full trip for its owner, rebuilt from the guide. */
export async function tripForOwner(userId: string, id: string): Promise<TripView | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const found = await (await trips()).findOne({ _id: id, userId }).catch(() => null);
  if (!found) return null;
  const restored = restoreTrip(found.input, found.layout, destinations);
  if (!restored) return null;
  return { id: found._id, name: found.name, status: found.status, shareId: found.shareId ?? null, input: found.input, trip: restored.trip, days: restored.days, expenses: found.expenses };
}

/** What a share link shows: the plan and the estimate. Never the expenses or who made it. */
export async function sharedTrip(shareId: string): Promise<{ name: string; trip: Itinerary; days: TripDay[] } | null> {
  if (!/^[A-Za-z0-9_-]{16}$/.test(shareId)) return null;
  const store = await getStore();
  if (!store) return null;
  const found = await store.collection<TripDoc>(STORE_COLLECTIONS.trips).findOne({ shareId });
  if (!found) return null;
  const owner = await store.collection(STORE_COLLECTIONS.users).findOne({ _id: found.userId });
  if (!owner || owner.status !== "active") return null;
  const restored = restoreTrip(found.input, found.layout, destinations);
  return restored ? { name: found.name, ...restored } : null;
}

export async function tripCount(userId: string) {
  const store = await getStore();
  return store ? store.collection(STORE_COLLECTIONS.trips).countDocuments({ userId, status: "active" }) : null;
}

export async function deleteTrips(userId: string) {
  await (await getStore())?.collection(STORE_COLLECTIONS.trips).deleteMany({ userId });
}
