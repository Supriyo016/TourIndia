import Link from "next/link";
import { notFound } from "next/navigation";
import { TripControls } from "@/components/trips/TripControls";
import { TripDaysList, TripEstimate } from "@/components/trips/TripDaysList";
import { TripExpenses } from "@/components/trips/TripExpenses";
import { shareHash } from "@/features/itinerary/share";
import { tripForOwner } from "@/features/trips/service";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "Trip" };

const when = (value: string | null) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null);

/** One saved trip, for its owner: the plan, the estimate, spending, and what can be done with it. */
export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const view = await tripForOwner(session.user._id, (await params).id);
  if (!view) notFound();
  const { trip, days, input } = view;
  const stops = input.destinationSlugs.length;

  return (
    <div className="grid gap-6">
      <p className="no-print text-sm">
        <Link prefetch={false} href="/profile/trips" className="link-text">
          ← My trips
        </Link>
      </p>
      <div>
        <h1 className="break-words">{view.name}</h1>
        <p className="mt-1 text-ink-2">
          {days.length} days from {input.startName}, {stops} {stops === 1 ? "stop" : "stops"}, for {input.travellers} {input.travellers === 1 ? "traveller" : "travellers"}
          {when(input.startDate) ? `, starting ${when(input.startDate)}` : ""}.{view.status === "archived" ? " Archived." : ""}
        </p>
      </div>
      <TripControls id={view.id} name={view.name} status={view.status} shareId={view.shareId} plannerHash={shareHash(trip.input, days)} days={days} />
      {trip.warnings.length > 0 && (
        <ul className="grid gap-2">
          {trip.warnings.map((warning) => (
            <li key={warning} className="rounded-[var(--radius-md)] bg-surface-2 p-3 text-[0.97rem] text-ink-2">
              {warning}
            </li>
          ))}
        </ul>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <TripDaysList days={days} />
        <aside className="grid gap-5 lg:sticky lg:top-24">
          <TripEstimate trip={trip} />
          <div className="print:hidden">
            <TripExpenses id={view.id} initial={view.expenses} travellers={input.travellers} estimate={trip.totals.group} />
          </div>
        </aside>
      </div>
    </div>
  );
}
