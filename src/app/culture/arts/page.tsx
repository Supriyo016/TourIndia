import type { Metadata } from "next";
import Link from "next/link";
import { DancerCharacter } from "@/components/characters/lazy";
import { PageIntro, Photo } from "@/components/ui/primitives";
import { getState } from "@/data";
import { artForms } from "@/data/arts";
import type { ArtCategory } from "@/types/content";

export const metadata: Metadata = {
  title: "Traditional art and culture of India",
  description: "Classical and folk dance, music, handicrafts, dress, painting, languages and regional customs from across India.",
  alternates: { canonical: "/culture/arts" },
};

const groups: { id: ArtCategory; title: string }[] = [
  { id: "classical-dance", title: "Classical dance" },
  { id: "folk-dance", title: "Folk dance" },
  { id: "music", title: "Music" },
  { id: "handicraft", title: "Handicrafts" },
  { id: "clothing", title: "Traditional clothing" },
  { id: "painting", title: "Painting" },
  { id: "language", title: "Languages and scripts" },
  { id: "custom", title: "Regional customs" },
];

/** The first sentence of a summary, for the card. */
const oneLine = (text: string) => text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;

export default function ArtsPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Culture", href: "/culture" }, { label: "Art and traditions" }]} eyebrow="Living traditions" title="Art and traditions" lede="What to look for, what it means, and where you can see it practised: photos, film with sound where a free licence allows, and a full article for each tradition." imageKey="art:kathakali" />
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <DancerCharacter className="mb-3 h-28 w-auto" />
            <ul className="space-y-1">
              {groups.map((group) => (
                <li key={group.id}><a href={`#${group.id}`} className="link-u text-ink-2 hover:text-brand">{group.title}</a></li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="min-w-0 space-y-12">
          {groups.map((group) => (
            <section key={group.id} id={group.id} aria-labelledby={`${group.id}-h`}>
              <h2 id={`${group.id}-h`} className="mb-4">{group.title}</h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {artForms.filter((form) => form.category === group.id).map((form) => (
                  <li key={form.slug} data-tilt className="card card-hover relative flex flex-col overflow-hidden">
                    <div className="relative aspect-[3/2] bg-brand-soft">
                      <Photo imageKey={`art:${form.slug}`} alt="" sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 100vw" />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-lg"><Link prefetch={false} href={`/culture/arts/${form.slug}`} className="after:absolute after:inset-0">{form.name}</Link></h3>
                      <p className="text-sm text-muted">{form.stateSlugs.map((slug) => getState(slug)?.name).filter(Boolean).join(", ") || "Across India"}</p>
                      <p className="mt-1.5 text-[0.97rem] text-ink-2">{oneLine(form.summary)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
