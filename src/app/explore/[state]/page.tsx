import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { TranslateBar } from "@/components/translate/TranslateBar";
import { Breadcrumbs, ExternalLink, JsonLd, Notice, Photo, PhotoCredit } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { destinationsInState, getState, states } from "@/data";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { formatMonthRange, regionName } from "@/data/taxonomy";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return states.map(({ slug }) => ({ state: slug }));
}

export async function generateMetadata({ params }: PageProps<"/explore/[state]">): Promise<Metadata> {
  const { state: slug } = await params;
  const state = getState(slug);
  if (!state) return {};
  return { title: `${state.name} travel guide`, description: state.tagline, alternates: { canonical: `/explore/${slug}` } };
}

export default async function StatePage({ params }: PageProps<"/explore/[state]">) {
  const { state: slug } = await params;
  const state = getState(slug);
  if (!state) notFound();

  const guides = destinationsInState(slug);
  const stateFestivals = festivals.filter((festival) => festival.stateSlugs.includes(slug));
  const stateFoods = foods.filter((food) => food.stateSlugs.includes(slug));

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AdministrativeArea",
          name: state.name,
          description: state.tagline,
          url: `${site.url}/explore/${slug}`,
        }}
      />
      <header className="relative isolate flex min-h-[22rem] items-end overflow-hidden">
        <Photo imageKey={`state:${slug}`} sizes="100vw" priority className="-z-20" />
        <div className="photo-scrim absolute inset-0 -z-10" />
        <div className="container-x pt-20 pb-7 text-white">
          <p className="eyebrow !text-[#f7c26b]">
            {state.kind === "state" ? "State" : "Union Territory"} · {regionName(state.region)}
          </p>
          <h1 className="!text-white">{state.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-white/90">{state.tagline}</p>
        </div>
      </header>

      <div className="container-x py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs items={[{ label: "Explore India", href: "/explore" }, { label: state.name }]} />
          <PhotoCredit imageKey={`state:${slug}`} />
        </div>
        <TranslateBar className="mt-4" />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <div className="prose-guide">
              {state.overview.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
            <h2 className="mt-9 mb-2">Culture</h2>
            <p className="max-w-[70ch] text-ink-2">{state.culture}</p>
            <h2 className="mt-9 mb-3">What draws people here</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-ink-2">
              {state.attractionsSummary.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
            {state.permitNote && (
              <div className="mt-6">
                <Notice title="Permits" tone="warn">
                  {state.permitNote}
                </Notice>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <dl className="card space-y-3 p-5 text-[0.97rem]">
              {[
                ["Capital", state.capital],
                ["Best months", formatMonthRange(state.bestMonths)],
                ["Suggested trip", `${state.recommendedDays.min}–${state.recommendedDays.max} days`],
                ["Languages", state.languages.join(", ")],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="card p-5">
              <h2 className="mb-2 text-xl">Local food</h2>
              <p className="text-[0.97rem] text-ink-2">{state.cuisine.join(", ")}</p>
              {stateFoods.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {stateFoods.map((food) => (
                    <li key={food.slug}>
                      <Link prefetch={false} href={`/culture/food/${food.slug}`} className="chip">{food.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card p-5">
              <h2 className="mb-2 text-xl">Festivals</h2>
              <p className="text-[0.97rem] text-ink-2">{state.festivals.join(", ")}</p>
              {stateFestivals.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {stateFestivals.map((festival) => (
                    <li key={festival.slug}>
                      <Link prefetch={false} href={`/culture/festivals/${festival.slug}`} className="chip">{festival.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {state.tourismUrl && (
              <ExternalLink href={state.tourismUrl} className="btn btn-outline w-full">
                Official tourism site
              </ExternalLink>
            )}
          </aside>
        </div>

        <section className="mt-12 mb-8" aria-labelledby="guides-title">
          <h2 id="guides-title" className="mb-6">Guides in {state.name}</h2>
          {guides.length ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <li key={guide.slug}>
                  <DestinationCard destination={guide} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-2">We have not published a guide here yet.</p>
          )}
        </section>
        <p className="pb-8 text-sm text-muted">
          Last updated {formatDate(state.lastReviewed)}.
          {state.sources.length > 0 && " Sources: "}
          {state.sources.map((source, index) => (
            <span key={source.url}>
              {index > 0 && ", "}
              <ExternalLink href={source.url} className="underline">{source.label}</ExternalLink>
            </span>
          ))}
        </p>
      </div>
    </article>
  );
}
