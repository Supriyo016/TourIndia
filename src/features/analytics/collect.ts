import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { STORE_COLLECTIONS, type Doc, type Store } from "@/lib/database/store";
import type { BeaconEvent } from "./schema";
import { cleanQuery, countedPath, rateVital, referrerHost, type Vital } from "./shared";

/**
 * Records beacon events. What is kept, and nothing more:
 * - raw events (path, event name, referrer host, device class, browser family, country, Indian
 *   state, search words and result count, a speed measurement), deleted after 90 days;
 * - daily totals per page, referrer, country, state, device, browser, event, search and journey,
 *   kept for trends;
 * - Core Web Vitals per day, metric and page in `web_vitals` (the shape the Health page reads);
 * - for counting unique visitors, a hash of the address and browser made with a key that changes
 *   every day, held for two days in its own collection and never stored with the events.
 * No IP address, user agent string, cookie or account id is stored anywhere.
 */

export const RAW_EVENT_DAYS = 90;
const DAY_MS = 86_400_000;
const IST_OFFSET_MS = 330 * 60_000;

/** Days run on India time, so a day's figures match the owner's calendar. */
export const dayOf = (date: Date) => new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
/** Web Vitals days are UTC, as the monitoring Health page expects. */
export const utcDayOf = (date: Date) => date.toISOString().slice(0, 10);

export interface Visitor {
  device: "mobile" | "tablet" | "desktop";
  browser: string;
  country?: string;
  state?: string;
}

const BOT = /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|chrome-lighthouse|gtmetrix|preview|facebookexternalhit|embedly|curl|wget|python|axios|node-fetch|undici|go-http|java\/|okhttp|httpclient|phantom|selenium|puppeteer|playwright|scrapy|monitor|uptime/i;

export const isBot = (userAgent: string) => !userAgent || userAgent.length < 20 || BOT.test(userAgent);

export function deviceClass(userAgent: string, mobileHint?: string | null): Visitor["device"] {
  if (/iPad|Tablet|PlayBook|Silk|Kindle/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))) return "tablet";
  if (mobileHint === "?1" || /Mobi|iPhone|iPod|Android|Opera Mini|IEMobile/i.test(userAgent)) return "mobile";
  return "desktop";
}

