"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { hasAnalyticsConsent, subscribeToConsent } from "@/lib/consent";

const loadBeacon = () => import("@/lib/analytics/beacon");

/** Waits for the page to finish loading and the browser to be idle, so measuring never slows the page. */
function whenIdle(task: () => void): () => void {
  let cancelled = false;
  let handle = 0;
  const run = () => !cancelled && task();
  const schedule = () => {
    if (cancelled) return;
    if (typeof window.requestIdleCallback === "function") handle = window.requestIdleCallback(run, { timeout: 4000 });
    else handle = window.setTimeout(run, 2000);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
}

/**
 * Loads the analytics beacon only when the visitor has allowed analytics, and tells it about each
 * page. Renders nothing; without consent no beacon code is even downloaded.
 */
export function AnalyticsBeacon() {
  const pathname = usePathname();
  const allowed = useSyncExternalStore(subscribeToConsent, hasAnalyticsConsent, () => false);

  useEffect(() => {
    if (!allowed) return;
    return whenIdle(() => {
      void loadBeacon().then((beacon) => {
        if (!hasAnalyticsConsent()) return;
        beacon.start();
        beacon.view(window.location.pathname);
      });
    });
  }, [allowed, pathname]);

  return null;
}
