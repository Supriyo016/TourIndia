import { describe, expect, it } from "vitest";
import { alternativesFor, getImage, type ImageKey } from "@/lib/images";
import { dayIndex, heroRotation, monthlyPick, PAGE_PHOTO_DAYS, SLIDE_SWAP_DAYS } from "@/lib/rotation";

const DAY = 86_400_000;
/** A date `days` after the schedule's first day, at noon India time. */
const at = (days: number) => new Date(Date.UTC(2026, 0, 1, 6, 30) + days * DAY);

describe("the day count", () => {
  it("starts at midnight India time on 1 January 2026", () => {
    expect(dayIndex(new Date(Date.UTC(2025, 11, 31, 18, 30)))).toBe(0);
    expect(dayIndex(new Date(Date.UTC(2025, 11, 31, 18, 29)))).toBe(-1);
    expect(dayIndex(at(45))).toBe(45);
  });
});

describe("the home slider", () => {
  const POOL = 30;
  const SHOWN = 12;
  const same = (a: number[], b: number[]) => a.filter((value) => b.includes(value)).length;

  it("always shows the full number of slides, with no picture twice", () => {
    for (let day = 0; day < 400; day += 3) {
      const set = heroRotation(POOL, SHOWN, at(day));
      expect(set).toHaveLength(SHOWN);
      expect(new Set(set).size).toBe(SHOWN);
      expect(set.every((index) => index >= 0 && index < POOL)).toBe(true);
    }
  });

  it("keeps the same slides for 10 days", () => {
    const start = heroRotation(POOL, SHOWN, at(0));
    for (let day = 1; day < SLIDE_SWAP_DAYS; day++) expect(heroRotation(POOL, SHOWN, at(day))).toEqual(start);
  });

  it("changes about half the slides every 10 days and every slide within 20", () => {
    for (let step = 0; step < 30; step++) {
      const day = step * SLIDE_SWAP_DAYS;
      const now = heroRotation(POOL, SHOWN, at(day));
      const tenLater = heroRotation(POOL, SHOWN, at(day + SLIDE_SWAP_DAYS));
      const twentyLater = heroRotation(POOL, SHOWN, at(day + 2 * SLIDE_SWAP_DAYS));
      expect(same(now, tenLater)).toBe(SHOWN / 2);
      expect(same(now, twentyLater)).toBe(0);
    }
  });

  it("works through the whole pool over time", () => {
    const seen = new Set<number>();
    for (let day = 0; day < 200; day += SLIDE_SWAP_DAYS) heroRotation(POOL, SHOWN, at(day)).forEach((index) => seen.add(index));
    expect(seen.size).toBe(POOL);
  });

  it("shows everything when the pool is no bigger than the slider", () => {
    expect(heroRotation(5, SHOWN, at(77))).toEqual([0, 1, 2, 3, 4]);
  });
});

describe("monthly page photos", () => {
  it("keep one photo for 30 days, then move to the next, looping round", () => {
    const options = ["a", "b", "c"];
    const picks = Array.from({ length: 120 }, (_, day) => monthlyPick("destination:goa", options, at(day)));
    const changes = picks.filter((pick, day) => day > 0 && pick !== picks[day - 1]).length;
    expect(changes).toBeGreaterThanOrEqual(3);
    expect(changes).toBeLessThanOrEqual(4);
    for (let day = 1; day < picks.length; day++) {
      if (picks[day] !== picks[day - 1]) expect(options.indexOf(picks[day]!)).toBe((options.indexOf(picks[day - 1]!) + 1) % options.length);
    }
  });

  it("change on different days for different pages, so the site changes gradually", () => {
    const pages = Array.from({ length: 60 }, (_, i) => `destination:page-${i}`);
    const changeDay = (id: string) => Array.from({ length: PAGE_PHOTO_DAYS }, (_, day) => day).find((day) => monthlyPick(id, ["a", "b"], at(day)) !== monthlyPick(id, ["a", "b"], at(day + 1)));
    expect(new Set(pages.map(changeDay)).size).toBeGreaterThan(15);
  });

  it("only use landscape alternatives of the same subject, at least 1000 px wide", () => {
    const key = "destination:goa" as ImageKey;
    for (const alt of alternativesFor(key)) {
      expect(alt).toMatch(/^(destination:goa-\d|gallery:goa-\d|ref:goa-\d)$/);
      const image = getImage(alt, { fixed: true })!;
      expect(image.width).toBeGreaterThanOrEqual(1000);
      expect(image.width / image.height).toBeGreaterThanOrEqual(1.25);
    }
  });

  it("never rotate a fixed photo, slider photos, or into a smaller photo for a large spot", () => {
    const key = "destination:goa" as ImageKey;
    const own = getImage(key, { fixed: true })!;
    for (let day = 0; day < 400; day += 7) {
      expect(getImage(key, { fixed: true, now: at(day) })).toBe(own);
      expect(getImage(key, { minWidth: own.width, now: at(day) })!.width).toBeGreaterThanOrEqual(own.width);
      expect(getImage("hero:taj-mahal", { now: at(day) })).toBe(getImage("hero:taj-mahal", { fixed: true }));
    }
  });
});

describe("the encyclopedia lead photo", () => {
  it("is always fixed, so its picture, caption and credit match and never repeat a reference photo", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/components/community/EncyclopediaArticle.tsx", "utf8");
    for (const call of source.match(/<Photo\b[^>]*\/>|<PhotoCredit\b[^>]*\/>/g) ?? []) expect(call, call).toMatch(/\bfixed\b/);
    expect(source).toMatch(/getImage\(imageKey, \{ fixed: true \}\)/);
  });
});
