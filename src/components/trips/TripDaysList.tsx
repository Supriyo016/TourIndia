import { BedDouble, Footprints, TrainFront, UtensilsCrossed } from "lucide-react";
import type { Itinerary, TripDay } from "@/features/itinerary/generate";
import { formatINR } from "@/lib/utils";

const dayDate = (value: string | null) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : null);

/** A trip's days, read-only. Every word comes from the guide, not from whoever saved the trip. */
export function TripDaysList({ days }: { days: TripDay[] }) {
  return (
    <ol className="grid gap-4">
      {days.map((day) => (
        <li key={day.id} className="card break-inside-avoid p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-xl">
              Day {day.number}: {day.place}
            </h3>
            {dayDate(day.date) && <span className="text-sm text-muted">{dayDate(day.date)}</span>}
          </div>
          {day.items.length > 0 ? (
            <ul className="mt-3 grid gap-2">
              {day.items.map((item) => (
                <li key={item.id} className="flex gap-2.5">
                  {item.kind === "travel" ? <TrainFront className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden /> : <Footprints className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />}
                  <span>
                    <span className="font-semibold">{item.title}</span>
                    {item.hours ? <span className="text-sm text-muted"> · about {item.hours} h</span> : null}
                    {item.note && <span className="block text-sm text-ink-2">{item.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-ink-2">A free day.</p>
          )}
          {(day.food || day.stay) && (
            <dl className="mt-3 grid gap-1.5 border-t border-line pt-3 text-sm text-ink-2 sm:grid-cols-2">
              {day.food && (
                <div className="flex gap-2">
                  <dt>
                    <UtensilsCrossed className="mt-0.5 size-4 text-muted" aria-label="Food" />
                  </dt>
                  <dd>{day.food}</dd>
                </div>
              )}
              {day.stay && (
                <div className="flex gap-2">
                  <dt>
                    <BedDouble className="mt-0.5 size-4 text-muted" aria-label="Stay" />
                  </dt>
                  <dd>{day.stay}</dd>
                </div>
              )}
            </dl>
          )}
        </li>
      ))}
    </ol>
  );
}

/** The planner's cost estimate for the trip. */
export function TripEstimate({ trip }: { trip: Itinerary }) {
  return (
    <div className="card p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-lg">Estimated cost</h2>
        <span className="tag tag-estimate">Estimate</span>
      </div>
      <dl className="space-y-1.5 text-[0.97rem]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Stay, food, local</dt>
          <dd className="tabular-nums">{formatINR(trip.totals.ground)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Travel out and between stops</dt>
          <dd className="tabular-nums">{formatINR(trip.totals.travel)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-line pt-1.5 font-semibold">
          <dt>Per person</dt>
          <dd className="tabular-nums">{formatINR(trip.totals.perPerson)}</dd>
        </div>
        <div className="flex justify-between gap-3 font-semibold">
          <dt>Group total</dt>
          <dd className="tabular-nums">{formatINR(trip.totals.group)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-sm text-muted">Costed at {trip.tier === "midRange" ? "mid-range" : trip.tier} level. Fares and rooms are not live.</p>
    </div>
  );
}
