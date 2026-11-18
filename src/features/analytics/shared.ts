/**
 * Analytics names and rules, shared by the browser beacon and /api/collect. Kept free of
 * server code and of zod, so the beacon stays tiny and applies the same path rules.
 */

export const FEATURE_EVENTS = {
  search: "Searches",
  planner_build: "Trip plans built",
  planner_save: "Trip plans saved",
  save_place: "Places saved (heart)",
  yatri_open: "Yatri opened",
  yatri_ask: "Questions asked to Yatri",
  share_link: "Share links made",
  sign_in: "Sign-ins",
} as const;
export type FeatureEvent = keyof typeof FEATURE_EVENTS;

/** Optional detail for an event, from a short fixed list so nothing free-form slips in. */
export const EVENT_VARIANTS = ["account", "device", "trip", "collection", "planner", "email"] as const;
export type EventVariant = (typeof EVENT_VARIANTS)[number];

export const VITALS = { LCP: "Largest Contentful Paint", INP: "Interaction to Next Paint", CLS: "Cumulative Layout Shift" } as const;
export type Vital = keyof typeof VITALS;

/** Google's published thresholds: at or under the first is good, over the second is poor. */
export const VITAL_THRESHOLDS: Record<Vital, [good: number, poor: number]> = { LCP: [2500, 4000], INP: [200, 500], CLS: [0.1, 0.25] };

export const rateVital = (name: Vital, value: number): "good" | "ni" | "poor" => {
  const [good, poor] = VITAL_THRESHOLDS[name];
  return value <= good ? "good" : value > poor ? "poor" : "ni";
};

/** Pages whose address holds a private link or a person's name are counted under one placeholder. */
const PLACEHOLDERS: [RegExp, string][] = [
  [/^\/t\/[^/]+/, "/t/:link"],
  [/^\/c\/[^/]+/, "/c/:link"],
  [/^\/u\/[^/]+/, "/u/:profile"],
  [/^\/profile\/trips\/[^/]+/, "/profile/trips/:trip"],
];

/**
 * Turns a location into the path that is counted: no query string or fragment, no private
 * links, nothing from the admin area or the API. Returns null for pages that aren't counted.
 */
export function countedPath(raw: string): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return null;
  let path = raw.split(/[?#]/)[0]!;
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (/^\/(admin|api)(\/|$)/.test(path)) return null;
  for (const [pattern, replacement] of PLACEHOLDERS) {
    if (pattern.test(path)) {
      path = path.replace(pattern, replacement);
      break;
    }
  }
  if (path.length > 120 || !/^\/[a-z0-9\-_./:]*$/i.test(path)) return null;
  return path.toLowerCase();
}

/** A referring site's host name, without "www.". Null for this site or anything malformed. */
export function referrerHost(raw: string, ownHost?: string): string | null {
  let host: string;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
  host = host.replace(/^www\./, "");
  if (!host || (ownHost && host === ownHost.toLowerCase().replace(/^www\./, ""))) return null;
  return /^[a-z0-9.-]{1,80}$/.test(host) && host.includes(".") ? host : null;
}

/**
 * Search words are kept so missing guides can be found, but only as plain lowercase words:
 * anything that looks like an email address or a phone number is dropped.
 */
export function cleanQuery(raw: string): string | null {
  const text = raw.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}\p{M} ]+/gu, " ").replace(/\s+/g, " ").trim().slice(0, 60).trim();
  if (text.length < 2) return null;
  // Phone numbers and other long numbers never enter analytics, however they're punctuated (415.555.1234, (022) 2345 6789).
  if (/@/.test(raw) || /\d{5,}/.test(raw.replace(/[^\p{N}]+/gu, (gap) => (gap.length <= 3 && !/\p{L}/u.test(gap) ? "" : " ")))) return null;
  return text;
}
