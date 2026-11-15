import type { Metadata } from "next";
import Link from "next/link";
import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { ExternalLink, Notice, PageIntro } from "@/components/ui/primitives";
import { festivals } from "@/data/festivals";
import { HOLIDAY_SOURCES, holidaysForYear } from "@/data/holidays";
import type { FestivalDateFact } from "@/data/occasions";
import { formatLongDate } from "@/features/calendar/calendar";

export const metadata: Metadata = {
  title: "Indian calendar: holidays, festivals, special days and seasons",
  description: "Public holidays, festival dates confirmed by published sources, national and international days, state days and nature seasons across India, with plan notes and calendar export.",
  alternates: { canonical: "/calendar" },
};

const LISTED_YEAR = 2027;

/** Only dates a source has published; the browser gets the dates, not the festival guides. */
const festivalDates: FestivalDateFact[] = festivals.flatMap(({ name, slug, confirmedDates }) =>
  confirmedDates.flatMap((date) => (date.isoStart ? [{ date: date.isoStart, name, slug }] : [])),
);

export default function CalendarPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Calendar and notes" }]} eyebrow="Plan" title="Calendar and plan notes" lede="Holidays, festivals, special days, state days and nature seasons, month by month. Filter what you see, export a month to your own calendar, and keep plan notes beside it." />
      <div className="container-x space-y-8 py-8">
        <CalendarWorkspace festivalDates={festivalDates} />

        <Notice title="About these dates" tone="warn">
          Holidays come from Government of India lists; festival dates appear only where a source has published them; observances and state days fall on fixed dates; nature seasons are typical patterns. Some are restricted holidays, states add their own, and dates that depend on the moon can change. Confirm before you book.{" "}
          <span className="block mt-1">
            Sources:{" "}
            {HOLIDAY_SOURCES.map((source, index) => (
              <span key={source.url}>
                {index > 0 && ", "}
                <ExternalLink href={source.url} className="underline">{source.label}</ExternalLink>
              </span>
            ))}
            . See also the <Link href="/culture/festivals" className="link-text">festival calendar</Link>.
          </span>
        </Notice>

        <section aria-labelledby="year-list">
          <h2 id="year-list" className="mb-3">All listed holidays in {LISTED_YEAR}</h2>
          <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {holidaysForYear(LISTED_YEAR).map((holiday) => (
              <li key={holiday.date + holiday.name} className="text-[0.97rem]">
                <span className="font-semibold">{holiday.name}</span>
                <span className="block text-sm text-muted">{formatLongDate(holiday.date)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
