import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareBar } from "@/components/destinations/ClientWidgets";
import { Breadcrumbs, ExternalLink, JsonLd, Photo, PhotoCredit } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { getDestination } from "@/data";
import { stories } from "@/data/stories";
import { formatDate } from "@/lib/utils";

const find = (slug: string) => stories.find((story) => story.slug === slug);

export function generateStaticParams() {
  return stories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const story = find(slug);
  if (!story) return {};
  return { title: story.title, description: story.dek, alternates: { canonical: `/stories/${slug}` }, openGraph: { type: "article", title: story.title, description: story.dek } };
}

export default async function StoryPage({ params }: PageProps<"/stories/[slug]">) {
  const { slug } = await params;
  const story = find(slug);
  if (!story) notFound();
  const related = story.relatedDestinationSlugs.map((item) => getDestination(item)).filter((item) => item !== undefined);

  return (
    <article className="container-x max-w-3xl py-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: story.title,
          description: story.dek,
          datePublished: story.publishedOn,
          author: { "@type": "Organization", name: site.name },
        }}
      />
      <Breadcrumbs items={[{ label: "Travel stories", href: "/stories" }, { label: story.title }]} />
      <p className="eyebrow mt-5 mb-1">{story.category}</p>
      <h1 className="!text-[clamp(2rem,1.5rem+2.2vw,3.2rem)]">{story.title}</h1>
      <p className="lede mt-3">{story.dek}</p>
      <p className="mt-3 text-sm text-muted">Tour India guide · {formatDate(story.publishedOn)} · {story.readingMinutes} min read</p>
      <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)]">
        <Photo imageKey={`story:${story.slug}`} sizes="(min-width: 768px) 48rem, 100vw" priority />
      </div>
      <PhotoCredit imageKey={`story:${story.slug}`} className="mt-1.5" />

      <div className="prose-guide mt-7">
        {story.body.map((section, index) => (
          <section key={section.heading ?? index} className="mt-7 first:mt-0">
            {section.heading && <h2 className="mb-2 !text-2xl">{section.heading}</h2>}
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>

      <div className="mt-8"><ShareBar title={story.title} path={`/stories/${story.slug}`} /></div>

      {related.length > 0 && (
        <p className="mt-6 text-[0.97rem]">
          <span className="font-semibold">Related guides: </span>
          {related.map((item, index) => (
            <span key={item.slug}>
              {index > 0 && ", "}
              <Link href={`/destinations/${item.slug}`} className="link-text">{item.name}</Link>
            </span>
          ))}
        </p>
      )}
      {story.sources.length > 0 && (
        <p className="mt-3 text-sm text-muted">
          Sources:{" "}
          {story.sources.map((source, index) => (
            <span key={source.url}>
              {index > 0 && ", "}
              <ExternalLink href={source.url} className="underline">{source.label}</ExternalLink>
            </span>
          ))}
        </p>
      )}
    </article>
  );
}
