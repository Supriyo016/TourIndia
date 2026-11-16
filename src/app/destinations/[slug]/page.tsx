import type { Metadata } from "next";
import { CommunityPanel } from "@/components/community/CommunityPanel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, Bus, CalendarDays, Clock, Hotel, Plane, Sparkles, TrainFront, Wallet } from "lucide-react";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { ShareBar, TrackRecentlyViewed, WeatherPanel } from "@/components/destinations/ClientWidgets";
import { LocationMap } from "@/components/destinations/LocationMap";
import { SaveButton } from "@/components/destinations/SaveButton";
import { Breadcrumbs, ExternalLink, JsonLd, Notice, Photo, PhotoCredit } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { destinations, getDestination, getState, similarDestinations } from "@/data";
import { festivals } from "@/data/festivals";
import { categoryName, formatMonthRange, monthNames, regionName } from "@/data/taxonomy";
import { formatDate, formatINRRange } from "@/lib/utils";
import type { Destination } from "@/types/content";

export function generateStaticParams() {
  return destinations.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = getDestination(slug);
  if (!item) return {};
  return {
    title: `${item.name} travel guide`,
    description: item.tagline,
    alternates: { canonical: `/destinations/${slug}` },
    openGraph: { title: `${item.name} travel guide`, description: item.tagline, type: "article" },
  };
}

const sections = [
  ["overview", "Overview"],
  ["attractions", "Attractions"],
  ["when", "When to go"],
  ["costs", "Costs"],
  ["getting-there", "Getting there"],
  ["food", "Food and festivals"],
  ["practical", "Practical advice"],
  ["faq", "FAQ"],
] as const;

function Section({ id, title, tag, children }: { id: string; title: string; tag?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line pt-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 id={`${id}-title`}>{title}</h2>
        {tag}
      </div>
      {children}
    </section>
  );
}

function BudgetTable({ item }: { item: Destination }) {
  const rows = [
    ["Budget", item.budget.budget],
    ["Mid-range", item.budget.midRange],
    ["Comfort", item.budget.comfort],
  ] as const;
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map(([label, range]) => (
          <div key={label} className="card p-4">
            <p className="text-sm font-semibold text-muted">{label}</p>
            <p className="font-display text-xl">{formatINRRange(range)}</p>
            <p className="text-sm text-muted">per person, per day</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.97rem] text-ink-2">
        <strong className="font-semibold text-ink">What this assumes: </strong>
        {item.budget.assumptions}
      </p>
      <p className="mt-2 text-sm text-muted">
        These are editorial estimates, not quotes or live prices. <Link className="underline" href="/disclaimer#estimates">How estimates work</Link>.
      </p>
    </>
  );
}

