import "@/lib/zod-config";
import { z } from "zod";

/**
 * A travel memory: words, a date, a place from the guide, tags, and up to six photos picked from
 * the site's own licensed gallery. Nothing is uploaded (owner decision), so a memory never holds
 * a file, only the key of an image the site already credits.
 */

export const MEMORY_LIMIT = 200;
export const PHOTO_LIMIT = 6;
export const TAG_LIMIT = 10;

/** "place:<destination slug>" or "state:<state slug>", or empty for no place. */
export const PLACE_RE = /^(?:place|state):[a-z0-9-]{1,60}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TAG_RE = /^[\p{L}\p{N}][\p{L}\p{N} '&-]{0,29}$/u;

export const tagSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => value.replace(/\s+/g, " "))
  .pipe(z.string().regex(TAG_RE, "Tags are short words, up to 30 letters or numbers."));

const dateSchema = z
  .string()
  .regex(DATE_RE, "Choose the date it happened.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
    // A day's grace for time zones; memories are of things that have happened.
    return value >= "1950-01-01" && date.getTime() <= Date.now() + 36 * 3600 * 1000;
  }, "Choose a date between 1950 and today.");

export const memoryInputSchema = z
  .object({
    title: z.string().trim().min(1, "Give the memory a title.").max(100, "Keep the title under 100 characters."),
    body: z.string().trim().max(4000, "Keep it under 4,000 characters.").default(""),
    date: dateSchema,
    place: z.union([z.literal(""), z.string().regex(PLACE_RE, "Choose a place from the list.")]).default(""),
    tags: z
      .array(tagSchema)
      .max(TAG_LIMIT, `Use up to ${TAG_LIMIT} tags.`)
      .default([])
      .transform((tags) => [...new Set(tags)]),
    photos: z
      .array(z.string().min(3).max(120))
      .max(PHOTO_LIMIT, `Choose up to ${PHOTO_LIMIT} photos.`)
      .default([])
      .transform((photos) => [...new Set(photos)]),
  })
  .strict();
export type MemoryInput = z.infer<typeof memoryInputSchema>;

export interface MemoryView {
  id: string;
  title: string;
  body: string;
  date: string;
  place: string;
  placeName: string | null;
  tags: string[];
  photos: string[];
  shareId: string | null;
  updatedAt: string;
}

/** Splits "a, b, c" typed into the tag box into a list. */
export const splitTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
