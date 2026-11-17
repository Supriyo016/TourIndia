import "server-only";
import { destinations, states } from "@/data";
import { artArticles } from "@/data/arts-encyclopedia";
import { artForms } from "@/data/arts";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { COLLECTIONS } from "@/lib/database/mongo";
import type { Store } from "@/lib/database/store";
import { allImages } from "@/lib/images";
import { hashClient } from "@/lib/security/rate-limit";

/**
 * Configuration status for the admin dashboard. Each check reads only whether a
 * setting is present: no value, key or address ever leaves this file.
 */
type Env = Record<string, string | undefined>;

const has = (env: Env, ...names: string[]) => names.every((name) => Boolean(env[name]?.trim()));

export interface Integration {
  id: string;
  label: string;
  on: boolean;
  hint: string;
}

export function integrationStatus(env: Env = process.env): Integration[] {
  return [
    { id: "database", label: "Database (MongoDB)", on: has(env, "MONGODB_URI"), hint: "MONGODB_URI" },
    { id: "email", label: "Email sending", on: has(env, "RESEND_API_KEY", "EMAIL_FROM"), hint: "RESEND_API_KEY and EMAIL_FROM" },
    { id: "auth", label: "Sign-in secret", on: (env.AUTH_SECRET ?? "").length >= 32, hint: "AUTH_SECRET, 32+ characters" },
    { id: "google", label: "Google sign-in", on: has(env, "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"), hint: "AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET" },
    { id: "groq", label: "Groq (Yatri AI)", on: has(env, "GROQ_API_KEY"), hint: "GROQ_API_KEY" },
    { id: "maps", label: "Google Maps key", on: has(env, "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"), hint: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" },
    { id: "search-console", label: "Search Console verification", on: has(env, "GOOGLE_SITE_VERIFICATION"), hint: "GOOGLE_SITE_VERIFICATION" },
    { id: "salt", label: "Rate-limit salt", on: (env.RATE_LIMIT_SALT ?? "").length >= 32, hint: "RATE_LIMIT_SALT, 32+ characters" },
  ];
}

export interface YatriStatus {
  connected: boolean;
  provider: string | null;
  dailyLimit: number;
  /** null when replies aren't counted anywhere this page can read. */
  repliesToday: number | null;
}

/** Mirrors the provider choice in features/assistant/agent.ts, by name only. */
export const assistantProvider = (env: Env = process.env) =>
  has(env, "GROQ_API_KEY") ? "Groq" : has(env, "AI_GATEWAY_API_KEY") || env.AI_GATEWAY_OIDC === "1" ? "Vercel AI Gateway" : null;

/** Mirrors the daily ceiling in app/api/assistant/route.ts. */
export function assistantDailyLimit(env: Env = process.env) {
  const value = Number(env.ASSISTANT_DAILY_LIMIT ?? 500);
  return Number.isInteger(value) && value > 0 ? value : 500;
}

/**
 * The assistant route counts AI replies in a site-wide daily window of the rate-limit
 * store. That count is kept in MongoDB only; in memory it can't be read from here.
 */
export async function yatriStatus(store: Store | null, { env = process.env, databaseConfigured = has(env, "MONGODB_URI"), now = new Date() }: { env?: Env; databaseConfigured?: boolean; now?: Date } = {}): Promise<YatriStatus> {
  const provider = assistantProvider(env);
  const dailyLimit = assistantDailyLimit(env);
  let repliesToday: number | null = null;
  if (store && databaseConfigured) {
    const window = Math.floor(now.getTime() / 86_400_000);
    const row = await store.collection(COLLECTIONS.rateLimits).findOne({ _id: `assistant-daily:${hashClient("site")}:${window}` });
    repliesToday = Math.min(Number(row?.count) || 0, dailyLimit);
  }
  return { connected: provider !== null, provider, dailyLimit, repliesToday };
}

export function contentCounts() {
  return [
    { label: "Destinations", value: destinations.length },
    { label: "States and UTs", value: states.length },
    { label: "Festivals", value: festivals.length },
    { label: "Dishes", value: foods.length },
    { label: "Art forms", value: artForms.length },
    { label: "Encyclopedia entries", value: Object.keys(artArticles).length },
    { label: "Images", value: allImages().length },
  ];
}

export function siteInfo(env: Env = process.env) {
  const sha = env.VERCEL_GIT_COMMIT_SHA?.trim();
  return {
    environment: env.VERCEL_ENV || env.NODE_ENV || "development",
    commit: sha ? sha.slice(0, 7) : null,
    branch: env.VERCEL_GIT_COMMIT_REF?.trim() || null,
    region: env.VERCEL_REGION?.trim() || null,
    hosted: has(env, "VERCEL") ? "Vercel" : "Self-hosted or local",
  };
}
