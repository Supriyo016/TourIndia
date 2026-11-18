import { hasAnalyticsConsent } from "@/lib/consent";
import type { EventVariant, FeatureEvent } from "@/features/analytics/shared";

/**
 * Notes that a feature was used. Costs nothing without analytics consent: the event is dropped
 * on the spot. With consent it waits in a small queue that the beacon (loaded when the browser
 * is idle) sends with the next batch.
 */

export interface QueuedEvent {
  t: "event";
  n: FeatureEvent;
  p: string;
  k?: EventVariant;
  q?: string;
  c?: number;
}

declare global {
  interface Window {
    __tiAnalytics?: QueuedEvent[];
  }
}

export const ANALYTICS_EVENT = "ti:analytics";

export function track(name: FeatureEvent, detail: { k?: EventVariant; q?: string; c?: number } = {}) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const queue = (window.__tiAnalytics ??= []);
  if (queue.length >= 50) return;
  queue.push({ t: "event", n: name, p: window.location.pathname, ...detail });
  window.dispatchEvent(new Event(ANALYTICS_EVENT));
}
