import type { Metadata } from "next";
import Link from "next/link";
import { FestivalBrowser } from "@/components/culture/FestivalBrowser";
import { Notice, PageIntro, Photo } from "@/components/ui/primitives";
import { states } from "@/data";
import { festivals } from "@/data/festivals";
import { formatMonthRange } from "@/data/taxonomy";

export const metadata: Metadata = {
  title: "Indian festival calendar",
  description: "Festivals across India by month and state, with their history, significance and where to experience them.",
  alternates: { canonical: "/culture/festivals" },
};

export default function FestivalsPage() {
  const cards = Object.fromEntries(
    festivals.map((festival) => [
      festival.slug,
      <article key={festival.slug} className="card card-hover h-full overflow-hidden">
        <div className="zoom-media relative aspect-[16/9]">
          <Photo imageKey={`festival:${festival.slug}`} sizes="(min-width: 1024px) 30vw, 92vw" />
        </div>
        <div className="p-4">
          <p className="text-sm text-muted">
            {festival.confirmedDates[0] ? festival.confirmedDates[0].label : `Usually ${formatMonthRange(festival.months)}`}
          </p>
          <h2 className="text-xl">
            <Link prefetch={false} href={`/culture/festivals/${festival.slug}`} className="after:absolute after:inset-0">{festival.name}</Link>
          </h2>
          <p className="mt-1 line-clamp-3 text-[0.97rem] text-ink-2">{festival.summary}</p>
        </div>
      </article>,
    ]),
  );

  return (
    <>
      <PageIntro imageKey="festival:holi" crumbs={[{ label: "Culture", href: "/culture" }, { label: "Festivals" }]} eyebrow="Culture" title="Festival calendar" lede="Filter by the month you can travel and the state you are heading to." />
      <div className="container-x space-y-6 py-8">
        <Notice title="About these dates" tone="warn">
          Many Indian festivals follow lunar or lunisolar calendars and move from year to year. Where a 2027 date appears, it comes from an official source named on the festival&apos;s page. Otherwise we list the usual month and how the date is set. Regional dates can differ, so confirm before booking.
        </Notice>
        <FestivalBrowser
          items={festivals.map(({ slug, months, stateSlugs, panIndian }) => ({ slug, months, stateSlugs, panIndian }))}
          cards={cards}
          stateOptions={[...states].sort((a, b) => a.name.localeCompare(b.name)).map(({ slug, name }) => ({ slug, name }))}
        />
      </div>
    </>
  );
}
