import videos from "@/data/generated/art-videos.json";
import { getImage, type ImageKey } from "@/lib/images";
import type { LicensedImage } from "@/types/content";

/** One clip from src/data/generated/art-videos.json, written by `node scripts/fetch-videos.mts --art`. */
export interface ArtVideo {
  src: string;
  height: number;
  bytes: number;
  duration: number;
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
  captions: { lang: string; label: string; src: string }[];
}

const manifest = videos as Record<string, ArtVideo>;

export function artVideo(slug: string): ArtVideo | undefined {
  return manifest[slug];
}

export function artVideoSlugs(): string[] {
  return Object.keys(manifest);
}

/** The lead photo and the gallery photos that exist for an art form, in order. */
export function artImages(slug: string): { key: ImageKey; image: LicensedImage }[] {
  const keys: ImageKey[] = [`art:${slug}`, `art:${slug}-2`, `art:${slug}-3`];
  return keys.flatMap((key) => {
    const image = getImage(key);
    return image ? [{ key, image }] : [];
  });
}
