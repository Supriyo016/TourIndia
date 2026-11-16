import { describe, expect, it } from "vitest";
import { destinations, getDestination, getState, states } from "@/data";
import { circuits } from "@/data/circuits";
import map from "@/data/generated/india-map.json";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { unescoSites } from "@/data/heritage";
import { stories } from "@/data/stories";
import { publishedSocials, site } from "@/config/site";

const unique = (values: string[]) => new Set(values).size === values.length;

describe("content integrity", () => {
  it("covers all 28 states and 8 Union Territories", () => {
    expect(states.filter((state) => state.kind === "state")).toHaveLength(28);
    expect(states.filter((state) => state.kind === "union-territory")).toHaveLength(8);
    expect(unique(states.map((state) => state.slug))).toBe(true);
  });

  it("has a map shape for every state and no stray shapes", () => {
    expect(map.states.map((item) => item.slug).sort()).toEqual(states.map((state) => state.slug).sort());
  });

  it("gives every state or UT at least one guide", () => {
    const missing = states.filter((state) => !destinations.some((item) => item.stateSlug === state.slug));
    expect(missing.map((state) => state.name)).toEqual([]);
  });

  it("keeps destination slugs unique and linked to real states", () => {
    expect(unique(destinations.map((item) => item.slug))).toBe(true);
    for (const item of destinations) expect(getState(item.stateSlug), item.slug).toBeDefined();
  });

  it("has complete guides", () => {
    for (const item of destinations) {
      expect(item.overview.length, `${item.slug} overview`).toBeGreaterThanOrEqual(3);
      expect(item.attractions.length, `${item.slug} attractions`).toBeGreaterThanOrEqual(4);
      expect(item.faqs.length, `${item.slug} faqs`).toBeGreaterThanOrEqual(3);
      expect(item.bestMonths.length, `${item.slug} months`).toBeGreaterThan(0);
      expect(item.sources.length, `${item.slug} sources`).toBeGreaterThan(0);
    }
  });

  it("places coordinates inside India's extent", () => {
    for (const { slug, coordinates } of destinations) {
      expect(coordinates.lat, slug).toBeGreaterThan(6);
      expect(coordinates.lat, slug).toBeLessThan(37.6);
      expect(coordinates.lng, slug).toBeGreaterThan(68);
      expect(coordinates.lng, slug).toBeLessThan(97.5);
    }
  });

  it("orders each budget tier sensibly", () => {
    for (const { slug, budget } of destinations) {
      for (const tier of [budget.budget, budget.midRange, budget.comfort]) expect(tier[0], slug).toBeLessThanOrEqual(tier[1]);
      expect(budget.budget[0], slug).toBeLessThanOrEqual(budget.midRange[0]);
      expect(budget.midRange[0], slug).toBeLessThanOrEqual(budget.comfort[0]);
    }
  });

  it("only cross-links to content that exists", () => {
    for (const item of destinations) {
      for (const place of item.nearby) if (place.destinationSlug) expect(getDestination(place.destinationSlug), `${item.slug} -> ${place.destinationSlug}`).toBeDefined();
      for (const slug of item.festivalSlugs ?? []) expect(festivals.some((festival) => festival.slug === slug), `${item.slug} -> ${slug}`).toBe(true);
    }
    for (const circuit of circuits) for (const slug of circuit.destinationSlugs) expect(getDestination(slug), slug).toBeDefined();
    for (const site of unescoSites) if (site.destinationSlug) expect(getDestination(site.destinationSlug), site.name).toBeDefined();
    for (const food of foods) for (const place of food.whereToTry) if (place.destinationSlug) expect(getDestination(place.destinationSlug), food.slug).toBeDefined();
    for (const story of stories) for (const slug of story.relatedDestinationSlugs) expect(getDestination(slug), story.slug).toBeDefined();
  });

  it("only shows festival dates that carry a source", () => {
    for (const festival of festivals) for (const date of festival.confirmedDates) expect(date.source.url, festival.slug).toMatch(/^https:/);
  });
});

describe("ownership and honesty", () => {
  const banned = /lorem ipsum|no\.\s?1\b|most trusted|award-winning/i;

  it("identifies the owner once, from configuration", () => {
    expect(site.owner.name).toBe("Supriyo Sarkar");
    expect(site.owner.designation).toBe("Founder & Website Owner");
  });

  it("never publishes an unconfirmed social account", () => {
    expect(publishedSocials.every((link) => link.url.startsWith("https://"))).toBe(true);
    expect(publishedSocials.some((link) => link.id === "linkedin")).toBe(false);
  });

  it("publishes no placeholder contact details", () => {
    expect(site.contact.email).toBeNull();
    expect(site.contact.phone).toBeNull();
    expect(site.contact.postalAddress).toBeNull();
  });

  it("contains no placeholder or unsupported marketing copy", () => {
    expect(JSON.stringify(destinations)).not.toMatch(banned);
    expect(JSON.stringify(states)).not.toMatch(banned);
    expect(JSON.stringify(stories)).not.toMatch(banned);
  });

  it("does not mention people from the original team page", () => {
    const names = /Shiwam Yadav|Mehul Panja|Ashis Bhowmik|Shabnam Parveen|Bedadyuti Biswas/;
    expect(JSON.stringify({ destinations, states, stories, site })).not.toMatch(names);
  });
});
