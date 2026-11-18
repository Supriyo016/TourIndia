import { hasAnalyticsConsent } from "@/lib/consent";
import { cleanQuery, countedPath, referrerHost } from "@/features/analytics/shared";
import { ANALYTICS_EVENT, type QueuedEvent } from "./track";

/**
 * The analytics beacon. Loaded only after the page is idle and only with analytics consent.
 * It sets no cookies and uses no storage: everything below lives in memory for this tab and
 * is gone on reload. Batches go out with navigator.sendBeacon.
 */

type Outgoing =
  | { t: "view"; p: string; e?: true; r?: string; from?: string }
  | QueuedEvent
  | { t: "vital"; n: "LCP" | "INP" | "CLS"; v: number; p: string };

const ENDPOINT = "/api/collect";
const queue: Outgoing[] = [];
let started = false;
let timer = 0;
let views = 0;
let entry = "";
let last = "";

function send(events: Outgoing[]) {
  const body = JSON.stringify({ events });
  // text/plain keeps sendBeacon a simple request in every browser; the server accepts it.
  const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
  if (navigator.sendBeacon?.(ENDPOINT, blob)) return;
  void fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain;charset=UTF-8" } }).catch(() => {});
}

function flush() {
  window.clearTimeout(timer);
  timer = 0;
  drainFeatureEvents();
  if (!hasAnalyticsConsent()) {
    queue.length = 0;
    return;
  }
  while (queue.length) send(queue.splice(0, 20));
}

function schedule() {
  if (!timer) timer = window.setTimeout(flush, 3000);
}

function drainFeatureEvents() {
  const waiting = window.__tiAnalytics?.splice(0) ?? [];
  for (const event of waiting) {
    const p = countedPath(event.p);
    if (!p) continue;
    if (event.n === "search") {
      const q = event.q ? cleanQuery(event.q) : null;
      if (!q) continue;
      queue.push({ ...event, p, q });
    } else queue.push({ ...event, p });
  }
}

/** Records a page view. The first page of a visit carries the referring site; the second says where the visit started. */
export function view(location: string) {
  const p = countedPath(location);
  if (!p || p === last) return;
  last = p;
  views += 1;
  if (views === 1) {
    entry = p;
    const r = referrerHost(document.referrer, window.location.hostname);
    queue.push({ t: "view", p, e: true, ...(r ? { r } : {}) });
  } else if (views === 2) queue.push({ t: "view", p, from: entry });
  else queue.push({ t: "view", p });
  schedule();
}

// ---- Core Web Vitals, measured with the browser's own performance entries ----

let lcp = -1;
let cls = 0;
const interactions = new Map<number, number>();

function observe(type: string, callback: (entries: PerformanceEntry[]) => void, options: Record<string, unknown> = {}) {
  try {
    if (!PerformanceObserver.supportedEntryTypes?.includes(type)) return;
    new PerformanceObserver((list) => callback(list.getEntries())).observe({ type, buffered: true, ...options } as PerformanceObserverInit);
  } catch {
    // Older browsers: no measurement.
  }
}

function watchVitals() {
  const startedHidden = document.visibilityState === "hidden";
  if (!startedHidden) observe("largest-contentful-paint", (entries) => entries.forEach((entry) => (lcp = entry.startTime)));

  // Layout shifts are grouped into windows (gaps under 1 s, at most 5 s); CLS is the worst window.
  let windowValue = 0;
  let windowStart = 0;
  let previous = 0;
  observe("layout-shift", (entries) => {
    for (const entry of entries as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
      if (entry.hadRecentInput) continue;
      if (windowValue && entry.startTime - previous < 1000 && entry.startTime - windowStart < 5000) windowValue += entry.value;
      else {
        windowValue = entry.value;
        windowStart = entry.startTime;
      }
      previous = entry.startTime;
      cls = Math.max(cls, windowValue);
    }
  });

  observe(
    "event",
    (entries) => {
      for (const entry of entries as (PerformanceEntry & { interactionId?: number })[]) {
        if (!entry.interactionId || interactions.size > 500) continue;
        interactions.set(entry.interactionId, Math.max(interactions.get(entry.interactionId) ?? 0, entry.duration));
      }
    },
    { durationThreshold: 40 },
  );
}

let reported = false;
function reportVitals() {
  if (reported || !entry) return;
  reported = true;
  if (lcp >= 0) queue.push({ t: "vital", n: "LCP", v: Math.round(lcp), p: entry });
  queue.push({ t: "vital", n: "CLS", v: Math.round(cls * 1000) / 1000, p: entry });
  // INP: the slowest interaction, ignoring one outlier for every 50 interactions.
  const durations = [...interactions.values()].sort((a, b) => b - a);
  if (durations.length) queue.push({ t: "vital", n: "INP", v: Math.round(durations[Math.min(durations.length - 1, Math.floor(durations.length / 50))]!), p: entry });
}

/** Starts the beacon once per tab. Safe to call again. */
export function start() {
  if (started) return;
  started = true;
  watchVitals();
  window.addEventListener(ANALYTICS_EVENT, schedule);
  const leave = () => {
    if (document.visibilityState === "hidden") {
      reportVitals();
      flush();
    }
  };
  document.addEventListener("visibilitychange", leave);
  window.addEventListener("pagehide", () => {
    reportVitals();
    flush();
  });
  if (window.__tiAnalytics?.length) schedule();
}
