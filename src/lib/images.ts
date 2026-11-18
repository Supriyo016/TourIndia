import manifest from "@/data/generated/images.json";
import type { LicensedImage } from "@/types/content";
import { monthlyPick } from "./rotation";

const images = manifest as unknown as Record<string, LicensedImage>;

export type ImageKey = `${"destination" | "state" | "festival" | "food" | "story" | "unesco" | "hero" | "gallery" | "art" | "ref"}:${string}`;

/** Kinds whose photo changes once a month (see `src/lib/rotation.ts`). Hero, gallery and reference images stay put. */
const ROTATING = new Set(["destination", "state", "festival", "food", "art", "unesco"]);
/** Alternatives smaller than this never replace a photo, so cards stay sharp on high-density screens. */
const MIN_ALTERNATIVE_WIDTH = 1000;

const isLandscape = (image: LicensedImage) => image.width / image.height >= 1.25 && image.width / image.height <= 2.4;

/**
 * Other licensed photos of the same subject that can stand in for `key`: its numbered siblings,
 * its gallery views and its encyclopedia reference images. Landscape only, so they crop well.
 */
export function alternativesFor(key: ImageKey, minWidth = MIN_ALTERNATIVE_WIDTH): ImageKey[] {
  const [kind, slug] = key.split(":") as [string, string];
  if (!ROTATING.has(kind) || /-\d+$/.test(slug) || !images[key]) return [];
  const stem = kind === "state" ? `state-${slug}` : slug;
  const keys = [
    ...[2, 3, 4, 5, 6].map((n) => `${kind}:${slug}-${n}`),
    ...(kind === "destination" ? [1, 2, 3, 4, 5, 6].map((n) => `gallery:${slug}-${n}`) : []),
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `ref:${stem}-${n}`),
  ];
  return keys.filter((alt) => {
    const image = images[alt];
    return image && image.width >= minWidth && isLandscape(image);
  }) as ImageKey[];
}

/**
 * The licensed image for a content record. A page's own photo moves to the next good alternative
 * of the same subject once a month (each page on its own day, so the site changes gradually).
 * `fixed` turns that off, for photos an admin chose in the media manager. `minWidth` keeps large
 * spots, such as full-width headers, to alternatives as big as the original.
 */
export function getImage(key: ImageKey, options: { fixed?: boolean; minWidth?: number; now?: Date } = {}): LicensedImage | undefined {
  const own = images[key];
  if (!own || options.fixed) return own;
  const alternatives = alternativesFor(key, Math.max(MIN_ALTERNATIVE_WIDTH, options.minWidth ?? 0));
  if (!alternatives.length) return own;
  const pick = monthlyPick(key, [key, ...alternatives], options.now);
  return (pick && images[pick]) || own;
}

/** An image chosen in the media manager (a content field), if it names a real image; otherwise the page's own. */
export function chosenImage(choice: unknown, fallback: ImageKey): ImageKey {
  return typeof choice === "string" && Object.hasOwn(images, choice) ? (choice as ImageKey) : fallback;
}

export function allImages(): (LicensedImage & { key: string })[] {
  return Object.entries(images).map(([key, image]) => ({ key, ...image }));
}

/** Most reference images an encyclopedia entry can carry (`ref:<stem>-1` to `-8`). */
export const MAX_REFERENCE_IMAGES = 8;

/**
 * Reference images for an encyclopedia entry, in order. The stem is the place
 * slug, or `state-<slug>` for a state or Union Territory.
 */
export function referenceImages(stem: string): (LicensedImage & { key: ImageKey })[] {
  const found: (LicensedImage & { key: ImageKey })[] = [];
  for (let index = 1; index <= MAX_REFERENCE_IMAGES; index += 1) {
    const key: ImageKey = `ref:${stem}-${index}`;
    const image = images[key];
    if (image) found.push({ key, ...image });
  }
  return found;
}
