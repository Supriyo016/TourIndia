import "server-only";
import { getStore, STORE_COLLECTIONS, type Store } from "@/lib/database/store";
import { dayOf, utcDayOf, type DailyTotal, type WebVitalTotal } from "./collect";
import { VITALS, type Vital } from "./shared";

/** The dashboard's figures, read from the daily totals. Every number here was recorded; nothing is estimated. */

export const RANGES = [7, 30, 90, 365] as const;
export type Range = (typeof RANGES)[number];
export const parseRange = (value: unknown): Range => (RANGES.includes(Number(value) as Range) ? (Number(value) as Range) : 30);

export interface Ranked {
  key: string;
  count: number;
}

export interface VitalSummary {
  name: Vital;
  label: string;
  count: number;
  average: number;
  good: number;
  ni: number;
  poor: number;
  pages: { path: string; count: number; average: number; good: number; poor: number }[];
}

export interface AnalyticsReport {
  available: boolean;
  range: Range;
  from: string;
  to: string;
  /** The first day anything was recorded, across all time. */
  firstDay: string | null;
  days: { day: string; views: number; visitors: number }[];
  totals: { views: number; visitorDays: number; events: number; searches: number; zeroSearches: number };
  pages: Ranked[];
  entries: Ranked[];
  referrers: Ranked[];
  countries: Ranked[];
  states: Ranked[];
  devices: Ranked[];
  browsers: Ranked[];
  events: Ranked[];
  searches: (Ranked & { zero: number })[];
  zeroSearches: Ranked[];
  journeys: Ranked[];
  vitals: VitalSummary[];
}

const DAY_MS = 86_400_000;

export function rangeDays(range: Range, now = new Date()): string[] {
  return Array.from({ length: range }, (_, index) => dayOf(new Date(now.getTime() - (range - 1 - index) * DAY_MS)));
}

const top = (map: Map<string, number>, limit = 25): Ranked[] =>
  [...map].map(([key, count]) => ({ key, count })).filter((item) => item.count > 0).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)).slice(0, limit);

const bump = (map: Map<string, number>, key: string, amount: number) => map.set(key, (map.get(key) ?? 0) + amount);

/** Web Vitals are kept by UTC day; this is the same span of days on that calendar. */
export function utcRange(range: Range, now = new Date()): [from: string, to: string] {
  return [utcDayOf(new Date(now.getTime() - (range - 1) * DAY_MS)), utcDayOf(now)];
}

/** Adds the daily totals up for a range. Pure, so the sums can be tested directly. */
export function summarise(rows: DailyTotal[], range: Range, now = new Date(), firstDay: string | null = null, vitalRows: WebVitalTotal[] = []): AnalyticsReport {
  const days = rangeDays(range, now);
  const from = days[0]!;
  const to = days[days.length - 1]!;
  const perDay = new Map(days.map((day) => [day, { day, views: 0, visitors: 0 }]));
  const by: Record<string, Map<string, number>> = {};
  const zero = new Map<string, number>();
  const vitals = new Map<string, { count: number; sum: number; good: number; ni: number; poor: number }>();
  const totals = { views: 0, visitorDays: 0, events: 0, searches: 0, zeroSearches: 0 };

  for (const row of rows) {
    if (row.day < from || row.day > to) continue;
    const count = Number(row.count) || 0;
    if (row.dim === "views") {
      perDay.get(row.day)!.views += count;
      totals.views += count;
    } else if (row.dim === "visitors") {
      perDay.get(row.day)!.visitors += count;
      totals.visitorDays += count;
    } else {
      bump((by[row.dim] ??= new Map()), row.key, count);
      if (row.dim === "search") {
        totals.searches += count;
        const zeros = Number(row.zero) || 0;
        totals.zeroSearches += zeros;
        bump(zero, row.key, zeros);
      }
      if (row.dim === "event" && !row.key.includes(":")) totals.events += count;
    }
  }

  const [vitalFrom, vitalTo] = utcRange(range, now);
  for (const row of vitalRows) {
    if (row.day < vitalFrom || row.day > vitalTo) continue;
    const key = `${row.metric}|${row.path}`;
    const current = vitals.get(key) ?? { count: 0, sum: 0, good: 0, ni: 0, poor: 0 };
    current.count += Number(row.count) || 0;
    current.sum += Number(row.sum) || 0;
    current.good += Number(row.good) || 0;
    current.ni += Number(row.needsImprovement) || 0;
    current.poor += Number(row.poor) || 0;
    vitals.set(key, current);
  }

  const get = (dim: string) => by[dim] ?? new Map<string, number>();
  const vitalSummaries: VitalSummary[] = (Object.keys(VITALS) as Vital[]).map((name) => {
    const pages = [...vitals]
      .filter(([key]) => key.startsWith(`${name}|`))
      .map(([key, value]) => ({ path: key.slice(name.length + 1), ...value }));
    const sum = pages.reduce((total, page) => ({ count: total.count + page.count, sum: total.sum + page.sum, good: total.good + page.good, ni: total.ni + page.ni, poor: total.poor + page.poor }), { count: 0, sum: 0, good: 0, ni: 0, poor: 0 });
    const average = (value: { count: number; sum: number }) => (value.count ? Math.round((value.sum / value.count) * (name === "CLS" ? 1000 : 1)) / (name === "CLS" ? 1000 : 1) : 0);
    return {
      name,
      label: VITALS[name],
      count: sum.count,
      average: average(sum),
      good: sum.good,
      ni: sum.ni,
      poor: sum.poor,
      pages: pages
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
        .map((page) => ({ path: page.path, count: page.count, average: average(page), good: page.good, poor: page.poor })),
    };
  });

  const searches = top(get("search"), 30).map((item) => ({ ...item, zero: zero.get(item.key) ?? 0 }));
  return {
    available: true,
    range,
    from,
    to,
    firstDay,
    days: [...perDay.values()],
    totals,
    pages: top(get("page")),
    entries: top(get("entry")),
    referrers: top(get("referrer")),
    countries: top(get("country")),
    states: top(get("state"), 40),
    devices: top(get("device")),
    browsers: top(get("browser")),
    events: top(get("event"), 40),
    searches,
    zeroSearches: top(zero, 30),
    journeys: top(get("journey")),
    vitals: vitalSummaries,
  };
}

