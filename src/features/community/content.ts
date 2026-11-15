import "server-only";
import { getDestination, getState } from "@/data";
import { artForms } from "@/data/arts";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { stories } from "@/data/stories";
import { EDITABLE_FIELDS, readField, type Target, type TargetType } from "./targets";

const SLUGS: Record<TargetType, Set<string>> = {
  place: new Set(), // checked with getDestination
  state: new Set(), // checked with getState
  story: new Set(stories.map((item) => item.slug)),
  festival: new Set(festivals.map((item) => item.slug)),
  food: new Set(foods.map((item) => item.slug)),
  art: new Set(artForms.map((item) => item.slug)),
};

/** The content behind a target, or undefined if no such page exists. */
export function contentFor(target: Target): { title: string; path: string; source: object } | undefined {
  switch (target.type) {
    case "place": {
      const item = getDestination(target.id);
      return item && { title: item.name, path: `/encyclopedia/${item.slug}`, source: item };
    }
    case "state": {
      const item = getState(target.id);
      return item && { title: item.name, path: `/encyclopedia/states/${item.slug}`, source: item };
    }
    default: {
      if (!SLUGS[target.type].has(target.id)) return undefined;
      const paths: Record<string, string> = { story: "/stories/", festival: "/culture/festivals/", food: "/culture/food/", art: "/culture/arts/" };
      const list: { slug: string; name?: string; title?: string }[] = { story: stories, festival: festivals, food: foods, art: artForms }[target.type];
      const item = list.find((entry) => entry.slug === target.id)!;
      return { title: item.name ?? item.title ?? target.id, path: `${paths[target.type]}${target.id}`, source: item };
    }
  }
}

export function currentFieldValue(target: Target, field: string): unknown {
  const fields = EDITABLE_FIELDS[target.type];
  const content = contentFor(target);
  if (!fields || !Object.hasOwn(fields, field) || !content) return undefined;
  return readField(content.source, field);
}
