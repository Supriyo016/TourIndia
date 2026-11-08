import Link from "next/link";
import map from "@/data/generated/india-map.json";
import { destinations, destinationsInState, states } from "@/data";
import { formatMonthRange } from "@/data/taxonomy";
import { projectToMap } from "@/lib/utils";
import type { StatePreview } from "./MapExplorer";

export function statePreviews(): StatePreview[] {
  return states.map((state) => ({
    slug: state.slug,
    name: state.name,
    kind: state.kind,
    capital: state.capital,
    tagline: state.tagline,
    region: state.region,
    season: formatMonthRange(state.bestMonths),
    days: `${state.recommendedDays.min}–${state.recommendedDays.max} days`,
    guides: destinationsInState(state.slug).length,
  }));
}

/** Pins sit above the state links in a separate overlay, positioned in percentages. */
export function DestinationPins() {
  return (
    <>
      {destinations.map((item) => {
        const { x, y } = projectToMap(item.coordinates, map);
        return (
          <Link
            key={item.slug}
            href={`/destinations/${item.slug}`}
            title={item.name}
            aria-label={`${item.name} guide`}
            style={{ left: `${(x / map.width) * 100}%`, top: `${(y / map.height) * 100}%` }}
            className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-rani shadow-md transition-transform hover:scale-150 focus-visible:scale-150"
          />
        );
      })}
    </>
  );
}
