import { describe, expect, it } from "vitest";
import { destinations } from "@/data";
import { analyzeTrip, googleMapsRoute, type FestivalFact } from "@/features/itinerary/analysis";
import { generateItinerary, type PlannerDestination, type TripInput } from "@/features/itinerary/generate";

const catalogue = destinations as PlannerDestination[];
const delhi = { lat: 28.61, lng: 77.21 };
const base: TripInput = { startName: "Delhi", start: delhi, destinationSlugs: ["jaipur", "agra"], startDate: "2026-12-10", travellers: 2, days: 6, budget: null, transport: "mixed", interests: [] };
const plan = (input: Partial<TripInput>) => generateItinerary({ ...base, ...input }, catalogue);

describe("trip analysis", () => {
  it("rates a winter Rajasthan trip highly for season", () => {
    const analysis = analyzeTrip(plan({}), catalogue, [], []);
    const season = analysis.parts.find((part) => part.label === "Season and weather")!;
    expect(season.score).toBeGreaterThanOrEqual(90);
    expect(analysis.score).toBeGreaterThanOrEqual(70);
  });

  it("flags heat and off-season months for the plains in May", () => {
    const analysis = analyzeTrip(plan({ startDate: "2027-05-15" }), catalogue, [], []);
    const text = analysis.parts.flatMap((part) => part.findings.map((finding) => finding.text)).join(" ");
    expect(text).toMatch(/heat/);
    expect(analysis.parts[0]!.score).toBeLessThan(70);
  });

  it("finds festivals and holidays that fall on the trip, using only confirmed dates", () => {
    const festivals: FestivalFact[] = [
      { name: "Test Fair", slug: "test-fair", stateSlugs: ["rajasthan"], panIndian: false, dates: ["2026-12-11"] },
      { name: "Elsewhere Fest", slug: "elsewhere", stateSlugs: ["kerala"], panIndian: false, dates: ["2026-12-11"] },
    ];
    const analysis = analyzeTrip(plan({}), catalogue, festivals, [{ date: "2026-12-12", name: "Test Holiday" }]);
    expect(analysis.festivals.map((item) => item.slug)).toEqual(["test-fair"]);
    expect(analysis.holidays).toHaveLength(1);
    expect(analysis.suggestions.join(" ")).toMatch(/Book trains and rooms early/);
  });

  it("warns about a packed pace with children, and an overspent budget", () => {
    const analysis = analyzeTrip(plan({ pace: "packed", withChildren: true, budget: 2000 }), catalogue, [], []);
    const all = analysis.parts.flatMap((part) => part.findings);
    expect(all.some((finding) => finding.tone === "risk" && /packed pace/.test(finding.text))).toBe(true);
    expect(all.some((finding) => /over your budget/.test(finding.text))).toBe(true);
  });

  it("asks for a date when none is given", () => {
    const analysis = analyzeTrip(plan({ startDate: null }), catalogue, [], []);
    expect(analysis.parts[0]!.findings[0]!.text).toMatch(/Add a start date/);
  });

  it("a relaxed pace plans fewer sightseeing hours than a packed one", () => {
    const hours = (pace: TripInput["pace"]) => analyzeTrip(plan({ pace, days: 4 }), catalogue, [], []).stats.sightseeingHours;
    expect(hours("relaxed")).toBeLessThan(hours("packed"));
  });

  it("builds a Google Maps directions link through every stop", () => {
    const url = new URL(googleMapsRoute(plan({ destinationSlugs: ["jaipur", "agra", "varanasi"] })));
    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("waypoints")?.split("|")).toHaveLength(2);
  });
});
