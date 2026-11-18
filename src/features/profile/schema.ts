import { z } from "zod";
import { AVATAR_IDS } from "./avatars";
import { COVER_KEYS } from "./covers";

/**
 * The profile beyond the account basics (name, country, home state and interests live on the
 * user record). Everything here is optional, and nothing is public unless the person says so.
 *
 * Deliberately not collected: phone number, date of birth and gender. The site has no feature
 * that needs them, so asking would only create data to protect.
 */

export const USERNAME_RE = /^[a-z0-9](?:[a-z0-9_]{1,18}[a-z0-9])$/;

/** Names that could pass for staff or the site itself. */
const RESERVED = new Set([
  "admin", "admins", "administrator", "root", "system", "staff", "team", "support", "help", "moderator", "mod", "mods",
  "official", "tourindia", "tour_india", "yatri", "security", "privacy", "legal", "abuse", "contact", "account", "profile",
  "settings", "api", "u", "me", "you", "null", "undefined", "anonymous", "former_member", "deleted",
]);

export function usernameProblem(value: string): string | null {
  if (!USERNAME_RE.test(value)) return "Use 3 to 20 lower-case letters, numbers or underscores, starting and ending with a letter or number.";
  if (value.includes("__")) return "Use one underscore at a time.";
  if (RESERVED.has(value) || /^(?:tour_?india|admin|support|official)/.test(value)) return "That name is reserved. Try another.";
  return null;
}

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .superRefine((value, context) => {
    const problem = usernameProblem(value);
    if (problem) context.addIssue({ code: "custom", message: problem });
  });

const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`);

const website = z
  .string()
  .trim()
  .max(120)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname.includes(".") && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Use a full https:// address, like https://example.com.");

export const identitySchema = z
  .object({
    username: usernameSchema,
    avatar: z.enum(AVATAR_IDS),
    cover: z.enum(COVER_KEYS),
    tagline: text(80).default(""),
    bio: text(300).default(""),
    city: text(60).regex(/^[\p{L}\p{M} .,'()-]*$/u, "Use letters only in the city name.").default(""),
    website: website.default(""),
  })
  .strict();
export type IdentityInput = z.infer<typeof identitySchema>;

export const REGIONS = ["North", "South", "East", "West", "Central", "North East", "Islands"] as const;
export const SEASONS = ["Winter", "Summer", "Monsoon", "Spring", "Autumn"] as const;
export const TRIP_LENGTHS = ["A weekend", "Under a week", "One to two weeks", "Longer"] as const;
export const BUDGETS = ["Shoestring", "Moderate", "Comfortable", "Luxury"] as const;
export const TRANSPORT = ["Train", "Flight", "Bus", "Self-drive", "Motorbike", "Cycling"] as const;
export const DIETS = ["Vegetarian", "Vegan", "Jain", "Eggetarian", "Halal", "Gluten-free", "No restrictions"] as const;
export const ACCESS_NEEDS = ["Step-free access", "Fewer stairs", "Rest stops", "Quiet places", "Large text", "Travelling with a child"] as const;

export const preferencesSchema = z
  .object({
    regions: z.array(z.enum(REGIONS)).max(REGIONS.length).default([]),
    seasons: z.array(z.enum(SEASONS)).max(SEASONS.length).default([]),
    tripLength: z.enum(TRIP_LENGTHS).optional(),
    budget: z.enum(BUDGETS).optional(),
    transport: z.array(z.enum(TRANSPORT)).max(TRANSPORT.length).default([]),
    dietary: z.array(z.enum(DIETS)).max(DIETS.length).default([]),
    accessibility: z.array(z.enum(ACCESS_NEEDS)).max(ACCESS_NEEDS.length).default([]),
    /** Off means no suggestions are tailored from any of this. */
    personalise: z.boolean().default(true),
  })
  .strict();
export type Preferences = z.infer<typeof preferencesSchema>;

export const VISIBILITY = ["private", "members", "public"] as const;
export type Visibility = (typeof VISIBILITY)[number];
/** Fields a person can choose to show on their public page. Name, username and avatar always show when the page is visible. */
export const SHOWABLE = ["tagline", "bio", "city", "homeState", "website", "interests", "activity", "joined", "achievements"] as const;
export type Showable = (typeof SHOWABLE)[number];

export const privacySchema = z
  .object({
    visibility: z.enum(VISIBILITY),
    show: z.array(z.enum(SHOWABLE)).max(SHOWABLE.length),
    /** Link comments to the profile page. */
    linkComments: z.boolean(),
  })
  .strict();
export type Privacy = z.infer<typeof privacySchema>;

export const DEFAULT_PRIVACY: Privacy = { visibility: "private", show: ["tagline", "bio", "interests", "joined"], linkComments: false };
export const DEFAULT_PREFERENCES: Preferences = { regions: [], seasons: [], transport: [], dietary: [], accessibility: [], personalise: true };
