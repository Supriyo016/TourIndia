import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EncyclopediaArticle } from "@/components/community/EncyclopediaArticle";
import { JsonLd } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { destinationsInState, getState } from "@/data";
import { states } from "@/data/states";
import { formatMonthRange, regionName } from "@/data/taxonomy";
import { overridesFor } from "@/features/community/service";
import { applyOverrides } from "@/features/community/targets";

export function generateStaticParams() {
  return states.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/encyclopedia/states/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = getState(slug);
  if (!item) return {};
  return {
    title: `${item.name}: encyclopedia`,
    description: `Capital, languages, culture and traveller knowledge about ${item.name}. ${item.tagline}`,
    alternates: { canonical: `/encyclopedia/states/${slug}` },
  };
}

export default async function StateEncyclopediaPage({ params }: PageProps<"/encyclopedia/states/[slug]">) {
  const { slug } = await params;
  const base = getState(slug);
  if (!base) notFound();
  const target = { type: "state", id: slug } as const;
  const item = applyOverrides(base, await overridesFor(target));
  const places = destinationsInState(slug);
  const path = `/encyclopedia/states/${slug}`;

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "AdministrativeArea", name: item.name, description: item.tagline, url: `${site.url}${path}`, containedInPlace: { "@type": "Country", name: "India" } }} />
      <EncyclopediaArticle
        target={target}
        title={item.name}
        summary={item.tagline}
        source={item}
        path={path}
        guide={{ href: `/explore/${slug}`, label: `Explore ${item.name} on the map` }}
        imageKey={`state:${slug}`}
        infobox={[
          ["Type", item.kind === "state" ? "State" : "Union Territory"],
          ["Capital", item.capital],
          ["Region", regionName(item.region)],
          ["Languages", item.languages.join(", ")],
          ["Best months", formatMonthRange(item.bestMonths)],
          ["Suggested stay", `${item.recommendedDays.min} to ${item.recommendedDays.max} days`],
        ]}
        extra={
          places.length > 0 && (
            <section aria-labelledby="places-title" className="mt-8 border-t border-line pt-6">
              <h2 id="places-title" className="text-2xl">Places in {item.name}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {places.map((place) => (
                  <li key={place.slug}>
                    <Link href={`/encyclopedia/${place.slug}`} className="chip">
                      {place.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        }
        sources={item.sources}
        lastReviewed={item.lastReviewed}
      />
    </>
  );
}