export default async function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const item = getDestination(slug);
  if (!item) notFound();

  const state = getState(item.stateSlug);
  const similar = similarDestinations(item);
  const mapPoints = item.attractions.flatMap((attraction) =>
    attraction.coordinates ? [{ name: attraction.name, coordinates: attraction.coordinates }] : [],
  );
  const linkedFestivals = festivals.filter((festival) => item.festivalSlugs?.includes(festival.slug));

  return (
    <article>
      <TrackRecentlyViewed slug={item.slug} />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "TouristDestination",
            name: item.name,
            description: item.tagline,
            url: `${site.url}/destinations/${item.slug}`,
            geo: { "@type": "GeoCoordinates", latitude: item.coordinates.lat, longitude: item.coordinates.lng },
            containedInPlace: { "@type": "AdministrativeArea", name: state?.name },
            touristType: item.categories.map(categoryName),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: item.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ]}
      />

      <header className="relative isolate flex min-h-[26rem] items-end overflow-hidden sm:min-h-[32rem]">
        <Photo imageKey={`destination:${item.slug}`} sizes="100vw" priority className="-z-20" />
        <div className="photo-scrim absolute inset-0 -z-10" />
        <div className="container-x pt-24 pb-8 text-white">
          <p className="eyebrow !text-[#f7c26b]">{state?.name}</p>
          <h1 className="!text-white">{item.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-white/90">{item.tagline}</p>
        </div>
      </header>

      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <Breadcrumbs
            items={[
              { label: "Discover", href: "/discover" },
              { label: state?.name ?? "", href: `/explore/${item.stateSlug}` },
              { label: item.name },
            ]}
          />
          <PhotoCredit imageKey={`destination:${item.slug}`} />
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-4 sm:grid-cols-4">
          {[
            [CalendarDays, "Best months", formatMonthRange(item.bestMonths)],
            [Clock, "Suggested stay", `${item.recommendedDays.min}–${item.recommendedDays.max} days`],
            [Wallet, "Mid-range estimate", `${formatINRRange(item.budget.midRange)} a day`],
            [Sparkles, "Good for", item.categories.slice(0, 2).map(categoryName).join(", ")],
          ].map(([Icon, label, value]) => {
            const I = Icon as typeof Clock;
            return (
              <div key={label as string} className="relative pl-7">
                <I className="absolute top-0.5 left-0 size-5 text-accent-ink" aria-hidden />
                <dt className="text-sm text-muted">{label as string}</dt>
                <dd className="font-semibold">{value as string}</dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href={`/planner?d=${item.slug}`} className="btn btn-accent">
            Plan a trip here <ArrowRight className="nudge size-4" aria-hidden />
          </Link>
          <SaveButton slug={item.slug} name={item.name} variant="full" />
          <Link href={`/compare?a=${item.slug}`} className="btn btn-outline">
            Compare
          </Link>
          <ShareBar title={`${item.name} travel guide`} path={`/destinations/${item.slug}`} />
        </div>

        <div className="mt-8 grid gap-10 pb-16 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <nav aria-label="On this page" className="no-print hidden lg:block">
            <ul className="sticky top-24 space-y-1 text-[0.95rem]">
              {sections.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="link-u text-ink-2 hover:text-brand">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-10">
            <Section id="overview" title={`About ${item.name}`} tag={<span className="tag tag-editorial">Editorial guide</span>}>
              <div className="prose-guide">
                {item.overview.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
              <h3 className="mt-7 mb-2">History</h3>
              <div className="prose-guide">
                {item.history.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </Section>

            <Section id="attractions" title="Main attractions">
              <ul className="grid gap-4 sm:grid-cols-2">
                {item.attractions.map((attraction) => (
                  <li key={attraction.name} className="card p-4">
                    <h3 className="text-lg">{attraction.name}</h3>
                    <p className="mt-1 text-[0.97rem] text-ink-2">{attraction.description}</p>
                    <p className="mt-2 text-sm text-muted">About {attraction.visitHours} {attraction.visitHours === 1 ? "hour" : "hours"}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <LocationMap center={item.coordinates} name={item.name} points={mapPoints} />
              </div>
            </Section>

            <Section id="when" title="When to go">
              <ol className="mb-4 grid grid-cols-12 gap-1" aria-label={`Recommended months: ${formatMonthRange(item.bestMonths)}`}>
                {monthNames.map((month, index) => {
                  const good = item.bestMonths.includes((index + 1) as never);
                  return (
                    <li
                      key={month}
                      title={month}
                      className={`rounded py-1.5 text-center text-xs font-semibold ${good ? "bg-brand text-on-brand" : "bg-surface-2 text-muted"}`}
                    >
                      <abbr title={month} className="no-underline">{month[0]}</abbr>
                    </li>
                  );
                })}
              </ol>
              <p className="max-w-[70ch] text-ink-2">{item.bestTimeNote}</p>
              <h3 className="mt-6 mb-3 text-lg">Next five days</h3>
              <WeatherPanel slug={item.slug} />
            </Section>

            <Section id="costs" title="Estimated daily costs" tag={<span className="tag tag-estimate">Estimate</span>}>
              <BudgetTable item={item} />
            </Section>

            <Section id="getting-there" title="Getting there and around">
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  [Plane, "By air", item.gettingThere.air],
                  [TrainFront, "By rail", item.gettingThere.rail],
                  [Bus, "By road", item.gettingThere.road],
                  [ArrowRight, "Getting around", item.gettingThere.local],
                ].map(([Icon, label, text]) => {
                  const I = Icon as typeof Plane;
                  return (
                    <li key={label as string} className="card p-4">
                      <h3 className="flex items-center gap-2 text-lg">
                        <I className="size-5 text-accent-ink" aria-hidden /> {label as string}
                      </h3>
                      <p className="mt-1 text-[0.97rem] text-ink-2">{text as string}</p>
                    </li>
                  );
                })}
              </ul>
              <h3 className="mt-6 mb-1 flex items-center gap-2 text-lg">
                <Hotel className="size-5 text-accent-ink" aria-hidden /> Where to stay
              </h3>
              <p className="max-w-[70ch] text-ink-2">{item.accommodation}</p>
              {item.permits && (
                <div className="mt-5">
                  <Notice title="Permits" tone="warn">
                    {item.permits} Rules change, so confirm with the issuing authority before you travel.
                  </Notice>
                </div>
              )}
            </Section>

            <Section id="food" title="Food and festivals">
              <ul className="grid gap-3 sm:grid-cols-2">
                {item.cuisine.map((dish) => (
                  <li key={dish.name}>
                    <p className="font-semibold">{dish.name}</p>
                    <p className="text-[0.97rem] text-ink-2">{dish.note}</p>
                  </li>
                ))}
              </ul>
              {item.festivals.length > 0 && (
                <>
                  <h3 className="mt-6 mb-2 text-lg">Festivals</h3>
                  <p className="text-ink-2">{item.festivals.join(", ")}</p>
                  {linkedFestivals.length > 0 && (
                    <p className="mt-3 flex flex-wrap gap-2">
                      {linkedFestivals.map((festival) => (
                        <Link key={festival.slug} href={`/culture/festivals/${festival.slug}`} className="chip">
                          {festival.name}
                        </Link>
                      ))}
                    </p>
                  )}
                </>
              )}
            </Section>

            <Section id="practical" title="Practical advice">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-lg">
                    <AlertTriangle className="size-5 text-accent-ink" aria-hidden /> Precautions
                  </h3>
                  <ul className="list-disc space-y-1.5 pl-5 text-ink-2">
                    {item.precautions.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-lg">Tips</h3>
                  <ul className="list-disc space-y-1.5 pl-5 text-ink-2">
                    {item.tips.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Notice title="Accessibility">{item.accessibility}</Notice>
                <Notice title="Travelling responsibly">{item.responsibleTravel}</Notice>
              </div>
              <h3 className="mt-7 mb-3 text-lg">Nearby</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {item.nearby.map((place) => (
                  <li key={place.name} className="text-[0.97rem] text-ink-2">
                    <span className="font-semibold text-ink">
                      {place.destinationSlug && getDestination(place.destinationSlug) ? (
                        <Link href={`/destinations/${place.destinationSlug}`} className="link-text">
                          {place.name}
                        </Link>
                      ) : (
                        place.name
                      )}
                    </span>{" "}
                    <span className="text-muted">(about {place.distanceKm} km)</span>
                    <br />
                    {place.note}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="faq" title="Common questions">
              <div className="space-y-2">
                {item.faqs.map((faq) => (
                  <details key={faq.question} className="card group p-4">
                    <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                    <p className="mt-2 text-ink-2">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </Section>

            <section aria-label="Sources" className="rounded-[var(--radius-lg)] bg-surface-2 p-5 text-[0.95rem]">
              <p className="font-semibold">Last updated {formatDate(item.lastReviewed)}</p>
              <p className="mt-1 text-ink-2">
                Timings, fees, permits and transport change. Confirm anything important with an official source before you travel.{" "}
                <Link href="/content-policy" className="underline">
                  How we write and update guides
                </Link>
                .
              </p>
              {item.officialLinks.length > 0 && (
                <p className="mt-3">
                  <span className="font-semibold">Official: </span>
                  {item.officialLinks.map((link, index) => (
                    <span key={link.url}>
                      {index > 0 && ", "}
                      <ExternalLink href={link.url} className="link-text">
                        {link.label}
                      </ExternalLink>
                    </span>
                  ))}
                </p>
              )}
              {item.sources.length > 0 && (
                <p className="mt-2">
                  <span className="font-semibold">Sources: </span>
                  {item.sources.map((link, index) => (
                    <span key={link.url}>
                      {index > 0 && ", "}
                      <ExternalLink href={link.url} className="underline">
                        {link.label}
                      </ExternalLink>
                    </span>
                  ))}
                </p>
              )}
            </section>
          </div>
        </div>
      </div>

      <section className="no-print border-t border-line bg-surface-2 py-12" aria-labelledby="similar-title">
        <div className="container-x">
          <h2 id="similar-title" className="mb-6">Similar places in {regionName(item.region) === regionName(similar[0]?.region ?? item.region) ? regionName(item.region) : "India"}</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((other) => (
              <li key={other.slug}>
                <DestinationCard destination={other} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="container-x pb-12">
        <p className="mt-8 text-sm">
          Spotted something out of date? <Link href={`/encyclopedia/${item.slug}`} className="link-text">Suggest a correction in the encyclopedia</Link>.
        </p>
        <CommunityPanel target={{ type: "place", id: item.slug }} title={item.name} path={`/destinations/${item.slug}`} />
      </div>
    </article>
  );
}
