"use client";

import { useEffect, useRef, useState } from "react";
import { hasMapsKey, loadGoogleMaps, mapId, prefersReducedMotion, whenNear } from "@/lib/google-maps";
import type { LatLng } from "@/types/content";

/**
 * Google map of one destination and its main sights, tilted for a 3D view.
 * Without an API key it falls back to Google's keyless embed of the place.
 */
export function LocationMap({ center, name, points }: { center: LatLng; name: string; points: { name: string; coordinates: LatLng }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "error">("idle");

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasMapsKey) return;
    let cancelled = false;
    const stop = whenNear(node, () => {
      loadGoogleMaps()
        .then(async (maps) => {
          const [{ Map }, { AdvancedMarkerElement, PinElement }] = await Promise.all([
            maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
            maps.importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
          ]);
          if (cancelled) return;
          const map = new Map(node, {
            center,
            zoom: 12,
            mapId,
            tilt: prefersReducedMotion() ? 0 : 45,
            heading: 0,
            gestureHandling: "cooperative",
            mapTypeControl: false,
            streetViewControl: false,
          });
          const bounds = new maps.LatLngBounds(center);
          const add = (label: string, position: LatLng, main: boolean) => {
            const pin = new PinElement({ background: main ? "#c2277f" : "#14505c", borderColor: "#fff", glyphColor: "#fff", scale: main ? 1.2 : 1 });
            new AdvancedMarkerElement({ map, position, title: label, content: pin.element });
            bounds.extend(position);
          };
          add(name, center, true);
          for (const point of points) add(point.name, point.coordinates, false);
          if (points.length) map.fitBounds(bounds, 40);
        })
        .catch(() => !cancelled && setStatus("error"));
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [center, name, points]);

  if (!hasMapsKey) {
    return (
      <iframe
        title={`Google map of ${name}`}
        src={`https://maps.google.com/maps?q=${center.lat},${center.lng}&z=11&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-80 w-full rounded-[var(--radius-lg)] border border-line sm:h-[26rem]"
      />
    );
  }

  if (status === "error") {
    return <p className="text-ink-2">The map could not load. Check your connection and refresh the page.</p>;
  }

  return <div ref={ref} role="region" aria-label={`Google map of ${name} and its main attractions`} className="relative z-0 h-80 w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface-2 sm:h-[26rem]" />;
}
