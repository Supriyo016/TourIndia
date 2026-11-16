"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { loadGoogleMaps, mapId, prefersReducedMotion, whenNear } from "@/lib/google-maps";
import type { StatePreview } from "./MapExplorer";

const normalise = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");

/**
 * India on a tilted Google vector map. States are shaded with Google's own boundaries
 * (data-driven styling), so the outline matches the official map service. The camera
 * sways slowly until the visitor takes over.
 */
export function GoogleIndiaMap({
  previews,
  region,
  selected,
  onHover,
  onReady,
}: {
  previews: StatePreview[];
  region: string | null;
  selected: string;
  onHover: (slug: string) => void;
  onReady: () => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const layer = useRef<google.maps.FeatureLayer | null>(null);
  const state = useRef({ region, selected, hovered: "" });
  const router = useRouter();
  const callbacks = useRef({ onHover, onReady, push: router.push });
  useEffect(() => {
    callbacks.current = { onHover, onReady, push: router.push };
  });

  // Re-shade when the chosen region or state changes.
  useEffect(() => {
    state.current.region = region;
    state.current.selected = selected;
    const current = layer.current;
    if (current) current.style = current.style ?? null;
  }, [region, selected]);

  useEffect(() => {
    const element = node.current;
    if (!element) return;
    const bySlug = new Map(previews.map((item) => [normalise(item.name), item]));
    // Boundary features carry only a place ID; each state's name is fetched once and cached.
    const names = new Map<string, string>();
    const pending = new Set<string>();
    let restyle = () => {};
    const find = (feature?: google.maps.Feature | null) => {
      const place = feature as google.maps.PlaceFeature | undefined;
      if (!place?.placeId) return undefined;
      const name = names.get(place.placeId);
      if (name) return bySlug.get(normalise(name));
      if (!pending.has(place.placeId)) {
        pending.add(place.placeId);
        place
          .fetchPlace()
          .then((details) => {
            names.set(place.placeId, details.displayName ?? "");
            restyle();
          })
          .catch(() => undefined);
      }
      return undefined;
    };
    let frame = 0;
    let cancelled = false;

    const stop = whenNear(element, () => {
      loadGoogleMaps()
        .then(async (maps) => {
          const { Map: GoogleMap } = (await maps.importLibrary("maps")) as google.maps.MapsLibrary;
          if (cancelled) return;
          const small = element.clientWidth < 520;
          const map = new GoogleMap(element, {
            center: { lat: 22.4, lng: 80.2 },
            zoom: small ? 3.7 : 4.4,
            mapId,
            tilt: 45,
            heading: 0,
            gestureHandling: "cooperative",
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          const featureLayer = map.getFeatureLayer(maps.FeatureType.ADMINISTRATIVE_AREA_LEVEL_1);
          const style: google.maps.FeatureStyleFunction = ({ feature }) => {
            const item = find(feature);
            if (!item) return null;
            const { region: chosenRegion, selected: chosen, hovered } = state.current;
            const active = item.slug === chosen || item.slug === hovered;
            const dimmed = chosenRegion !== null && item.region !== chosenRegion;
            return {
              fillColor: active ? "#f2a33c" : "#14505c",
              fillOpacity: active ? 0.6 : dimmed ? 0.04 : 0.22,
              strokeColor: active ? "#b9661b" : "#0e3c46",
              strokeWeight: active ? 2.5 : 1,
            };
          };
          featureLayer.style = style;
          layer.current = featureLayer;
          restyle = () => {
            featureLayer.style = style;
          };

          featureLayer.addListener("mousemove", (event: google.maps.FeatureMouseEvent) => {
            const item = find(event.features[0]);
            if (!item || item.slug === state.current.hovered) return;
            state.current.hovered = item.slug;
            featureLayer.style = style;
            callbacks.current.onHover(item.slug);
          });
          featureLayer.addListener("click", (event: google.maps.FeatureMouseEvent) => {
            const item = find(event.features[0]);
            if (item) callbacks.current.push(`/explore/${item.slug}`);
          });

          // A slow 3D sway of the camera, stopped for good once someone drags or zooms.
          if (!prefersReducedMotion()) {
            const start = performance.now();
            const sway = (now: number) => {
              const t = (now - start) / 1000;
              map.moveCamera({ heading: Math.sin(t / 9) * 18, tilt: 40 + Math.sin(t / 6) * 8 });
              frame = requestAnimationFrame(sway);
            };
            frame = requestAnimationFrame(sway);
            const halt = () => cancelAnimationFrame(frame);
            map.addListener("dragstart", halt);
            map.addListener("zoom_changed", halt);
            element.addEventListener("pointerdown", halt, { once: true });
          }
          callbacks.current.onReady();
        })
        .catch(() => {
          // The SVG map stays in place.
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stop();
    };
  }, [previews]);

  return <div ref={node} role="region" aria-label="Google map of India by state" className="aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-lg)] border border-line sm:aspect-[5/5]" />;
}
