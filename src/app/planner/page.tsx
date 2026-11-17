import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TrainCharacter } from "@/components/characters/lazy";
import { IndiaMap } from "@/components/maps/IndiaMap";
import { TripPlanner } from "@/components/planner/TripPlanner";
import { Notice, PageIntro } from "@/components/ui/primitives";
import { destinations } from "@/data";
import map from "@/data/generated/india-map.json";
import { ESTIMATE_ASSUMPTIONS, type PlannerDestination } from "@/features/itinerary/generate";
import type { FestivalFact } from "@/features/itinerary/analysis";
import { festivals } from "@/data/festivals";
import { states } from "@/data/states";

export const metadata: Metadata = {
  title: "Trip planner",
  description: "Build an editable day-by-day India itinerary with estimated travel times and costs, then export it to your calendar or a PDF.",
  alternates: { canonical: "/planner" },
};

const catalogue: PlannerDestination[] = destinations.map(
  ({ slug, name, stateSlug, region, coordinates, categories, attractions, bestMonths, bestTimeNote, recommendedDays, budget, accommodation, cuisine, nearby, permits }) => ({
    slug,
    name,
    stateSlug,
    region,
    coordinates,
    categories,
    attractions,
    bestMonths,
    bestTimeNote,
    recommendedDays,
    budget,
    accommodation,
    cuisine,
    nearby,
    permits,
  }),
);

/** Only confirmed dates, so the analysis never guesses when a lunar festival falls. */
const festivalFacts: FestivalFact[] = festivals.map(({ name, slug, stateSlugs, panIndian, confirmedDates }) => ({
  name,
  slug,
  stateSlugs,
  panIndian,
  dates: confirmedDates.flatMap((date) => (date.isoStart ? [date.isoStart] : [])),
}));
const stateLinks = states.map(({ slug, name, tourismUrl }) => ({ slug, name, tourismUrl }));

export default function PlannerPage() {
  return (
    <>
      <PageIntro imageKey="hero:northeast"
        crumbs={[{ label: "Trip planner" }]}
        eyebrow="Plan your trip"
        title="Build an itinerary"
        lede="Choose where you want to go and how long you have. The planner suggests an order, fills each day and shows its estimates, then you can rearrange everything."
      />
      <div className="container-x space-y-8 py-8">
        <Suspense
          fallback={
            <div role="status" className="flex min-h-[42rem] flex-col items-center justify-center gap-3 text-ink-2 lg:min-h-[28rem]">
              <TrainCharacter className="h-12 w-auto" />
              <p>Loading the planner. It needs JavaScript to run.</p>
            </div>
          }
        >
          <TripPlanner
            catalogue={catalogue}
            festivals={festivalFacts}
            states={stateLinks}
            mapBase={<IndiaMap className="h-auto w-full" linked={false} />}
            map={{ width: map.width, height: map.height, scale: map.scale, translate: map.translate }}
          />
        </Suspense>

        <Notice title="How the estimates are worked out">
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {ESTIMATE_ASSUMPTIONS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-2">
            To book, see <Link prefetch={false} href="/bookings" className="link-text">official booking links</Link>. Tour India does not sell travel.
          </p>
        </Notice>
      </div>
    </>
  );
}
