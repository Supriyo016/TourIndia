import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityPanel } from "@/components/community/CommunityPanel";
import { ArtVideo } from "@/components/culture/ArtVideo";
import { artImages, artVideo } from "@/components/culture/art-media";
import { ExternalLink, JsonLd, PageIntro } from "@/components/ui/primitives";
import { site } from "@/config/site";
import { getState } from "@/data";
import { ART_ARTICLES_REVIEWED, artArticles, articleWords, furtherReading } from "@/data/arts-encyclopedia";
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
  const lead = artImages(slug)[0]?.image;
  return {
    title: `${form.name}: ${CATEGORY[form.category]?.toLowerCase()} of India`,
    description: form.summary,
    alternates: { canonical: `/culture/arts/${slug}` },
    ...(lead ? { openGraph: { images: [{ url: lead.src, width: lead.width, height: lead.height, alt: lead.alt }] } } : {}),
  };
}

export default async function ArtFormPage({ params }: PageProps<"/culture/arts/[slug]">) {
  const { slug } = await params;
  const form = find(slug);
  if (!form) notFound();
  const article = artArticles[slug];
  const images = artImages(slug);
  const lead = images[0];
  const gallery = images.slice(1);
  const video = artVideo(slug);
  const reading = furtherReading(slug, form.stateSlugs);
  const stateList = form.stateSlugs.map(getState).filter((state) => state !== undefined);
  const related = artForms.filter((other) => other.slug !== slug && (other.category === form.category || other.stateSlugs.some((state) => form.stateSlugs.includes(state)))).slice(0, 6);
  const words = article ? articleWords(article) : 0;

  const toc = [
    ...(gallery.length ? [{ id: "gallery", title: "Photos" }] : []),
    { id: "video", title: "Video" },
    ...(article?.sections ?? []).map(({ id, title }) => ({ id, title })),
    { id: "further-reading", title: "Further reading" },
    { id: "credits", title: "Image and video credits" },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: form.name,
          genre: CATEGORY[form.category],
          description: form.summary,
          url: `${site.url}/culture/arts/${slug}`,
          dateModified: ART_ARTICLES_REVIEWED,
          ...(lead ? { image: `${site.url}${lead.image.src}` } : {}),
          locationCreated: stateList.map((state) => ({ "@type": "Place", name: state.name })),
        }}
      />
      <PageIntro
        crumbs={[{ label: "Culture", href: "/culture" }, { label: "Art and traditions", href: "/culture/arts" }, { label: form.name }]}
        eyebrow={CATEGORY[form.category]}
        title={form.name}
        lede={form.summary}
        imageKey={lead?.key}
      />

      <div className="container-x grid gap-10 py-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Contents" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-2 text-sm font-semibold text-muted">Contents</p>
            <ol className="space-y-1.5 border-l border-line pl-3 text-[0.95rem]">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="link-u text-ink-2 hover:text-brand">{item.title}</a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <article className="min-w-0 max-w-3xl">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <dt className="text-sm font-semibold text-muted">Where it comes from</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {stateList.length
                  ? stateList.map((state) => (
                      <Link prefetch={false} key={state.slug} href={`/explore/${state.slug}`} className="chip">
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
          {words > 0 && <p className="mt-3 text-sm text-muted">{words.toLocaleString("en-IN")} words, about {Math.max(1, Math.round(words / 220))} minutes to read. Last reviewed {ART_ARTICLES_REVIEWED}.</p>}

          {gallery.length > 0 && (
            <section id="gallery" aria-labelledby="gallery-title" className="mt-8 scroll-mt-24">
              <h2 id="gallery-title" className="text-2xl">Photos</h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {gallery.map(({ key, image }) => (
                  <li key={key}>
                    <figure>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-surface-2">
                        <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw" placeholder={image.blur ? "blur" : "empty"} blurDataURL={image.blur} className="object-cover" />
                      </div>
                      <figcaption className="mt-1.5 text-sm text-ink-2">{image.alt}</figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="video" aria-labelledby="video-title" className="mt-8 scroll-mt-24">
            <h2 id="video-title" className="text-2xl">Video</h2>
            <div className="mt-3">
              <ArtVideo video={video} name={form.name} poster={lead?.image.src} />
            </div>
          </section>

          {article?.sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="mt-8 scroll-mt-24 border-t border-line pt-6">
              <h2 id={`${section.id}-title`} className="text-2xl">{section.title}</h2>
              <div className="mt-3 space-y-3 text-[1.02rem] leading-relaxed text-ink-2">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section id="further-reading" aria-labelledby="further-reading-title" className="mt-8 scroll-mt-24 border-t border-line pt-6">
            <h2 id="further-reading-title" className="text-2xl">Further reading</h2>
            <ul className="mt-3 space-y-1.5">
              {reading.map((link) => (
                <li key={link.url}>
                  <ExternalLink href={link.url} className="link-text">{link.label}</ExternalLink>
                </li>
              ))}
              {form.wikipediaTitle && (
                <li>
                  <ExternalLink href={`https://en.wikipedia.org/wiki/${encodeURIComponent(form.wikipediaTitle.replace(/ /g, "_"))}`} className="link-text">
                    Wikipedia: {form.wikipediaTitle}
                  </ExternalLink>
                </li>
              )}
            </ul>
          </section>

          <section id="credits" aria-labelledby="credits-title" className="mt-8 scroll-mt-24 border-t border-line pt-6">
            <h2 id="credits-title" className="text-2xl">Image and video credits</h2>
            {images.length === 0 && !video ? (
              <p className="mt-3 text-ink-2">No licensed photos or video yet.</p>
            ) : (
              <ul className="mt-3 space-y-1.5 text-sm text-ink-2">
                {images.map(({ key, image }, index) => (
                  <li key={key}>
                    {index === 0 ? "Top photo" : `Photo ${index}`}: {image.alt}. {image.author},{" "}
                    <ExternalLink href={image.sourceUrl} className="underline">{image.license}</ExternalLink>, via Wikimedia Commons.
                  </li>
                ))}
                {video && (
                  <li>
                    Video: {video.title}. {video.author}, <ExternalLink href={video.sourceUrl} className="underline">{video.license}</ExternalLink>, via Wikimedia Commons.
                  </li>
                )}
              </ul>
            )}
          </section>

          {related.length > 0 && (
            <section aria-labelledby="related-title" className="mt-8 border-t border-line pt-6">
              <h2 id="related-title" className="text-2xl">Related traditions</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {related.map((other) => (
                  <li key={other.slug}>
                    <Link prefetch={false} href={`/culture/arts/${other.slug}`} className="chip">{other.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <CommunityPanel target={{ type: "art", id: slug }} title={form.name} path={`/culture/arts/${slug}`} />
        </article>
      </div>
    </>
  );
}
