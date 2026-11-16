import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { artImages, artVideo, artVideoSlugs } from "@/components/culture/art-media";
import { artArticles, articleWords, furtherReading } from "@/data/arts-encyclopedia";
import { artForms } from "@/data/arts";

const publicFile = (src: string) => join(process.cwd(), "public", src);

describe("art and traditions encyclopedia", () => {
  it("has a substantial article for every art form", () => {
    for (const form of artForms) {
      const article = artArticles[form.slug];
      expect(article, form.slug).toBeDefined();
      expect(articleWords(article!), form.slug).toBeGreaterThanOrEqual(400);
    }
  });

  it("has no articles for slugs that do not exist", () => {
    const slugs = new Set(artForms.map((form) => form.slug));
    expect(Object.keys(artArticles).filter((slug) => !slugs.has(slug))).toEqual([]);
  });

  it("gives each section a unique anchor and some text", () => {
    for (const [slug, article] of Object.entries(artArticles)) {
      const ids = article.sections.map((section) => section.id);
      expect(new Set(ids).size, slug).toBe(ids.length);
      expect(ids, slug).toContain("overview");
      for (const section of article.sections) expect(section.paragraphs.length, `${slug}#${section.id}`).toBeGreaterThan(0);
    }
  });

  it("links only to https sources, without repeats", () => {
    for (const form of artForms) {
      const links = furtherReading(form.slug, form.stateSlugs);
      expect(links.length, form.slug).toBeGreaterThan(0);
      for (const link of links) expect(link.url, form.slug).toMatch(/^https:\/\//);
      expect(new Set(links.map((link) => link.url)).size).toBe(links.length);
    }
  });
});

describe("art photos and video", () => {
  it("has a lead photo for every art form, with alt text and a free licence on file", () => {
    for (const form of artForms) {
      const images = artImages(form.slug);
      expect(images[0]?.key, form.slug).toBe(`art:${form.slug}`);
      for (const { image } of images) {
        expect(image.alt.length).toBeGreaterThan(2);
        expect(image.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
        expect(existsSync(publicFile(image.src)), image.src).toBe(true);
      }
    }
  });

  it("keeps every video small, local, credited and with its caption files", () => {
    for (const slug of artVideoSlugs()) {
      const video = artVideo(slug)!;
      expect(artForms.some((form) => form.slug === slug), slug).toBe(true);
      expect(video.src).toMatch(/^\/videos\/art\/.+\.webm$/);
      expect(video.height).toBeLessThanOrEqual(480);
      expect(statSync(publicFile(video.src)).size).toBeLessThanOrEqual(6.5 * 1024 * 1024);
      expect(video.author.length).toBeGreaterThan(0);
      expect(video.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
      for (const track of video.captions) expect(existsSync(publicFile(track.src)), track.src).toBe(true);
    }
  });
});
