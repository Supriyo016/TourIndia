import type { Metadata } from "next";
import Link from "next/link";
import { HistorianCharacter } from "@/components/characters/Characters";
import { ExternalLink, Notice, PageIntro, Photo } from "@/components/ui/primitives";
import { getDestination, getState } from "@/data";
import { museumsAndSites, unescoSites } from "@/data/heritage";

export const metadata: Metadata = {
  title: "Indian heritage explorer",
  description: "India's UNESCO World Heritage Sites, museums, forts, palaces and archaeological sites.",
  alternates: { canonical: "/culture/heritage" },
};

const imageSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const kindLabel = { museum: "Museum", "archaeological-site": "Archaeological site", monument: "Monument", "fort-palace": "Fort or palace" } as const;

export default function HeritagePage() {
  const sites = [...unescoSites].sort((a, b) => a.yearInscribed - b.yearInscribed || a.name.localeCompare(b.name));
  return (
    <>
      <PageIntro imageKey="unesco:group-of-monuments-at-hampi" crumbs={[{ label: "Culture", href: "/culture" }, { label: "Heritage" }]} eyebrow="Heritage explorer" title="India's heritage" lede={`This list has ${sites.length} World Heritage Sites, ordered by year of inscription, followed by museums and historic sites.`} />
      <div className="container-x py-10">
        <div className="mb-6 flex items-center gap-5">
          <HistorianCharacter className="hidden h-24 w-auto shrink-0 sm:block" />
          <Notice>
            The World Heritage List changes each year. For the current official list, see{" "}
            <ExternalLink href="https://whc.unesco.org/en/statesparties/in" className="link-text">UNESCO&apos;s India page</ExternalLink>.
          </Notice>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <li key={site.unescoId} className="card card-hover flex flex-col overflow-hidden">
              <div className="zoom-media relative aspect-[16/9]">
                <Photo imageKey={`unesco:${imageSlug(site.name)}`} sizes="(min-width: 1024px) 30vw, 92vw" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-1 flex flex-wrap gap-1.5">
                  <span className="tag capitalize">{site.kind}</span>
                  <span className="tag">{site.yearInscribed}</span>
                </div>
                <h2 className="text-lg">{site.name}</h2>
                <p className="text-sm text-muted">{site.stateSlugs.map((slug) => getState(slug)?.name).filter(Boolean).join(", ")}</p>
                <p className="mt-1.5 flex-1 text-[0.97rem] text-ink-2">{site.summary}</p>
                <p className="mt-3 flex flex-wrap gap-x-4 text-[0.95rem]">
                  {site.destinationSlug && getDestination(site.destinationSlug) && (
                    <Link prefetch={false} href={`/destinations/${site.destinationSlug}`} className="link-text">Read the guide</Link>
                  )}
                  <ExternalLink href={`https://whc.unesco.org/en/list/${site.unescoId}`} className="link-text">UNESCO entry</ExternalLink>
                </p>
              </div>
            </li>
          ))}
        </ul>

        <section className="mt-14" aria-labelledby="museums">
          <h2 id="museums" className="mb-6">Museums, forts and archaeological sites</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {museumsAndSites.map((item) => (
              <li key={item.name} className="card p-4">
                <span className="tag">{kindLabel[item.kind]}</span>
                <h3 className="mt-1.5 text-lg">{item.name}</h3>
                <p className="text-sm text-muted">{item.city}, {getState(item.stateSlug)?.name}</p>
                <p className="mt-1.5 text-[0.97rem] text-ink-2">{item.summary}</p>
                {item.officialUrl && <ExternalLink href={item.officialUrl} className="link-text mt-2 inline-block text-[0.95rem]">Official site</ExternalLink>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
