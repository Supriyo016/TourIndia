import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { destinations, states } from "@/data";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { allImages, getImage, MAX_REFERENCE_IMAGES, referenceImages } from "@/lib/images";

const publicFile = (src: string) => join(process.cwd(), "public", src);

describe("image library", () => {
  it("has a lead image for every state and destination", () => {
    const missing = [
      ...states.filter((state) => !getImage(`state:${state.slug}`)).map((state) => `state:${state.slug}`),
      ...destinations.filter((place) => !getImage(`destination:${place.slug}`)).map((place) => `destination:${place.slug}`),
    ];
    expect(missing).toEqual([]);
  });

  it("has a photo for every festival and dish", () => {
    const missing = [
      ...festivals.filter((item) => !getImage(`festival:${item.slug}`)).map((item) => item.slug),
      ...foods.filter((item) => !getImage(`food:${item.slug}`)).map((item) => item.slug),
    ];
    expect(missing).toEqual([]);
  });

  it("gives every encyclopedia entry at least four captioned reference images", () => {
    const stems = [...states.map((state) => `state-${state.slug}`), ...destinations.map((place) => place.slug)];
    const short = stems.filter((stem) => referenceImages(stem).length < 4);
    expect(short).toEqual([]);
    for (const stem of stems) {
      const images = referenceImages(stem);
      expect(images.length).toBeLessThanOrEqual(MAX_REFERENCE_IMAGES);
      expect(new Set(images.map((image) => image.sourceUrl)).size).toBe(images.length);
      for (const image of images) expect(image.alt.length).toBeGreaterThan(3);
    }
  });

  it("shows West Bengal with several reference images", () => {
    expect(referenceImages("state-west-bengal").length).toBeGreaterThanOrEqual(5);
  });

  it("stores web-size WebP files with credits for every entry", () => {
    for (const image of allImages()) {
      expect(image.src, image.key).toMatch(/^\/images\/.+\.webp$/);
      expect(existsSync(publicFile(image.src)), image.src).toBe(true);
      expect(image.author, image.key).toBeTruthy();
      expect(image.license, image.key).toBeTruthy();
      expect(image.sourceUrl, image.key).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      if (!image.key.startsWith("hero:")) {
        expect(image.width, image.key).toBeLessThanOrEqual(1600);
        expect(statSync(publicFile(image.src)).size, image.src).toBeLessThan(1_200_000);
      }
    }
  });
});
