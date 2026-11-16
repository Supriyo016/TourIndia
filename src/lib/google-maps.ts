"use client";

/**
 * Loads the Google Maps JavaScript API once, only when a map is about to be shown.
 * The key is public by design (it ships to the browser); restrict it to this site's
 * domains in Google Cloud so nobody else can use it.
 */
export const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
/** A vector Map ID enables tilt, rotation and state shading. */
export const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "DEMO_MAP_ID";
export const hasMapsKey = mapsKey.length > 0;

let loading: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (!hasMapsKey) return Promise.reject(new Error("No Google Maps key"));
  if (typeof window !== "undefined" && "google" in window && window.google.maps) return Promise.resolve(window.google.maps);
  loading ??= new Promise((resolve, reject) => {
    const callback = `__tiMapsReady${Date.now()}`;
    const params = new URLSearchParams({ key: mapsKey, v: "weekly", loading: "async", callback, region: "IN", language: "en" });
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    (window as unknown as Record<string, () => void>)[callback] = () => resolve(window.google.maps);
    script.onerror = () => {
      loading = null;
      reject(new Error("Google Maps failed to load"));
    };
    document.head.append(script);
  });
  return loading;
}

/** Waits until the element is near the viewport before loading, to protect the first paint. */
export function whenNear(element: Element, run: () => void) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      run();
    },
    { rootMargin: "300px" },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
