"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Whether a click on this link will start a client-side navigation to another page. */
function isInternalNavigation(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return false;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // Same page with only a different #hash: the browser scrolls and nothing loads.
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

/**
 * A thin bar across the top of the window while a page loads.
 * It starts on any internal link click or Back/Forward, and finishes when the new route renders.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [progress, setProgress] = useState<number | null>(null);
  const trickle = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = () => {
      window.clearInterval(trickle.current);
      setProgress(8);
      // Eases towards 90% and waits there for the route to render.
      trickle.current = window.setInterval(() => setProgress((value) => (value === null || value >= 100 ? value : value + (90 - value) * 0.12)), 180);
    };
    const onClick = (event: MouseEvent) => {
      if (isInternalNavigation(event)) start();
    };
    // Capture phase: runs before next/link calls preventDefault() on the same click.
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", start);
      window.clearInterval(trickle.current);
    };
  }, []);

  // The new route has rendered: finish the bar (adjusting state during render, not in an effect).
  const route = `${pathname}?${search.toString()}`;
  const [lastRoute, setLastRoute] = useState(route);
  if (route !== lastRoute) {
    setLastRoute(route);
    if (progress !== null) setProgress(100);
  }

  useEffect(() => {
    if (progress !== 100) return;
    window.clearInterval(trickle.current);
    const hide = window.setTimeout(() => setProgress(null), 320);
    return () => window.clearTimeout(hide);
  }, [progress]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[1000] h-[3px]"
      style={{ opacity: progress === null || progress === 100 ? 0 : 1, transition: "opacity 300ms ease 120ms" }}
    >
      <div
        data-testid="route-progress"
        data-active={progress !== null && progress < 100}
        className="h-full origin-left bg-[linear-gradient(90deg,var(--rani),var(--accent),var(--brand))] shadow-[0_0_10px_var(--accent)]"
        style={{ transform: `scaleX(${(progress ?? 0) / 100})`, transition: "transform 200ms ease-out" }}
      />
    </div>
  );
}
