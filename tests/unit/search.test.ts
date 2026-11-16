import { describe, expect, it } from "vitest";
import { searchEntries, type SearchEntry } from "@/features/discovery/search";
import { buildSearchIndex } from "@/features/discovery/search-index";

const index = buildSearchIndex();
const titles = (query: string) => searchEntries(index, query).map((entry) => entry.title);

describe("search", () => {
  it("finds a destination by name", () => {
    expect(titles("hampi")[0]).toBe("Hampi");
  });

  it("finds a state", () => {
    expect(titles("kerala")).toContain("Kerala");
  });

  it("finds a festival", () => {
    expect(searchEntries(index, "diwali").some((entry) => entry.type === "Festival")).toBe(true);
  });

  it("finds a region and a travel style", () => {
    expect(titles("northeast")).toContain("Northeast India");
    expect(titles("beaches")).toContain("Beaches");
  });

  it("matches word prefixes and ignores case and punctuation", () => {
    expect(titles("JAIS")).toContain("Jaisalmer");
    expect(titles("  hampi!! ")[0]).toBe("Hampi");
  });

  it("requires every word to match", () => {
    expect(titles("hampi zzzzqq")).toEqual([]);
  });

  it("returns nothing for an empty query", () => {
    expect(titles("   ")).toEqual([]);
  });

  it("respects the limit", () => {
    const entries = Array.from({ length: 30 }, (_, i): SearchEntry => ({ type: "Destination", title: `Lake ${i}`, subtitle: "", href: `/${i}`, keywords: "" }));
    expect(searchEntries(entries, "lake", 5)).toHaveLength(5);
  });

  it("links only to internal paths", () => {
    expect(index.every((entry) => entry.href.startsWith("/"))).toBe(true);
  });
});
