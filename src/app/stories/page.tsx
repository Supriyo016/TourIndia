import type { Metadata } from "next";
import Link from "next/link";
import { StoryForm } from "@/components/forms/Forms";
import { PageIntro, Photo } from "@/components/ui/primitives";
import { stories } from "@/data/stories";
import { getApprovedStories } from "@/features/user/community-stories";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Travel stories and guides",
  description: "Practical guides for travelling in India, and experiences shared by readers.",
  alternates: { canonical: "/stories" },
};

export default async function StoriesPage() {
  const community = await getApprovedStories();
  return (
    <>
      <PageIntro crumbs={[{ label: "Travel stories" }]} eyebrow="Read" title="Travel stories" lede="Practical guides from Tour India, and accounts from readers once they have been reviewed." />
      <div className="container-x py-10">
        <h2 className="mb-6">Guides</h2>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <li key={story.slug} className="card card-hover overflow-hidden">
              <div className="zoom-media relative aspect-[16/9]">
                <Photo imageKey={`story:${story.slug}`} sizes="(min-width: 1024px) 30vw, 92vw" />
              </div>
              <div className="p-4">
                <p className="text-sm text-muted">{story.category} · {story.readingMinutes} min read</p>
                <h3 className="mt-1 text-lg"><Link href={`/stories/${story.slug}`} className="after:absolute after:inset-0">{story.title}</Link></h3>
                <p className="mt-1 text-[0.97rem] text-ink-2">{story.dek}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="community">
            <h2 id="community">From readers</h2>
            {community.length === 0 ? (
              <p className="mt-3 text-ink-2">No reader stories have been published yet. Yours could be the first.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {community.map((story) => (
                  <li key={story.id}>
                    <details className="card p-4">
                      <summary className="cursor-pointer font-semibold">{story.title}</summary>
                      <p className="mt-1 text-sm text-muted">{story.name} · {story.destination} · {formatDate(story.publishedOn)}</p>
                      <p className="mt-2 whitespace-pre-line text-ink-2">{story.story}</p>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="card p-6" aria-labelledby="share">
            <h2 id="share" className="text-2xl">Share your experience</h2>
            <p className="mt-2 mb-4 text-ink-2">
              Stories are read before they appear, and we may edit them for length. See how we handle <Link href="/privacy" className="link-text">your details</Link>.
            </p>
            <StoryForm />
          </section>
        </div>
      </div>
    </>
  );
}
