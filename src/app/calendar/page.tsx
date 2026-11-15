import type { Metadata } from "next";
import Link from "next/link";
import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { ExternalLink, Notice, PageIntro } from "@/components/ui/primitives";
import { HOLIDAY_SOURCES, holidaysForYear } from "@/data/holidays";
import { formatLongDate } from "@/features/calendar/calendar";

export const metadata: Metadata = {
  title: "Holiday calendar and plan notes",
  description: "A calendar of Indian holidays, with a place to write and date your trip plans.",
  alternates: { canonical: "/calendar" },
};

const LISTED_YEAR = 2027;

export default function CalendarPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Calendar and notes" }]} eyebrow="Plan" title="Calendar and plan notes" lede="See holidays month by month, select a day, and keep your plans beside it. Notes are saved only in this browser." />
      <div className="container-x space-y-8 py-8">
        <CalendarWorkspace />

        <Notice title="About these dates" tone="warn">
          This calendar shows the fixed national holidays and days on Government of India lists. Some are restricted holidays, states add their own, and dates that depend on the moon can change. Confirm before you book.{" "}
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
