import manifest from "@/data/generated/images.json";
import type { LicensedImage } from "@/types/content";

const images = manifest as unknown as Record<string, LicensedImage>;

export type ImageKey = `${"destination" | "state" | "festival" | "food" | "story" | "unesco" | "hero" | "gallery"}:${string}`;

/** Returns the licensed image for a content record, if one has been sourced. */
export function getImage(key: ImageKey): LicensedImage | undefined {
  return images[key];
}

export function allImages(): (LicensedImage & { key: string })[] {
  return Object.entries(images).map(([key, image]) => ({ key, ...image }));
}

export function galleryImages(): (LicensedImage & { key: string })[] {
  return allImages().filter(
    ({ key }) => key.startsWith("gallery:") || key.startsWith("destination:") || key.startsWith("festival:"),
  );
}
