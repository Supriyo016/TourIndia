"use client";

import { useEffect, useRef, useState } from "react";
import type { TripLeg } from "@/features/itinerary/generate";
import { loadGoogleMaps, mapId, whenNear } from "@/lib/google-maps";

type Libraries = { maps: typeof google.maps; marker: google.maps.MarkerLibrary };

/**
 * The trip's stops on a Google map, numbered in order and joined by a dashed line.
 * One map is created per visit; changing the route only redraws the markers and line.
 */
export function GoogleRouteMap({ legs }: { legs: TripLeg[] }) {
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [libraries, setLibraries] = useState<Libraries | null>(null);

  // Load and create the map once, when it comes near the screen.
  useEffect(() => {
    const element = node.current;
    if (!element) return;
    let cancelled = false;
    const stop = whenNear(element, () => {
      loadGoogleMaps()
        .then(async (maps) => {
          const [{ Map: GoogleMap }, marker] = await Promise.all([
            maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
            maps.importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
          ]);
          if (cancelled) return;
          map.current = new GoogleMap(element, { mapId, mapTypeControl: false, streetViewControl: false, gestureHandling: "cooperative" });
          setLibraries({ maps, marker });
        })
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  // Redraw the route whenever it changes.
  useEffect(() => {
    const current = map.current;
    if (!current || !libraries || legs.length === 0) return;
    const { maps, marker } = libraries;
    const stops = [legs[0]!.fromPoint, ...legs.map((leg) => leg.toPoint)];
    const bounds = new maps.LatLngBounds();
    const pins = stops.map((position, index) => {
      const pin = new marker.PinElement({ glyphText: index === 0 ? "S" : String(index), background: index === 0 ? "#14505c" : "#c2277f", borderColor: "#fff", glyphColor: "#fff" });
      bounds.extend(position);
      return new marker.AdvancedMarkerElement({ map: current, position, content: pin.element, title: index === 0 ? "Start" : `Stop ${index}` });
    });
    const line = new maps.Polyline({
      map: current,
      path: stops,
      strokeOpacity: 0,
      icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, strokeColor: "#c2277f", scale: 3 }, offset: "0", repeat: "14px" }],
    });
    current.fitBounds(bounds, 36);
    return () => {
      for (const pin of pins) pin.map = null;
      line.setMap(null);
    };
  }, [legs, libraries]);

  return <div ref={node} role="region" aria-label="Google map of the trip route" className="aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface-2" />;
}
