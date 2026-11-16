import type { Destination, StateProfile } from "@/types/content";
import { northDestinations } from "./destinations/north";
import { westSouthDestinations } from "./destinations/west-south";
import { eastIslandDestinations } from "./destinations/east-islands";
import { northeastDestinations } from "./destinations/northeast";
import { states } from "./states";

export const destinations: Destination[] = [
  ...northDestinations,
  ...westSouthDestinations,
  ...eastIslandDestinations,
  ...northeastDestinations,
].sort((a, b) => a.name.localeCompare(b.name));

export { states };

const destinationBySlug = new Map(destinations.map((item) => [item.slug, item]));
const stateBySlug = new Map(states.map((item) => [item.slug, item]));

export function getDestination(slug: string): Destination | undefined {
  return destinationBySlug.get(slug);
}

export function getState(slug: string): StateProfile | undefined {
  return stateBySlug.get(slug);
}

export function destinationsInState(stateSlug: string): Destination[] {
  return destinations.filter((item) => item.stateSlug === stateSlug);
}

export function inSeason(month: number): Destination[] {
  return destinations.filter((item) => item.bestMonths.includes(month as never));
}

/** Other guides sharing the most categories, preferring a different state. */
export function similarDestinations(destination: Destination, limit = 3): Destination[] {
  return destinations
    .filter((item) => item.slug !== destination.slug)
    .map((item) => ({
      item,
      score:
        item.categories.filter((category) => destination.categories.includes(category)).length * 2 +
        (item.region === destination.region ? 1 : 0) -
        (item.stateSlug === destination.stateSlug ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)
    .map(({ item }) => item);
}
