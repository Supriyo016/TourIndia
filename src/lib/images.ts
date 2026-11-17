import manifest from "@/data/generated/images.json";
import type { LicensedImage } from "@/types/content";

const images = manifest as unknown as Record<string, LicensedImage>;

export type ImageKey = `${"destination" | "state" | "festival" | "food" | "story" | "unesco" | "hero" | "gallery" | "art" | "ref"}:${string}`;

/** Returns the licensed image for a content record, if one has been sourced. */
export function getImage(key: ImageKey): LicensedImage | undefined {
  return images[key];
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
