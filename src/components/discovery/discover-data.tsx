import { DestinationCard } from "@/components/destinations/DestinationCard";
import { getState } from "@/data";
import type { Destination } from "@/types/content";
import type { DiscoverItem } from "./DiscoverBrowser";

/** Server-rendered list shown before filters load, so guides are in the HTML for crawlers and no-JavaScript visitors. */
export function StaticCardGrid({ list }: { list: Destination[] }) {
  return (
    <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((item) => (
        <li key={item.slug}>
          <DestinationCard destination={item} />
        </li>
      ))}
    </ul>
  );
}

export function toBrowserProps(list: Destination[]) {
  const items: DiscoverItem[] = list.map((item) => ({
    slug: item.slug,
    name: item.name,
    state: getState(item.stateSlug)?.name ?? "",
    region: item.region,
    categories: item.categories,
    months: item.bestMonths,
    maxDays: item.recommendedDays.max,
    midCost: item.budget.midRange[0],
  }));
  const cards = Object.fromEntries(list.map((item) => [item.slug, <DestinationCard key={item.slug} destination={item} />]));
  return { items, cards };
}
