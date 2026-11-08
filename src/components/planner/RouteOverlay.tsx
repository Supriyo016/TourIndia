import type { TripLeg } from "@/features/itinerary/generate";
import { projectToMap } from "@/lib/utils";

export function RouteOverlay({
  legs,
  map,
}: {
  legs: TripLeg[];
  map: { width: number; height: number; scale: number; translate: number[] };
}) {
  const stops = legs.flatMap((leg, index) => (index === 0 ? [leg.fromPoint, leg.toPoint] : [leg.toPoint])).map((point) => projectToMap(point, map));
  return (
    <svg viewBox={`0 0 ${map.width} ${map.height}`} className="absolute inset-0 h-full w-full" aria-hidden>
      <polyline
        points={stops.map(({ x, y }) => `${x},${y}`).join(" ")}
        fill="none"
        stroke="var(--rani)"
        strokeWidth="4"
        strokeDasharray="10 8"
        strokeLinecap="round"
        style={{ animation: "loader-dash 1.4s linear infinite" }}
      />
      {stops.map(({ x, y }, index) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="14" fill={index === 0 ? "var(--brand)" : "var(--rani)"} stroke="#fff" strokeWidth="3" />
          <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">
            {index === 0 ? "S" : index}
          </text>
        </g>
      ))}
    </svg>
  );
}
