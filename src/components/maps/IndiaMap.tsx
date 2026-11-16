import Link from "next/link";
import map from "@/data/generated/india-map.json";
import { getState } from "@/data";

/** Server-rendered SVG. Every state is a real link, so the map works without JavaScript. */
export function IndiaMap({ className, linked = true }: { className?: string; linked?: boolean }) {
  return (
    <svg viewBox={`0 0 ${map.width} ${map.height}`} className={className} role="group" aria-label="Map of India by state and Union Territory">
      {map.states.map((item) => {
        const state = getState(item.slug);
        const shape = (
          <>
            <path d={item.d} />
            {item.small && <circle cx={item.cx} cy={item.cy} r={8} />}
          </>
        );
        if (!linked) {
          return (
            <g key={item.slug} className="map-state" data-region={state?.region}>
              {shape}
            </g>
          );
        }
        return (
          <Link prefetch={false} key={item.slug} href={`/explore/${item.slug}`} className="map-state" data-slug={item.slug} data-region={state?.region} aria-label={state?.name ?? item.name}>
            <title>{state?.name ?? item.name}</title>
            {shape}
          </Link>
        );
      })}
    </svg>
  );
}
