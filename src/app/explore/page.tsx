import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ElephantCharacter } from "@/components/characters/Characters";
import { IndiaMap } from "@/components/maps/IndiaMap";
import { MapExplorer } from "@/components/maps/MapExplorer";
import { DestinationPins, statePreviews } from "@/components/maps/map-data";
import { PageIntro } from "@/components/ui/primitives";
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
      <PageIntro
        crumbs={[{ label: "Explore India" }]}
        eyebrow="28 states and 8 Union Territories"
        title="Explore India by state"
        lede="Point to a state for a quick summary, or select it for its culture, food, festivals and destination guides."
      />
      <div className="container-x py-8">
        <Suspense fallback={<IndiaMap className="mx-auto h-auto w-full max-w-[42rem]" />}>
          <MapExplorer previews={statePreviews()} initialSlug="rajasthan" markers={<DestinationPins />}>
            <IndiaMap className="h-auto w-full" />
          </MapExplorer>
        </Suspense>
        <div className="mt-4 flex items-center gap-4">
          <ElephantCharacter className="hidden h-16 w-auto shrink-0 sm:block" />
          <p className="max-w-3xl text-sm text-muted">
            Boundaries are shown for navigation only and are not an authoritative depiction of India&apos;s external boundaries. See{" "}
            <Link href="/credits#map-data" className="underline">map data credits</Link>.
          </p>
        </div>

        <section className="mt-12" aria-labelledby="all-states">
          <h2 id="all-states" className="mb-6">All states and Union Territories</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <div key={region.id}>
                <h3>{region.name}</h3>
                <p className="mb-2 text-[0.95rem] text-muted">{region.blurb}</p>
                <ul className="space-y-0.5">
                  {states
                    .filter((state) => state.region === region.id)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((state) => (
                      <li key={state.slug}>
                        <Link href={`/explore/${state.slug}`} className="link-text inline-flex min-h-8 items-center">
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