export function browserFamily(userAgent: string): string {
  if (/Edg(A|iOS)?\//.test(userAgent)) return "Edge";
  if (/OPR\/|Opera/.test(userAgent)) return "Opera";
  if (/SamsungBrowser\//.test(userAgent)) return "Samsung Internet";
  if (/UCBrowser\//.test(userAgent)) return "UC Browser";
  if (/Firefox\/|FxiOS\//.test(userAgent)) return "Firefox";
  if (/Chrome\/|CriOS\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent) && /Version\//.test(userAgent)) return "Safari";
  return "Other";
}

/** ISO 3166-2:IN subdivision codes, as Vercel sends them in x-vercel-ip-country-region. Older and newer codes both listed. */
const INDIAN_STATES: Record<string, string> = {
  AN: "Andaman and Nicobar Islands", AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam", BR: "Bihar", CH: "Chandigarh",
  CT: "Chhattisgarh", CG: "Chhattisgarh", DH: "Dadra and Nagar Haveli and Daman and Diu", DN: "Dadra and Nagar Haveli and Daman and Diu",
  DD: "Dadra and Nagar Haveli and Daman and Diu", DL: "Delhi", GA: "Goa", GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh",
  JK: "Jammu and Kashmir", JH: "Jharkhand", KA: "Karnataka", KL: "Kerala", LA: "Ladakh", LD: "Lakshadweep", MP: "Madhya Pradesh",
  MH: "Maharashtra", MN: "Manipur", ML: "Meghalaya", MZ: "Mizoram", NL: "Nagaland", OR: "Odisha", OD: "Odisha", PY: "Puducherry",
  PB: "Punjab", RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu", TG: "Telangana", TS: "Telangana", TR: "Tripura",
  UP: "Uttar Pradesh", UT: "Uttarakhand", UK: "Uttarakhand", WB: "West Bengal",
};

/**
 * Country and Indian state from Vercel's edge headers. Only trusted on Vercel, which sets them;
 * elsewhere a client could send anything, so nothing is recorded.
 */
export function geography(headers: Headers, trusted = Boolean(process.env.VERCEL)): Pick<Visitor, "country" | "state"> {
  if (!trusted) return {};
  const country = headers.get("x-vercel-ip-country")?.toUpperCase();
  if (!country || !/^[A-Z]{2}$/.test(country)) return {};
  const region = headers.get("x-vercel-ip-country-region")?.toUpperCase() ?? "";
  const state = country === "IN" ? INDIAN_STATES[region] : undefined;
  return state ? { country, state } : { country };
}

export function describeVisitor(headers: Headers, trustedGeo?: boolean): Visitor | null {
  const userAgent = headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return null;
  const purpose = `${headers.get("sec-purpose") ?? ""} ${headers.get("purpose") ?? ""}`;
  if (/prefetch|prerender/i.test(purpose)) return null;
  return { device: deviceClass(userAgent, headers.get("sec-ch-ua-mobile")), browser: browserFamily(userAgent), ...geography(headers, trustedGeo) };
}

const secret = () => process.env.RATE_LIMIT_SALT || "tour-india-dev-analytics";

/**
 * A visitor's hash for one day. The key is derived from the secret and the date, so the same
 * person gets an unrelated hash tomorrow, and the hash alone can't be turned back into anything.
 */
export function visitorHash(address: string, userAgent: string, day: string): string {
  const dailyKey = createHmac("sha256", secret()).update(`analytics-salt:${day}`).digest();
  return createHmac("sha256", dailyKey).update(`${address}\n${userAgent}`).digest("hex").slice(0, 32);
}

export interface RawEvent extends Doc {
  at: Date;
  day: string;
  type: "view" | "event" | "vital";
  path: string;
  name?: string;
  variant?: string;
  referrer?: string;
  from?: string;
  query?: string;
  results?: number;
  value?: number;
  rating?: "good" | "ni" | "poor";
  device: Visitor["device"];
  browser: string;
  country?: string;
  state?: string;
  expiresAt: Date;
}

/** One running total: `_id` is `day|dimension|key`. */
export interface DailyTotal extends Doc {
  day: string;
  dim: string;
  key: string;
  count: number;
  zero?: number;
  sum?: number;
  good?: number;
  ni?: number;
  poor?: number;
}

export const DIMENSIONS = ["views", "visitors", "page", "entry", "referrer", "country", "state", "device", "browser", "event", "search", "journey"] as const;
export type Dimension = (typeof DIMENSIONS)[number];

/** One day's samples of one metric on one page. `_id` is `day:metric:path`. */
export interface WebVitalTotal extends Doc {
  day: string;
  metric: Vital;
  path: string;
  count: number;
  good: number;
  needsImprovement: number;
  poor: number;
  /** Sum of the values, for averages (milliseconds; CLS unitless). */
  sum: number;
}

const RATING_FIELD = { good: "good", ni: "needsImprovement", poor: "poor" } as const;

type Increment = { dim: Dimension; key: string; inc: Record<string, number> };
type VitalIncrement = { metric: Vital; path: string; inc: Record<string, number> };

/** Turns checked beacon events into raw records and the totals they add to. Pure, so it can be tested on its own. */
export function plan(events: BeaconEvent[], visitor: Visitor, now: Date, ownHost?: string): { raw: RawEvent[]; increments: Increment[]; vitals: VitalIncrement[] } {
  const day = dayOf(now);
  const expiresAt = new Date(now.getTime() + RAW_EVENT_DAYS * DAY_MS);
  const raw: RawEvent[] = [];
  const increments: Increment[] = [];
  const vitals: VitalIncrement[] = [];
  const base = { at: now, day, device: visitor.device, browser: visitor.browser, expiresAt, ...(visitor.country ? { country: visitor.country } : {}), ...(visitor.state ? { state: visitor.state } : {}) };
  const add = (dim: Dimension, key: string, inc: Record<string, number> = { count: 1 }) => increments.push({ dim, key: key.slice(0, 140), inc });

  for (const event of events) {
    const path = countedPath(event.p);
    if (!path) continue;
    if (event.t === "view") {
      const referrer = event.e && event.r ? referrerHost(`https://${event.r}`, ownHost) : null;
      const from = event.from ? countedPath(event.from) : null;
      raw.push({ _id: randomUUID(), ...base, type: "view", path, ...(referrer ? { referrer } : {}), ...(from ? { from } : {}) });
      add("views", "all");
      add("page", path);
      add("device", visitor.device);
      add("browser", visitor.browser);
      add("country", visitor.country ?? "unknown");
      if (visitor.state) add("state", visitor.state);
      if (from && from !== path) add("journey", `${from} → ${path}`);
      if (event.e) {
        add("entry", path);
        add("referrer", referrer ?? "(direct or not shared)");
      }
    } else if (event.t === "event") {
      const query = event.n === "search" && event.q ? cleanQuery(event.q) : null;
      if (event.n === "search" && !query) continue;
      const results = event.n === "search" ? (event.c ?? 0) : undefined;
      raw.push({ _id: randomUUID(), ...base, type: "event", path, name: event.n, ...(event.k ? { variant: event.k } : {}), ...(query ? { query, results } : {}) });
      add("event", event.n);
      if (event.k) add("event", `${event.n}:${event.k}`);
      if (query) add("search", query, { count: 1, zero: results === 0 ? 1 : 0 });
    } else {
      const rating = rateVital(event.n as Vital, event.v);
      const value = event.n === "CLS" ? Math.round(event.v * 1000) / 1000 : Math.round(event.v);
      raw.push({ _id: randomUUID(), ...base, type: "vital", path, name: event.n, value, rating });
      vitals.push({ metric: event.n as Vital, path, inc: { count: 1, sum: value, [RATING_FIELD[rating]]: 1 } });
    }
  }
  return { raw, increments, vitals };
}

/** Writes the records and totals. Unique visitors are counted once per day, on their first page view. */
export async function record(store: Store, events: BeaconEvent[], visitor: Visitor, identity: { address: string; userAgent: string }, now = new Date(), ownHost?: string): Promise<number> {
  const { raw, increments, vitals } = plan(events, visitor, now, ownHost);
  if (!raw.length) return 0;
  const day = dayOf(now);
  const daily = store.collection<DailyTotal>(STORE_COLLECTIONS.analyticsDaily);

  if (raw.some((event) => event.type === "view")) {
    const hash = visitorHash(identity.address, identity.userAgent, day);
    const seen = await store
      .collection(STORE_COLLECTIONS.analyticsVisitors)
      .findOneAndUpdate({ _id: `${day}|${hash}` }, { $setOnInsert: { day, expiresAt: new Date(now.getTime() + 2 * DAY_MS) } }, { upsert: true, returnDocument: "before" });
    if (!seen) increments.push({ dim: "visitors", key: "all", inc: { count: 1 } });
  }

  // Several identical increments in one batch become one write.
  const merged = new Map<string, Increment>();
  for (const item of increments) {
    const id = `${day}|${item.dim}|${item.key}`;
    const existing = merged.get(id);
    if (!existing) merged.set(id, { ...item, inc: { ...item.inc } });
    else for (const [field, amount] of Object.entries(item.inc)) existing.inc[field] = (existing.inc[field] ?? 0) + amount;
  }

  const events_ = store.collection<RawEvent>(STORE_COLLECTIONS.analyticsEvents);
  const webVitals = store.collection<WebVitalTotal>(STORE_COLLECTIONS.webVitals);
  const utcDay = utcDayOf(now);
  await Promise.all([
    ...vitals.map((item) =>
      webVitals.updateOne(
        { _id: `${utcDay}:${item.metric}:${item.path}` },
        { $inc: { good: 0, needsImprovement: 0, poor: 0, ...item.inc }, $setOnInsert: { day: utcDay, metric: item.metric, path: item.path } },
        { upsert: true },
      ),
    ),
    ...raw.map((event) => events_.insertOne(event)),
    ...[...merged].map(([id, item]) => daily.updateOne({ _id: id }, { $inc: item.inc, $setOnInsert: { day, dim: item.dim, key: item.key } }, { upsert: true })),
  ]);
  return raw.length;
}
