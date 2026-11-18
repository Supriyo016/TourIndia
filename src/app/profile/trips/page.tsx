import Link from "next/link";
import { Archive, CalendarDays, Link2, Users } from "lucide-react";
import { listTrips, type TripSummary } from "@/features/trips/service";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "My trips" };

const when = (value: string | null) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null);

function TripRow({ trip }: { trip: TripSummary }) {
  return (
    <li className="card card-hover relative p-5">
      <h3 className="text-xl break-words">
        <Link prefetch={false} href={`/profile/trips/${trip.id}`} className="after:absolute after:inset-0">
          {trip.name}
        </Link>
      </h3>
      <p className="mt-1 text-ink-2">{trip.places.join(" → ")}</p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4" aria-hidden />
          {trip.days} {trip.days === 1 ? "day" : "days"}
          {when(trip.startDate) ? `, from ${when(trip.startDate)}` : ""}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-4" aria-hidden />
          {trip.travellers} {trip.travellers === 1 ? "traveller" : "travellers"}
        </span>
        {trip.shared && (
          <span className="inline-flex items-center gap-1.5">
            <Link2 className="size-4" aria-hidden /> Shared by link
          </span>
        )}
      </p>
    </li>
  );
}

/** The signed-in person's saved trips, with archived ones tucked below. */
export default async function MyTripsPage() {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const trips = await listTrips(session.user._id).catch(() => null);
  const active = trips?.filter((trip) => trip.status === "active") ?? [];
  const archived = trips?.filter((trip) => trip.status === "archived") ?? [];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1>My trips</h1>
          <p className="mt-1 text-ink-2">Trips you save from the planner, kept in your account.</p>
        </div>
        <Link prefetch={false} href="/planner" className="btn btn-accent">
          Plan a new trip
        </Link>
      </div>
      {trips === null ? (
        <p className="text-ink-2">Trips aren&apos;t available right now. Please try again later.</p>
      ) : active.length === 0 ? (
        <p className="card p-6 text-ink-2">
          No trips yet. Build one in the{" "}
          <Link prefetch={false} href="/planner" className="link-text">
            planner
          </Link>{" "}
          and press Save trip.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {active.map((trip) => (
            <TripRow key={trip.id} trip={trip} />
          ))}
        </ul>
      )}
      {archived.length > 0 && (
        <section aria-labelledby="archived-title">
          <h2 id="archived-title" className="flex items-center gap-2 text-xl">
            <Archive className="size-5 text-muted" aria-hidden /> Archived
          </h2>
          <ul className="mt-3 grid gap-4 md:grid-cols-2">
            {archived.map((trip) => (
              <TripRow key={trip.id} trip={trip} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
