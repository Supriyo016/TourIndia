import "server-only";
import { destinations, states } from "@/data";
import { allImages, getImage, type ImageKey } from "@/lib/images";

/** Places a memory can be about, and the gallery photos it can use. Server-only: the guide is large. */

export interface PlaceOption {
  value: string;
  label: string;
}

const PLACE_NAMES = new Map<string, string>([
  ...destinations.map((d) => [`place:${d.slug}`, d.name] as const),
  ...states.map((s) => [`state:${s.slug}`, s.name] as const),
]);

export const placeName = (value: string) => (value ? (PLACE_NAMES.get(value) ?? null) : null);
export const isKnownPlace = (value: string) => !value || PLACE_NAMES.has(value);

export function placeOptions(): { places: PlaceOption[]; states: PlaceOption[] } {
  const byName = (a: PlaceOption, b: PlaceOption) => a.label.localeCompare(b.label, "en");
  return {
    places: destinations.map((d) => ({ value: `place:${d.slug}`, label: d.name })).sort(byName),
    states: states.map((s) => ({ value: `state:${s.slug}`, label: s.name })).sort(byName),
  };
}

const IMAGE_KEYS = new Set(allImages().map((image) => image.key));
export const isKnownPhoto = (key: string) => IMAGE_KEYS.has(key);

export interface PhotoOption {
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  /** The place value this photo belongs to, so the picker can show matching photos first. */
  place: string;
  /** The state value, so choosing a state also offers photos of its places. */
  state: string;
}

const stateOfPlace = new Map(destinations.map((d) => [d.slug, d.stateSlug]));

/** Which place a gallery key shows, if any. */
function placeOfKey(key: string): string {
  const [kind, rest = ""] = key.split(":");
  if (kind === "destination") return `place:${rest}`;
  if (kind === "gallery") return `place:${rest.replace(/-\d+$/, "")}`;
  if (kind === "state") return `state:${rest}`;
  if (kind === "ref") return rest.startsWith("state-") ? `state:${rest.slice(6).replace(/-\d+$/, "")}` : `place:${rest.replace(/-\d+$/, "")}`;
  return "";
}

/**
 * The photos offered in the picker: every guide, gallery and state photo plus the hero images,
 * kept small (no blur placeholders) so the list is cheap to send to the browser.
 */
export function photoOptions(): PhotoOption[] {
  return allImages()
    .filter((image) => /^(?:destination|gallery|state|hero):/.test(image.key))
    .map((image) => {
      const place = placeOfKey(image.key);
      return { key: image.key, src: image.src, alt: image.alt, width: image.width, height: image.height, place, state: stateOf(place) ?? "" };
    });
}

/** The state a place belongs to, so a search for a state also finds memories of its places. */
export function stateOf(place: string): string | null {
  const [kind, slug = ""] = place.split(":");
  if (kind === "state") return place;
  const state = stateOfPlace.get(slug);
  return state ? `state:${state}` : null;
}

export interface PhotoCredit {
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  blur?: string;
  author: string;
  license: string;
  sourceUrl: string;
}

/** Full details (with credit) for the photos on a memory, skipping any that have since gone. */
export function photoDetails(keys: string[]): PhotoCredit[] {
  return keys.flatMap((key) => {
    const image = getImage(key as ImageKey);
    return image ? [{ key, src: image.src, alt: image.alt, width: image.width, height: image.height, blur: image.blur, author: image.author, license: image.license, sourceUrl: image.sourceUrl }] : [];
  });
}
