"use client";

import { useEffect, useRef } from "react";
import type { TripLeg } from "@/features/itinerary/generate";
import { loadGoogleMaps, mapId, whenNear } from "@/lib/google-maps";

/** The trip's stops on a Google map, numbered in order and joined by a dashed line. */
export function GoogleRouteMap({ legs }: { legs: TripLeg[] }) {
  const node = useRef<HTMLDivElement>(null);
  const key = legs.map((leg) => `${leg.from}>${leg.to}`).join("|");

  useEffect(() => {
    const element = node.current;
    if (!element || legs.length === 0) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const stop = whenNear(element, () => {
      loadGoogleMaps()
        .then(async (maps) => {
          const [{ Map, Polyline }, { AdvancedMarkerElement, PinElement }] = await Promise.all([
            maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
            maps.importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
          ]);
          if (cancelled) return;
          const stops = [legs[0]!.fromPoint, ...legs.map((leg) => leg.toPoint)];
          const map = new Map(element, { mapId, mapTypeControl: false, streetViewControl: false, gestureHandling: "cooperative" });
          const bounds = new maps.LatLngBounds();
          stops.forEach((position, index) => {
            const pin = new PinElement({ glyphText: index === 0 ? "S" : String(index), background: index === 0 ? "#14505c" : "#c2277f", borderColor: "#fff", glyphColor: "#fff" });
            new AdvancedMarkerElement({ map, position, content: pin.element, title: index === 0 ? "Start" : `Stop ${index}` });
            bounds.extend(position);
          });
          const line = new Polyline({
            map,
            path: stops,
            strokeOpacity: 0,
            icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, strokeColor: "#c2277f", scale: 3 }, offset: "0", repeat: "14px" }],
          });
          map.fitBounds(bounds, 36);
          cleanup = () => line.setMap(null);
        })
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
      stop();
      cleanup?.();
    };
    // `key` captures every change to the route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return <div ref={node} role="region" aria-label="Google map of the trip route" className="aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface-2" />;
}
