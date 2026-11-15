import type { Metadata } from "next";
import { CommunityPanel } from "@/components/community/CommunityPanel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareBar } from "@/components/destinations/ClientWidgets";
import { Breadcrumbs, ExternalLink, JsonLd, Notice, Photo, PhotoCredit } from "@/components/ui/primitives";
import { getDestination, getState } from "@/data";
import { festivals } from "@/data/festivals";
import { formatMonthRange } from "@/data/taxonomy";

const find = (slug: string) => festivals.find((festival) => festival.slug === slug);

export function generateStaticParams() {
  return festivals.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/culture/festivals/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const festival = find(slug);
  if (!festival) return {};
  return { title: festival.name, description: festival.summary, alternates: { canonical: `/culture/festivals/${slug}` } };
}

export default async function FestivalPage({ params }: PageProps<"/culture/festivals/[slug]">) {
  const { slug } = await params;
  const festival = find(slug);
  if (!festival) notFound();
  const stateNames = festival.panIndian ? "Across India" : festival.stateSlugs.map((item) => getState(item)?.name).filter(Boolean).join(", ");

  return (
    <article>
      {festival.confirmedDates[0]?.isoStart && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Event",
            name: festival.name,
            description: festival.summary,
            startDate: festival.confirmedDates[0].isoStart,
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: { "@type": "Place", name: stateNames, address: { "@type": "PostalAddress", addressCountry: "IN" } },
          }}
        />
      )}
      <header className="relative isolate flex min-h-[20rem] items-end overflow-hidden">
        <Photo imageKey={`festival:${festival.slug}`} sizes="100vw" priority className="-z-20" />
        <div className="photo-scrim absolute inset-0 -z-10" />
        <div className="container-x pt-20 pb-7 text-white">
          <p className="eyebrow !text-[#f7c26b]">{stateNames}</p>
          <h1 className="!text-white">{festival.name}</h1>
        </div>
      </header>
      <div className="container-x max-w-4xl py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs items={[{ label: "Festivals", href: "/culture/festivals" }, { label: festival.name }]} />
          <PhotoCredit imageKey={`festival:${festival.slug}`} />
        </div>
        <p className="lede mt-6">{festival.summary}</p>

        <dl className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">Usually falls in</dt>
            <dd className="font-semibold">{formatMonthRange(festival.months)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">How the date is set</dt>
            <dd className="font-semibold">{festival.dateRule}</dd>
          </div>
          {festival.confirmedDates.map((date) => (
            <div key={date.label}>
              <dt className="text-sm text-muted">Confirmed for {date.year} <span className="tag tag-verified ml-1">Sourced</span></dt>
              <dd className="font-semibold">
                {date.label} (<ExternalLink href={date.source.url} className="underline">{date.source.label}</ExternalLink>)
              </dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-10 mb-2">History</h2>
        <p className="max-w-[70ch] text-ink-2">{festival.history}</p>
        <h2 className="mt-8 mb-2">Why it matters</h2>
        <p className="max-w-[70ch] text-ink-2">{festival.significance}</p>

        <h2 className="mt-8 mb-3">Where to experience it</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {festival.places.map((place) => (
            <li key={place.place} className="card p-4">
              <h3 className="text-lg">
                {place.destinationSlug && getDestination(place.destinationSlug) ? (
                  <Link href={`/destinations/${place.destinationSlug}`} className="link-text">{place.place}</Link>
                ) : (
                  place.place
                )}
              </h3>
              <p className="mt-1 text-[0.97rem] text-ink-2">{place.note}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8"><Notice title="Travel advice">{festival.travelAdvice}</Notice></div>
        <div className="mt-6"><ShareBar title={festival.name} path={`/culture/festivals/${festival.slug}`} /></div>

        {festival.sources.length > 0 && (
          <p className="mt-6 text-sm text-muted">
            Sources:{" "}
            {festival.sources.map((source, index) => (
              <span key={source.url}>
                {index > 0 && ", "}
                <ExternalLink href={source.url} className="underline">{source.label}</ExternalLink>
              </span>
            ))}
          </p>
        )}
        <CommunityPanel target={{ type: "festival", id: festival.slug }} title={festival.name} path={`/culture/festivals/${festival.slug}`} />
      </div>
    </article>
  );
}
