import type { Metadata } from "next";
import Link from "next/link";
import { ElephantCharacter } from "@/components/characters/Characters";
import { IndiaMap } from "@/components/maps/IndiaMap";
import { MapExplorer } from "@/components/maps/MapExplorer";
import { DestinationPins, statePreviews } from "@/components/maps/map-data";
import { PageIntro, Photo } from "@/components/ui/primitives";
import { states } from "@/data";
import { regions } from "@/data/taxonomy";

export const metadata: Metadata = {
  title: "Explore India by state",
  description: "An interactive map of India's 28 states and 8 Union Territories, with seasons, culture and guides for each.",
  alternates: { canonical: "/explore" },
};

export default function ExplorePage() {
  return (
    <>
      <PageIntro imageKey="hero:ladakh"
        crumbs={[{ label: "Explore India" }]}
        eyebrow="28 states and 8 Union Territories"
        title="Explore India by state"
        lede="Point to a state for a quick summary, or select it for its culture, food, festivals and destination guides."
      />
      <div className="container-x py-6">
          <MapExplorer previews={statePreviews()} initialSlug="rajasthan" markers={<DestinationPins />}>
            <IndiaMap className="h-auto w-full" />
          </MapExplorer>
        <div className="mt-4 flex items-center gap-4">
          <ElephantCharacter className="hidden h-16 w-auto shrink-0 sm:block" />
          <p className="max-w-3xl text-sm text-muted">
            Boundaries are shown for navigation only and are not an authoritative depiction of India&apos;s external boundaries. See{" "}
            <Link prefetch={false} href="/credits#map-data" className="underline">map data credits</Link>.
          </p>
        </div>

        <section className="lazy-render mt-12" aria-labelledby="all-states">
          <h2 id="all-states" className="mb-6">All states and Union Territories</h2>
          <div className="space-y-8">
            {regions.map((region) => (
              <div key={region.id} className="grid gap-3 lg:grid-cols-[14rem_1fr]">
                <div>
                  <h3>{region.name}</h3>
                  <p className="text-[0.95rem] text-muted">{region.blurb}</p>
                </div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {states
                    .filter((state) => state.region === region.id)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((state) => (
                      <li key={state.slug} data-tilt className="zoom-media relative aspect-[3/2] overflow-hidden rounded-[var(--radius-md)] bg-brand-soft">
                        <Photo imageKey={`state:${state.slug}`} sizes="(min-width: 1280px) 16vw, (min-width: 640px) 30vw, 46vw" />
                        <div aria-hidden className="photo-scrim absolute inset-0" />
                        <Link prefetch={false} href={`/explore/${state.slug}`} className="absolute inset-0 flex items-end p-3 font-semibold text-white">
                          {state.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
