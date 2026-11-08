import { z } from "zod";
import { startCities } from "@/data/start-cities";
import { interests } from "@/data/taxonomy";
import type { TravelInterest } from "@/types/content";
import { decodeTrip, encodeTrip, generateItinerary, type Itinerary, type PlannerDestination as Destination, type TripDay, type TripInput } from "./generate";

const MAX_ENCODED_LENGTH = 20_000;

export function isValidTripDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  if (year < 2000 || year > 2100) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const interestIds = interests.map(({ id }) => id) as [TravelInterest, ...TravelInterest[]];

/** A shared link is untrusted input, so it gets the same limits as the form. */
const sharedSchema = z.object({
  input: z.object({
    startName: z.string().refine((name) => startCities.some((city) => city.name === name)),
    destinationSlugs: z
      .array(z.string().max(40))
      .min(1)
      .max(6)
      .refine((slugs) => new Set(slugs).size === slugs.length),
    startDate: z.string().refine(isValidTripDate).nullable(),
    travellers: z.number().int().min(1).max(30),
    days: z.number().int().min(1).max(45),
    budget: z.number().positive().max(1e10).nullable(),
    transport: z.enum(["mixed", "train", "road", "flight"]),
    interests: z.array(z.enum(interestIds)).max(interestIds.length),
    keepOrder: z.boolean().optional(),
  }),
  layout: z.array(z.array(z.string().max(160)).max(60)).max(120),
});

/**
 * Rebuilds a day plan from item ids. Text always comes from our own catalogue,
 * so a crafted link can reorder a trip but can't put words on the page.
 */
export function applyLayout(days: TripDay[], layout: string[][]): TripDay[] {
  const pool = new Map(days.flatMap((day) => day.items).map((item) => [item.id, item]));
  return days.map((day, index) => ({
    ...day,
    items: (layout[index] ?? []).flatMap((id) => {
      const item = pool.get(id);
      if (!item) return [];
      pool.delete(id);
      return [item];
    }),
  }));
}

export function encodeShared(input: TripInput, days: TripDay[]): string {
  // Coordinates are left out; the start point is looked up by name when the link is opened.
  const shared: Partial<TripInput> = { ...input };
  delete shared.start;
  return encodeTrip({ input: shared, layout: days.map((day) => day.items.map((item) => item.id)) });
}

export function decodeShared(encoded: string, catalogue: Destination[]): { trip: Itinerary; days: TripDay[] } | null {
  if (encoded.length > MAX_ENCODED_LENGTH) return null;
  const parsed = sharedSchema.safeParse(decodeTrip<unknown>(encoded));
  if (!parsed.success) return null;
  const { input, layout } = parsed.data;
  if (!input.destinationSlugs.every((slug) => catalogue.some((item) => item.slug === slug))) return null;
  const city = startCities.find(({ name }) => name === input.startName);
  if (!city) return null;
  const trip = generateItinerary({ ...input, start: city.point }, catalogue);
  return { trip, days: applyLayout(trip.days, layout) };
}

/** The fragment is never sent to a server, so trip details stay out of request logs. */
export function shareHash(input: TripInput, days: TripDay[]): string {
  return `trip=${encodeShared(input, days)}`;
}
