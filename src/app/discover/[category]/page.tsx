import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BoatCharacter, HistorianCharacter, MountaineerCharacter, TigerCharacter } from "@/components/characters/lazy";
import { DiscoverBrowser } from "@/components/discovery/DiscoverBrowser";
import type { CategoryId } from "@/types/content";
import { StaticCardGrid, toBrowserProps } from "@/components/discovery/discover-data";
import { PageIntro } from "@/components/ui/primitives";
import { destinations } from "@/data";
import { categories } from "@/data/taxonomy";
import { categoryImage } from "@/config/category-images";



const find = (id: string) => categories.find((category) => category.id === id);

const categoryArt: Partial<Record<CategoryId, typeof BoatCharacter>> = {
  mountains: MountaineerCharacter,
  adventure: MountaineerCharacter,
  lakes: BoatCharacter,
  beaches: BoatCharacter,
  wildlife: TigerCharacter,
  "national-parks": TigerCharacter,
  monuments: HistorianCharacter,
};

export function generateStaticParams() {
  return categories.map(({ id }) => ({ category: id }));
}

export async function generateMetadata({ params }: PageProps<"/discover/[category]">): Promise<Metadata> {
  const { category } = await params;
  const match = find(category);
  if (!match) return {};
  return {
    title: `${match.name} in India`,
    description: match.blurb,
    alternates: { canonical: `/discover/${category}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/discover/[category]">) {
  const { category } = await params;
  const match = find(category);
  if (!match) notFound();
  const list = destinations.filter((item) => item.categories.includes(match.id));
  const Art = categoryArt[match.id];

  return (
    <>
      <PageIntro imageKey={categoryImage[match.id]} crumbs={[{ label: "Discover", href: "/discover" }, { label: match.name }]} eyebrow="Travel style" title={`${match.name} in India`} lede={match.blurb}>
        {Art && <Art className="mt-4 h-20 w-auto" />}
      </PageIntro>
      <div className="container-x py-8">
        <Suspense fallback={<StaticCardGrid list={list} />}>
          <DiscoverBrowser {...toBrowserProps(list)} />
        </Suspense>
      </div>
    </>
  );
}
