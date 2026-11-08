import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DiscoverBrowser } from "@/components/discovery/DiscoverBrowser";
import { StaticCardGrid, toBrowserProps } from "@/components/discovery/discover-data";
import { PageIntro } from "@/components/ui/primitives";
import { destinations } from "@/data";
import { categories } from "@/data/taxonomy";

export const metadata: Metadata = {
  title: "Discover destinations in India",
  description: "Filter Tour India's destination guides by region, travel style, month and trip length.",
  alternates: { canonical: "/discover" },
};

export default function DiscoverPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ label: "Discover" }]}
        eyebrow="Destination guides"
        title="Discover India"
        lede="Each guide covers when to go, what it costs, how to get there and what to watch out for. Filter by the month you can travel, and only places in season will remain."
      >
        <nav aria-label="Travel styles" className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link key={category.id} href={`/discover/${category.id}`} className="chip">
              {category.name}
            </Link>
          ))}
        </nav>
      </PageIntro>
      <div className="container-x py-8">
        <Suspense fallback={<StaticCardGrid list={destinations} />}>
          <DiscoverBrowser {...toBrowserProps(destinations)} categoryOptions={categories.map(({ id, name }) => ({ id, name }))} />
        </Suspense>
      </div>
    </>
  );
}
