import { describe, expect, it } from "vitest";
import { cleanAuthor } from "@/lib/credits";

describe("cleanAuthor", () => {
  it.each([
    ["This Photo was taken by Timothy A. Gonsalves . Feel free to use my photos", "Timothy A. Gonsalves"],
    ["Arne Hückelheim 2010-09-21 12:41:53 This is a cropped version", "Arne Hückelheim"],
    ["Jean-Pierre Dalbéra from Paris, France", "Jean-Pierre Dalbéra"],
    ["https://www.flickr.com/photos/dalbera/", "dalbera"],
    ["ptwo ( https://www.flickr.com/people/ptwo/ )", "ptwo"],
    ["Ausdruckslust.de | a blog about things i love", "Ausdruckslust.de"],
    ["Original: Rohit Sharma Derivative work: UnpetitproleX", "Original: Rohit Sharma Derivative work: UnpetitproleX"],
    ["", "Unknown author"],
  ])("cleans %j", (raw, clean) => {
    expect(cleanAuthor(raw)).toBe(clean);
  });

  it("keeps every credit in the image manifest short and free of links and dates", async () => {
    const manifest: Record<string, { author?: string }> = (await import("../../src/data/generated/images.json")).default;
    for (const [key, entry] of Object.entries(manifest)) {
      if (!entry.author) continue;
      expect(entry.author, key).not.toMatch(/https?:\/\/|\d{4}-\d\d-\d\d|Feel free/);
      expect(entry.author.length, key).toBeLessThanOrEqual(80);
    }
  });
});
