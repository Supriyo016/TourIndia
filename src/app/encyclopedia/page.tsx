import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/primitives";
import { destinations } from "@/data";
import { states } from "@/data/states";
import { regions } from "@/data/taxonomy";

export const metadata: Metadata = {
  title: "Encyclopedia of places in India",
  description: "An entry for every state, Union Territory and destination on Tour India, with facts, history and corrections from travellers, checked by an editor.",
  alternates: { canonical: "/encyclopedia" },
};

export default function EncyclopediaIndexPage() {
  return (
    <>
      <PageIntro imageKey="unesco:archaeological-site-of-nalanda-mahavihara-at-nalanda-bihar"
        crumbs={[{ label: "Encyclopedia" }]}
        title="Encyclopedia"
        lede="An entry for every state, Union Territory and place in our guides. Anyone signed in can suggest a correction; an editor checks each one before it appears."
      />
      <div className="container-x pb-16">
        {regions.map((region) => {
          const regionStates = states.filter((state) => state.region === region.id);
          const places = destinations.filter((place) => place.region === region.id);
          if (!regionStates.length && !places.length) return null;
          return (
            <section key={region.id} aria-labelledby={`${region.id}-title`} className="border-t border-line py-8">
              <h2 id={`${region.id}-title`} className="text-2xl">{region.name}</h2>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-base font-semibold text-muted">States and Union Territories</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {regionStates.map((state) => (
                      <li key={state.slug}>
                        <Link href={`/encyclopedia/states/${state.slug}`} className="chip">{state.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-muted">Places</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {places.map((place) => (
                      <li key={place.slug}>
                        <Link href={`/encyclopedia/${place.slug}`} className="chip">{place.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