export async function readTotals(store: Store, from: string, to: string): Promise<DailyTotal[]> {
  return store.collection<DailyTotal>(STORE_COLLECTIONS.analyticsDaily).find({ day: { $gte: from, $lte: to } }, { limit: 200_000 }).toArray();
}

// Every matching row: totals and averages must not be cut short. Rows are one per day, metric and page.
export async function readVitals(store: Store, range: Range, now = new Date()): Promise<WebVitalTotal[]> {
  const [from, to] = utcRange(range, now);
  return store.collection<WebVitalTotal>(STORE_COLLECTIONS.webVitals).find({ day: { $gte: from, $lte: to } }).toArray();
}

export async function firstRecordedDay(store: Store): Promise<string | null> {
  const [first] = await store.collection<DailyTotal>(STORE_COLLECTIONS.analyticsDaily).find({ dim: "views" }, { sort: { day: 1 }, limit: 1 }).toArray();
  return first?.day ?? null;
}

export async function loadReport(range: Range, now = new Date()): Promise<AnalyticsReport> {
  const store = await getStore();
  const days = rangeDays(range, now);
  if (!store) return { ...summarise([], range, now), available: false };
  const [rows, firstDay, vitals] = await Promise.all([readTotals(store, days[0]!, days[days.length - 1]!), firstRecordedDay(store), readVitals(store, range, now)]);
  return summarise(rows, range, now, firstDay, vitals);
}

/** Cells that start like a formula are prefixed, so a spreadsheet never runs them. */
const cell = (value: string | number) => {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Web Vitals totals as rows of the same table (dimension "vital", key "<metric> <path>"). */
export const vitalsAsTotals = (rows: WebVitalTotal[]): DailyTotal[] =>
  rows.map((row) => ({ _id: row._id, day: row.day, dim: "vital", key: `${row.metric} ${row.path}`, count: row.count, sum: Math.round(Number(row.sum) * 1000) / 1000, good: row.good, ni: row.needsImprovement, poor: row.poor }));

/** Every daily total in the range, one row each, oldest first. */
export function totalsCsv(rows: DailyTotal[]): string {
  const header = ["day", "dimension", "key", "count", "zero_results", "sum", "good", "needs_improvement", "poor"];
  const lines = [...rows]
    .sort((a, b) => a.day.localeCompare(b.day) || a.dim.localeCompare(b.dim) || b.count - a.count || a.key.localeCompare(b.key))
    .map((row) => [row.day, row.dim, row.key, row.count, row.zero ?? "", row.sum ?? "", row.good ?? "", row.ni ?? "", row.poor ?? ""].map(cell).join(","));
  return [header.join(","), ...lines].join("\r\n") + "\r\n";
}
