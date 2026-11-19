import "@/lib/zod-config";
import { z } from "zod";

export const BOOKING_KINDS = {
  stay: "A place to stay",
  tour: "A guided tour or local guide",
  transport: "A car, cab or transfer",
  package: "A full trip, planned for me",
} as const;
export type BookingKind = keyof typeof BOOKING_KINDS;

export const BUDGET_TIERS = { budget: "Budget", midRange: "Mid-range", comfort: "Comfort" } as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.");

/** A request, not a booking: nothing is reserved or paid for. */
export const bookingSchema = z
  .object({
    kind: z.enum(Object.keys(BOOKING_KINDS) as [BookingKind]),
    destination: z.string().regex(/^[a-z0-9-]{1,80}$/, "Choose a destination."),
    checkIn: isoDate,
    checkOut: isoDate,
    flexibleDates: z.boolean(),
    adults: z.number().int().min(1).max(30),
    children: z.number().int().min(0).max(20),
    rooms: z.number().int().min(1).max(15),
    tier: z.enum(["budget", "midRange", "comfort"]),
    stepFree: z.boolean(),
    phone: z
      .string()
      .trim()
      .regex(/^(\+?\d[\d\s-]{7,15})?$/, "Enter a phone number with digits only, or leave it empty.")
      .default(""),
    notes: z.string().trim().max(1000, "Keep notes under 1,000 characters.").default(""),
  })
  .strict()
  .refine((value) => value.checkOut > value.checkIn, { message: "The end date must be after the start date.", path: ["checkOut"] })
  .refine((value) => (Date.parse(value.checkOut) - Date.parse(value.checkIn)) / 86_400_000 <= 60, { message: "Requests can cover up to 60 nights.", path: ["checkOut"] });

export type BookingInput = z.infer<typeof bookingSchema>;

export const nightsBetween = (checkIn: string, checkOut: string) => Math.max(0, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000));

/** An editorial estimate from the guide's daily figures: rooms are shared two to a room, children count as half. */
export function estimateBooking(input: Pick<BookingInput, "checkIn" | "checkOut" | "adults" | "children" | "tier">, perDay: { min: number; max: number }) {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const people = input.adults + input.children * 0.5;
  return { nights, min: Math.round(perDay.min * people * Math.max(nights, 1)), max: Math.round(perDay.max * people * Math.max(nights, 1)) };
}
