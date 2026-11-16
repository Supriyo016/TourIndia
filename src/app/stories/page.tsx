import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Lightbulb, PenLine, ShieldCheck } from "lucide-react";
import { CameraCharacter } from "@/components/characters/Characters";
import { StoryForm } from "@/components/forms/Forms";
import { PageIntro, Photo } from "@/components/ui/primitives";
import { stories } from "@/data/stories";
import { getApprovedStories } from "@/features/user/community-stories";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

const readerSteps = [
  ["Write", "Tell us where you went and what you'd want the next traveller to know.", PenLine],
  ["We review", "A person reads every story for accuracy and respect before it appears.", ShieldCheck],
  ["Published", "It appears here with your first name and the place you visited.", CheckCircle2],
] as const;

const storyIdeas = [
  "Your first long train journey",
  "A festival you joined as a visitor",
  "A dish you still think about",
  "A quieter place others should know",
  "Something you wish you had packed",
  "A local guide or host who made the trip",
];

export const metadata: Metadata = {
  title: "Travel stories and guides",
  description: "Practical guides for travelling in India, and experiences shared by readers.",
  alternates: { canonical: "/stories" },
};

export default async function StoriesPage() {
  const community = await getApprovedStories();
  return (
    <>
      <PageIntro imageKey="unesco:mountain-railways-of-india" crumbs={[{ label: "Travel stories" }]} eyebrow="Read" title="Travel stories" lede="Practical guides from Tour India, and accounts from readers once they have been reviewed." />
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

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-2">
          <section aria-labelledby="community" className="flex flex-col">
            <h2 id="community">From readers</h2>
            {community.length === 0 ? (
              <div className="mt-4 flex flex-1 flex-col gap-4">
                <p className="text-ink-2">No reader stories have been published yet. Yours could be the first.</p>
                <ol className="grid gap-3 sm:grid-cols-3">
                  {readerSteps.map(([title, body, Icon], index) => (
                    <li key={title} className="card p-4">
                      <Icon className="size-6 text-accent-ink" aria-hidden />
                      <p className="mt-2 font-semibold">{index + 1}. {title}</p>
                      <p className="mt-1 text-[0.93rem] text-ink-2">{body}</p>
                    </li>
                  ))}
                </ol>
                <div className="card relative flex-1 overflow-hidden p-5">
                  <h3 className="text-lg">Not sure what to write about?</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {storyIdeas.map((idea) => (
                      <li key={idea} className="flex items-start gap-2 text-[0.95rem] text-ink-2">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden /> {idea}
                      </li>
                    ))}
                  </ul>
                  <CameraCharacter className="mt-4 ml-auto h-20 w-auto" />
                </div>
              </div>
            ) : (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {community.map((story) => (
                  <li key={story.id}>
                    <details className="card h-full p-4">
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
