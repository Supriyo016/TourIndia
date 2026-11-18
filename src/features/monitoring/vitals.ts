import "server-only";
import { getStore, type Doc } from "@/lib/database/store";

/**
 * Core Web Vitals for the health page, read from the `web_vitals` daily aggregates that the
 * analytics beacon (Phase 6) writes. This module only reads. The shape it expects, one document
 * per day per metric (or per day, metric and path; site-wide rows win when both exist):
 *
 *   { _id, day: "YYYY-MM-DD", metric: "LCP" | "INP" | "CLS" | "FCP" | "TTFB", path?,
 *     count, good, needsImprovement, poor, p75? }
 *
 * With no collection or no rows, the page says so instead of showing numbers.
 */

export const WEB_VITALS_COLLECTION = "web_vitals";
export const METRICS = ["LCP", "INP", "CLS", "FCP", "TTFB"] as const;
export type Metric = (typeof METRICS)[number];

export const METRIC_INFO: Record<Metric, { name: string; unit: "ms" | "" }> = {
  LCP: { name: "Largest contentful paint", unit: "ms" },
  INP: { name: "Interaction to next paint", unit: "ms" },
  CLS: { name: "Cumulative layout shift", unit: "" },
  FCP: { name: "First contentful paint", unit: "ms" },
  TTFB: { name: "Time to first byte", unit: "ms" },
};

interface VitalsDoc extends Doc {
  day: string;
  metric: string;
  path?: string;
  count?: number;
  good?: number;
  needsImprovement?: number;
  poor?: number;
  p75?: number;
}

export interface MetricSummary {
  metric: Metric;
  count: number;
  good: number;
  needsImprovement: number;
  poor: number;
  /** Site-wide p75 (a row without a path) of the most recent day that recorded one, if the beacon records it. */
  p75?: number;
  p75Day?: string;
}

const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0);

export async function vitalsSummary(days = 28, now = new Date()): Promise<{ from: string; metrics: MetricSummary[] } | null> {
  const store = await getStore();
  if (!store) return null;
  const from = new Date(now.getTime() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  const rows = await store.collection<VitalsDoc>(WEB_VITALS_COLLECTION).find({ day: { $gte: from } }, { sort: { day: -1 }, limit: 5000 }).toArray();
  const metrics: MetricSummary[] = [];
  for (const metric of METRICS) {
    const all = rows.filter((row) => row.metric === metric);
    // Site-wide rows when there are any, so per-path rows written alongside them aren't counted twice.
    const own = all.some((row) => !row.path) ? all.filter((row) => !row.path) : all;
    if (!own.length) continue;
    const summary: MetricSummary = { metric, count: 0, good: 0, needsImprovement: 0, poor: 0 };
    for (const row of own) {
      summary.count += num(row.count);
      summary.good += num(row.good);
      summary.needsImprovement += num(row.needsImprovement);
      summary.poor += num(row.poor);
      if (summary.p75 === undefined && !row.path && typeof row.p75 === "number" && Number.isFinite(row.p75)) {
        summary.p75 = row.p75;
        summary.p75Day = row.day;
      }
    }
    if (summary.count > 0) metrics.push(summary);
  }
  return { from, metrics };
}
