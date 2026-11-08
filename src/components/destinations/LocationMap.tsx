"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/types/content";

/** OpenStreetMap view of one destination. Loaded only when scrolled near, to spare the first paint. */
export function LocationMap({
  center,
  name,
  points,
}: {
  center: LatLng;
  name: string;
  points: { name: string; coordinates: LatLng }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "error">("idle");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        import("leaflet")
          .then(({ default: L }) => {
            if (cancelled) return;
            const map = L.map(node, { scrollWheelZoom: false }).setView([center.lat, center.lng], 11);
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
              maxZoom: 18,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            const pin = (label: string, main: boolean) =>
              L.divIcon({
                className: "",
                iconSize: [18, 18],
                iconAnchor: [9, 9],
                html: `<span title="${label.replace(/"/g, "&quot;")}" style="display:block;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgb(0 0 0/.5);background:${main ? "#c2277f" : "#14505c"}"></span>`,
              });

            const bounds = L.latLngBounds([[center.lat, center.lng]]);
            L.marker([center.lat, center.lng], { icon: pin(name, true), alt: name }).addTo(map).bindPopup(name);
            for (const point of points) {
              const position: [number, number] = [point.coordinates.lat, point.coordinates.lng];
              L.marker(position, { icon: pin(point.name, false), alt: point.name }).addTo(map).bindPopup(point.name);
              bounds.extend(position);
            }
            if (points.length) map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
            cleanup = () => map.remove();
          })
          .catch(() => setStatus("error"));
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      cleanup?.();
    };
  }, [center.lat, center.lng, name, points]);

  if (status === "error") {
    return <p className="text-ink-2">The map could not load. Check your connection and refresh the page.</p>;
  }

  return (
    <div
      ref={ref}
      role="application"
      aria-label={`Map of ${name} and its main attractions`}
      className="relative z-0 h-80 w-full overflow-hidden rounded-[var(--radius-lg)] border border-line sm:h-[26rem]"
    />
  );
}
