import type { Metadata } from "next";
import { toBrowserProps } from "@/components/discovery/discover-data";
import { PageIntro } from "@/components/ui/primitives";
import { SavedDashboard } from "@/components/user/SavedDashboard";
import { destinations, states } from "@/data";

export const metadata: Metadata = {
  title: "Saved places and travel passport",
  description: "Your wishlist, collections, saved trips, recently viewed guides and India travel passport.",
  alternates: { canonical: "/saved" },
  robots: { index: false },
};

export default function SavedPage() {
  return (
    <>
      <PageIntro imageKey="destination:alappuzha" crumbs={[{ label: "Saved" }]} eyebrow="Yours" title="Saved places and passport" lede="No account needed: without one, everything stays in this browser. Sign in and your saved places, collections and passport follow you to any device." />
      <div className="container-x py-10">
        <SavedDashboard
          cards={toBrowserProps(destinations).cards}
          names={Object.fromEntries(destinations.map((d) => [d.slug, d.name]))}
          stateList={[...states].sort((a, b) => a.name.localeCompare(b.name)).map(({ slug, name, region }) => ({ slug, name, region }))}
        />
      </div>
    </>
  );
}
