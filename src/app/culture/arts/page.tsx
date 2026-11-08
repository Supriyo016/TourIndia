import type { Metadata } from "next";
import { DancerCharacter } from "@/components/characters/Characters";
import { PageIntro } from "@/components/ui/primitives";
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

export default function ArtsPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Culture", href: "/culture" }, { label: "Art and traditions" }]} eyebrow="Living traditions" title="Art and traditions" lede="What to look for, what it means, and where you can see it practised." />
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
              <ul className="grid gap-4 md:grid-cols-2">
                {artForms.filter((form) => form.category === group.id).map((form) => (
                  <li key={form.slug} className="card p-4">
                    <h3 className="text-lg">{form.name}</h3>
                    <p className="text-sm text-muted">{form.stateSlugs.map((slug) => getState(slug)?.name).filter(Boolean).join(", ")}</p>
                    <p className="mt-1.5 text-[0.97rem] text-ink-2">{form.summary}</p>
                    <p className="mt-2 text-[0.95rem] text-ink-2"><span className="font-semibold text-ink">Where: </span>{form.whereToExperience}</p>
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
