import type { Metadata } from "next";
import { toBrowserProps } from "@/components/discovery/discover-data";
import { PageIntro } from "@/components/ui/primitives";
import { SavedDashboard } from "@/components/user/SavedDashboard";
import { destinations, states } from "@/data";

export const metadata: Metadata = {
  title: "Saved places and travel passport",
  description: "Your wishlist, saved trips, recently viewed guides and India travel passport, stored on this device.",
  alternates: { canonical: "/saved" },
  robots: { index: false },
};

export default function SavedPage() {
  return (
    <>
      <PageIntro imageKey="destination:alappuzha" crumbs={[{ label: "Saved" }]} eyebrow="Yours" title="Saved places and passport" lede="Everything here stays in this browser. No account is needed, and clearing your browser data removes it." />
      <div className="container-x py-10">
        <SavedDashboard
          cards={toBrowserProps(destinations).cards}
          stateList={[...states].sort((a, b) => a.name.localeCompare(b.name)).map(({ slug, name, region }) => ({ slug, name, region }))}
        />
      </div>
    </>
  );
}
