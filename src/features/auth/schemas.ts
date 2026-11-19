import "@/lib/zod-config";
import { z } from "zod";
import { STATE_NAMES } from "@/data/state-names";

export const INTERESTS = ["Heritage", "Nature", "Mountains", "Beaches", "Food", "Festivals", "Spiritual", "Wildlife", "Adventure", "Art and craft", "Photography", "Road trips"] as const;
export const TRAVEL_STYLES = ["Budget", "Comfort", "Luxury", "Backpacking", "Family", "Solo", "Couple", "Group"] as const;
export const LANGUAGES = ["English", "हिन्दी", "বাংলা", "தமிழ்", "తెలుగు", "मराठी", "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ", "ଓଡ଼ିଆ", "অসমীয়া", "اردو"] as const;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email("Enter a valid email address.");

export const requestCodeSchema = z.object({ email, purpose: z.enum(["login", "admin"]).default("login") }).strict();

export const verifyCodeSchema = z
  .object({
    email,
    code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
    purpose: z.enum(["login", "admin"]).default("login"),
  })
  .strict();

const stateNames = new Set<string>(STATE_NAMES);

/** Only what the site uses: a name to show, and preferences that tailor suggestions. */
export const profileSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name.").max(60).regex(/^[\p{L}\p{M} .'-]+$/u, "Use letters only in your name."),
    country: z.string().trim().min(2).max(56),
    homeState: z
      .string()
      .trim()
      .max(60)
      .refine((value) => value === "" || stateNames.has(value), "Choose a state or Union Territory.")
      .optional(),
    interests: z.array(z.enum(INTERESTS)).max(INTERESTS.length).default([]),
    travelStyle: z.enum(TRAVEL_STYLES).optional(),
    language: z.enum(LANGUAGES).optional(),
    marketingConsent: z.boolean().default(false),
  })
  .strict();

export type ProfileInput = z.infer<typeof profileSchema>;
