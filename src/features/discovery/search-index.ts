import { destinations, states, getState } from "@/data";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { categories, regions } from "@/data/taxonomy";
import type { SearchEntry } from "./search";

export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const item of destinations) {
    const state = getState(item.stateSlug);
    entries.push({
      type: "Destination",
      title: item.name,
      subtitle: state?.name ?? "",
      href: `/destinations/${item.slug}`,
      keywords: [state?.name, item.region, ...item.categories, ...item.attractions.map((a) => a.name)].join(" "),
    });
    for (const attraction of item.attractions) {
      entries.push({
        type: "Experience",
        title: attraction.name,
        subtitle: `In ${item.name}`,
        href: `/destinations/${item.slug}#attractions`,
        keywords: `${item.name} ${attraction.interests.join(" ")}`,
      });
    }
  }
  for (const item of states) {
    entries.push({
      type: "State",
      title: item.name,
      subtitle: item.kind === "state" ? "State" : "Union Territory",
      href: `/explore/${item.slug}`,
      keywords: `${item.capital} ${item.region} ${item.cuisine.join(" ")} ${item.festivals.join(" ")}`,
    });
  }
  for (const item of regions) {
    entries.push({ type: "Region", title: item.name, subtitle: item.blurb, href: `/explore?region=${item.id}`, keywords: item.id });
  }
  for (const item of categories) {
    entries.push({ type: "Travel style", title: item.name, subtitle: item.blurb, href: `/discover/${item.id}`, keywords: item.id.replace(/-/g, " ") });
  }
  for (const item of festivals) {
    entries.push({ type: "Festival", title: item.name, subtitle: item.dateRule, href: `/culture/festivals/${item.slug}`, keywords: item.theme });
  }
  for (const item of foods) {
    entries.push({ type: "Food", title: item.name, subtitle: "Regional dish", href: `/culture/food/${item.slug}`, keywords: `${item.ingredients.join(" ")} ${item.region}` });
  }
  return entries;
}
