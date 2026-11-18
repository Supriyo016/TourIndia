import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EncyclopediaArticle } from "@/components/community/EncyclopediaArticle";
import { JsonLd } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { destinations, getDestination, getState } from "@/data";
import { categoryName, formatMonthRange, regionName } from "@/data/taxonomy";
import { overridesFor } from "@/features/community/service";
import { applyOverrides } from "@/features/community/targets";
import { chosenImage } from "@/lib/images";

export function generateStaticParams() {
  return destinations.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/encyclopedia/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = getDestination(slug);
  if (!item) return {};
  return {
    title: `${item.name}: encyclopedia`,
    description: `Facts, history and traveller knowledge about ${item.name}, ${getState(item.stateSlug)?.name ?? "India"}. ${item.tagline}`,
    alternates: { canonical: `/encyclopedia/${slug}` },
  };
}

export default async function PlaceEncyclopediaPage({ params }: PageProps<"/encyclopedia/[slug]">) {
  const { slug } = await params;
  const base = getDestination(slug);
  if (!base) notFound();
  const target = { type: "place", id: slug } as const;
  const item = applyOverrides(base, await overridesFor(target));
  const state = getState(item.stateSlug);
  const path = `/encyclopedia/${slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: item.name,
          description: item.tagline,
          url: `${site.url}${path}`,
          geo: { "@type": "GeoCoordinates", latitude: item.coordinates.lat, longitude: item.coordinates.lng },
          containedInPlace: state && { "@type": "AdministrativeArea", name: state.name },
          touristType: item.categories.map(categoryName),
        }}
      />
      <EncyclopediaArticle
        target={target}
        title={item.name}
        summary={item.tagline}
        source={item}
        path={path}
        guide={{ href: `/destinations/${slug}`, label: `Read the full ${item.name} travel guide` }}
        imageKey={chosenImage((item as { image?: unknown }).image, `destination:${slug}`)}
        referenceStem={slug}
        infobox={[
          ["State", state ? <Link prefetch={false} href={`/encyclopedia/states/${state.slug}`} className="link-text">{state.name}</Link> : "—"],
          ["Region", regionName(item.region)],
          ["Coordinates", `${item.coordinates.lat.toFixed(3)}° N, ${item.coordinates.lng.toFixed(3)}° E`],
          ["Best months", formatMonthRange(item.bestMonths)],
          ["Suggested stay", `${item.recommendedDays.min} to ${item.recommendedDays.max} days`],
          ["Known for", item.categories.map(categoryName).join(", ")],
          ["Festivals", item.festivals.join(", ") || "—"],
        ]}
        extra={
          <>
            <section aria-labelledby="attractions-title" className="mt-8 border-t border-line pt-6">
              <h2 id="attractions-title" className="text-2xl">Places to see</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {item.attractions.map((attraction) => (
                  <div key={attraction.name} className="card p-4">
                    <dt className="font-semibold">{attraction.name}</dt>
                    <dd className="mt-1 text-sm text-ink-2">{attraction.description}</dd>
                  </div>
                ))}
              </dl>
            </section>
            {item.faqs.length > 0 && (
              <section aria-labelledby="faq-title" className="mt-8 border-t border-line pt-6">
                <h2 id="faq-title" className="text-2xl">Common questions</h2>
                <div className="mt-3 space-y-2">
                  {item.faqs.map((faq) => (
                    <details key={faq.question} className="card p-4">
                      <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                      <p className="mt-2 text-ink-2">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </>
        }
        sources={[...item.officialLinks, ...item.sources]}
        lastReviewed={item.lastReviewed}
      />
    </>
  );
}
