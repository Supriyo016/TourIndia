"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Info, MapPinned } from "lucide-react";
import { holidaysForYear } from "@/data/holidays";
import { analyzeTrip, googleMapsRoute, type FestivalFact, type Tone } from "@/features/itinerary/analysis";
import type { Itinerary, PlannerDestination } from "@/features/itinerary/generate";
import { cn } from "@/lib/utils";

const TONE: Record<Tone, { Icon: typeof Info; className: string; label: string }> = {
  good: { Icon: CheckCircle2, className: "text-forest", label: "Good" },
  watch: { Icon: Info, className: "text-accent-ink", label: "Check" },
  risk: { Icon: AlertTriangle, className: "text-danger", label: "Risk" },
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 85 ? "var(--forest)" : score >= 70 ? "var(--brand)" : score >= 50 ? "var(--accent)" : "var(--danger)";
  return (
    <div className="relative size-28 shrink-0" role="img" aria-label={`Plan score ${score} out of 100`}>
      <svg viewBox="0 0 44 44" className="size-full -rotate-90" aria-hidden>
        <circle cx="22" cy="22" r="19" fill="none" stroke="var(--line)" strokeWidth="4" />
        <circle cx="22" cy="22" r="19" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" pathLength={100} strokeDasharray={`${score} 100`} className="transition-[stroke-dasharray] duration-700" />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl leading-none tabular-nums">{score}</span>
        <span className="text-xs text-muted">of 100</span>
      </span>
    </div>
  );
}

export function TripAnalysisPanel({ trip, catalogue, festivals }: { trip: Itinerary; catalogue: PlannerDestination[]; festivals: FestivalFact[] }) {
  const analysis = useMemo(() => {
    const years = trip.input.startDate ? [Number(trip.input.startDate.slice(0, 4)), Number(trip.input.startDate.slice(0, 4)) + 1] : [];
    return analyzeTrip(trip, catalogue, festivals, years.flatMap(holidaysForYear));
  }, [trip, catalogue, festivals]);

  return (
    <section aria-labelledby="analysis-title" className="card mt-6 p-5 sm:p-6" data-testid="trip-analysis">
      <div className="flex flex-wrap items-center gap-5">
        <ScoreRing score={analysis.score} />
        <div className="min-w-0 flex-1">
          <h3 id="analysis-title" className="text-2xl">Plan check: {analysis.verdict}</h3>
          <p className="mt-1 text-sm text-ink-2">
            {analysis.stats.totalKm.toLocaleString("en-IN")} km of travel (about {analysis.stats.travelHours} h), {analysis.stats.sightseeingHours} h of sightseeing, busiest day {analysis.stats.busiestDay} h.
          </p>
          <p className="mt-1 text-xs text-muted">Checked against each guide&apos;s seasons, confirmed festival dates and public holidays. Weather notes are typical patterns, not forecasts.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {analysis.parts.map((part) => (
          <div key={part.label} className="rounded-[var(--radius-md)] border border-line p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold">{part.label}</h4>
              <span className="text-sm text-muted tabular-nums">{part.score}/100</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
              <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--brand))] transition-[width] duration-700" style={{ width: `${part.score}%` }} />
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {part.findings.map((finding) => {
                const { Icon, className, label } = TONE[finding.tone];
                return (
                  <li key={finding.text} className="flex gap-2">
                    <Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-label={label} />
                    <span className="text-ink-2">
                      {finding.text}{" "}
                      {finding.href && (
                        <Link href={finding.href} className="link-text">
                          More
                        </Link>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {analysis.suggestions.length > 0 && (
        <div className="mt-5 rounded-[var(--radius-md)] bg-brand-soft p-4">
          <h4 className="font-semibold text-brand">Suggestions</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
            {analysis.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Route links and an optional Google map, loaded only on request because it sets Google cookies. */
export function MapsAndLinks({ trip, states }: { trip: Itinerary; states: { slug: string; name: string; tourismUrl?: string }[] }) {
  const [showMap, setShowMap] = useState(false);
  const route = googleMapsRoute(trip);
  const last = trip.legs[trip.legs.length - 1]?.toPoint;
  const stops = trip.legs.map((leg) => leg.toPoint);
  const embed = last ? `https://maps.google.com/maps?saddr=${trip.legs[0]!.fromPoint.lat},${trip.legs[0]!.fromPoint.lng}&daddr=${stops.map((point) => `${point.lat},${point.lng}`).join("+to:")}&output=embed` : "";
  const osm = last ? `https://www.openstreetmap.org/?mlat=${last.lat}&mlon=${last.lng}#map=7/${last.lat}/${last.lng}` : "https://www.openstreetmap.org";
  const links: [string, string][] = [
    ["Directions in Google Maps", route],
    ["OpenStreetMap", osm],
    ["Indian Railways (IRCTC)", "https://www.irctc.co.in/"],
    ["Weather (India Meteorological Department)", "https://mausam.imd.gov.in/"],
    ["Incredible India (Ministry of Tourism)", "https://www.incredibleindia.org"],
    ...states.filter((state) => state.tourismUrl).map((state): [string, string] => [`${state.name} tourism (official)`, state.tourismUrl!]),
  ];

  return (
    <div className="card p-4">
      <h3 className="mb-2 flex items-center gap-2 text-lg">
        <MapPinned className="size-5 text-brand" aria-hidden /> Maps and useful sites
      </h3>
      {showMap ? (
        <iframe title="Route on Google Maps" src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full rounded-[var(--radius-md)] border border-line" />
      ) : (
        <button type="button" className="btn btn-outline w-full justify-center" onClick={() => setShowMap(true)} disabled={!embed}>
          Show the route on Google Maps
        </button>
      )}
      {!showMap && <p className="mt-1.5 text-xs text-muted">Loads a map from Google, which may set its own cookies.</p>}
      <ul className="mt-3 space-y-1.5 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <a href={href} target="_blank" rel="noopener noreferrer" className="link-text inline-flex items-center gap-1">
              {label} <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
