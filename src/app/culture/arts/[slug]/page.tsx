import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityPanel } from "@/components/community/CommunityPanel";
import { Breadcrumbs, ExternalLink, JsonLd } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { getState } from "@/data";
import { artForms } from "@/data/arts";

const find = (slug: string) => artForms.find((form) => form.slug === slug);
const CATEGORY: Record<string, string> = {
  "classical-dance": "Classical dance",
  "folk-dance": "Folk dance",
  music: "Music",
  handicraft: "Craft",
  clothing: "Dress and textiles",
  painting: "Painting",
  language: "Language and literature",
  custom: "Custom and tradition",
};

export function generateStaticParams() {
  return artForms.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/culture/arts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const form = find(slug);
  if (!form) return {};
  return { title: `${form.name}: ${CATEGORY[form.category]?.toLowerCase()} of India`, description: form.summary, alternates: { canonical: `/culture/arts/${slug}` } };
}

export default async function ArtFormPage({ params }: PageProps<"/culture/arts/[slug]">) {
  const { slug } = await params;
  const form = find(slug);
  if (!form) notFound();
  const stateList = form.stateSlugs.map(getState).filter((state) => state !== undefined);
  const related = artForms.filter((other) => other.slug !== slug && (other.category === form.category || other.stateSlugs.some((state) => form.stateSlugs.includes(state)))).slice(0, 6);

  return (
    <article className="container-x max-w-4xl py-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CreativeWork", name: form.name, genre: CATEGORY[form.category], description: form.summary, url: `${site.url}/culture/arts/${slug}`, locationCreated: stateList.map((state) => ({ "@type": "Place", name: state.name })) }} />
      <Breadcrumbs items={[{ label: "Culture", href: "/culture" }, { label: "Art and traditions", href: "/culture/arts" }, { label: form.name }]} />
      <p className="mt-6 text-sm font-semibold text-accent-ink">{CATEGORY[form.category]}</p>
      <h1 className="mt-1">{form.name}</h1>
      <p className="mt-4 max-w-prose text-lg text-ink-2">{form.summary}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-4">
          <dt className="text-sm font-semibold text-muted">Where it comes from</dt>
          <dd className="mt-1 flex flex-wrap gap-2">
            {stateList.length
              ? stateList.map((state) => (
                  <Link key={state.slug} href={`/explore/${state.slug}`} className="chip">
                    {state.name}
                  </Link>
                ))
              : "Found across India"}
          </dd>
        </div>
        <div className="card p-4">
          <dt className="text-sm font-semibold text-muted">Where to experience it</dt>
          <dd className="mt-1 text-ink-2">{form.whereToExperience}</dd>
        </div>
      </dl>
      {form.wikipediaTitle && (
        <p className="mt-4 text-sm">
          Read more on <ExternalLink href={`https://en.wikipedia.org/wiki/${encodeURIComponent(form.wikipediaTitle.replace(/ /g, "_"))}`} className="link-text">Wikipedia</ExternalLink>.
        </p>
      )}
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-8">
          <h2 id="related-title" className="text-xl">Related traditions</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((other) => (
              <li key={other.slug}>
                <Link href={`/culture/arts/${other.slug}`} className="chip">{other.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <CommunityPanel target={{ type: "art", id: slug }} title={form.name} path={`/culture/arts/${slug}`} />
    </article>
  );
}
