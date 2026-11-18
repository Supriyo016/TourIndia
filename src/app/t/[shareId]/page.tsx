import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { TripDaysList, TripEstimate } from "@/components/trips/TripDaysList";
import { sharedTrip } from "@/features/trips/service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ shareId: string }> };
const lookup = cache((shareId: string) => sharedTrip(shareId));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await lookup((await params).shareId);
  // Shared trips are for the people given the link, not for search engines.
  return { title: found ? found.name : "Trip not found", robots: { index: false, follow: false } };
}

/** A trip someone shared with a read-only link: the plan and estimate, never their spending or name. */
export default async function SharedTripPage({ params }: Props) {
  const found = await lookup((await params).shareId);
  if (!found) notFound();
  const { trip, days } = found;
  return (
    <div className="container-x py-10">
      <p className="text-sm text-muted">A trip shared from Tour India</p>
      <h1 className="mt-1 break-words">{found.name}</h1>
      <p className="mt-1 text-ink-2">
        {days.length} days from {trip.input.startName}, for {trip.input.travellers} {trip.input.travellers === 1 ? "traveller" : "travellers"}.
      </p>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <TripDaysList days={days} />
        <aside className="grid gap-4 lg:sticky lg:top-24">
          <TripEstimate trip={trip} />
          <p className="text-sm text-ink-2">
            Like it?{" "}
            <Link prefetch={false} href="/planner" className="link-text">
              Plan your own trip
            </Link>
            .
          </p>
        </aside>
      </div>
    </div>
  );
}
