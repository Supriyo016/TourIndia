import { describe, expect, it } from "vitest";
import { destinations } from "@/data";
import { startCities } from "@/data/start-cities";
import {
  allocateDays,
  decodeTrip,
  encodeTrip,
  generateItinerary,
  moveItem,
  packingList,
  planLeg,
  settleUp,
  toIcs,
  type TripInput,
} from "@/features/itinerary/generate";
import { decodeShared, isValidTripDate, shareHash } from "@/features/itinerary/share";
import { scoreQuiz, quiz } from "@/features/discovery/quiz";
import { computeBadges } from "@/features/user/badges";
import { formatMonthRange } from "@/data/taxonomy";
import { haversineKm, projectToMap } from "@/lib/utils";

const delhi = startCities.find((city) => city.name === "Delhi")!;

const input = (overrides: Partial<TripInput> = {}): TripInput => ({
  startName: delhi.name,
  start: delhi.point,
  destinationSlugs: ["jaipur", "agra"],
  startDate: "2027-01-10",
  travellers: 2,
  days: 6,
  budget: null,
  transport: "mixed",
  interests: ["history"],
  ...overrides,
});

describe("generateItinerary", () => {
  it("produces one day per requested day when there is no long travel", () => {
    const trip = generateItinerary(input(), destinations);
    expect(trip.days).toHaveLength(6);
    expect(trip.days.map((day) => day.number)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("visits the nearest stop first unless told to keep the order", () => {
    const trip = generateItinerary(input({ destinationSlugs: ["jaipur", "agra"] }), destinations);
    const near = haversineKm(delhi.point, destinations.find((d) => d.slug === "agra")!.coordinates) < haversineKm(delhi.point, destinations.find((d) => d.slug === "jaipur")!.coordinates) ? "Agra" : "Jaipur";
    expect(trip.legs[0]!.to).toBe(near);
    const kept = generateItinerary(input({ destinationSlugs: ["udaipur", "agra"], keepOrder: true }), destinations);
    expect(kept.legs[0]!.to).toBe("Udaipur");
  });

  it("dates days consecutively across a month boundary", () => {
    const trip = generateItinerary(input({ startDate: "2027-01-30" }), destinations);
    expect(trip.days.map((day) => day.date).slice(0, 3)).toEqual(["2027-01-30", "2027-01-31", "2027-02-01"]);
  });

  it("scales the group total by travellers", () => {
    const one = generateItinerary(input({ travellers: 1 }), destinations);
    const four = generateItinerary(input({ travellers: 4 }), destinations);
    expect(four.totals.group).toBe(one.totals.perPerson * 4);
  });

  it("warns when the budget is exceeded", () => {
    expect(generateItinerary(input({ budget: 100 }), destinations).warnings.join(" ")).toMatch(/above your budget/);
  });

  it("warns when a date falls outside recommended months", () => {
    const trip = generateItinerary(input({ destinationSlugs: ["jaisalmer"], startDate: "2027-06-15", days: 3 }), destinations);
    expect(trip.warnings.join(" ")).toMatch(/outside its recommended months/);
  });

  it("warns when too many places are squeezed in", () => {
    const trip = generateItinerary(input({ destinationSlugs: ["leh", "alappuzha", "kaziranga"], days: 2 }), destinations);
    expect(trip.warnings.join(" ")).toMatch(/tight/);
  });

  it("never sends road or rail to the islands", () => {
    const leg = planLeg({ name: "Chennai", point: { lat: 13.08, lng: 80.27 } }, { name: "Andaman", point: { lat: 11.67, lng: 92.74 }, island: true }, "train");
    expect(leg.mode).toBe("ferry or flight");
  });

  it("uses the requested mode, and picks by distance on mixed", () => {
    const near = { name: "A", point: { lat: 28.6, lng: 77.2 } };
    const close = { name: "B", point: { lat: 27.2, lng: 78.0 } };
    const far = { name: "C", point: { lat: 10.0, lng: 76.3 } };
    expect(planLeg(near, close, "mixed").mode).toBe("road");
    expect(planLeg(near, far, "mixed").mode).toBe("flight");
    expect(planLeg(near, far, "train").mode).toBe("train");
  });

  it("doesn't let one very long outing block the rest of a stop", () => {
    for (const slug of ["leh", "kohima", "valley-of-flowers", "andaman"]) {
      const trip = generateItinerary(input({ destinationSlugs: [slug], days: 7, interests: ["adventure"], transport: "flight" }), destinations);
      const visits = trip.days.flatMap((day) => day.items).filter((item) => item.kind === "visit" && item.title !== "Unplanned time");
      expect(visits.length, slug).toBeGreaterThanOrEqual(Math.min(3, destinations.find((d) => d.slug === slug)!.attractions.length));
    }
  });

  it("gives a long journey its own day and still returns the requested length", () => {
    const trip = generateItinerary(input({ destinationSlugs: ["varanasi"], days: 6, transport: "train" }), destinations);
    expect(trip.legs[0]!.hours).toBeGreaterThan(8);
    expect(trip.days).toHaveLength(6);
    expect(trip.days[0]!.place).toBe("Travelling to Varanasi");
  });

  it("doesn't route by train to places without a railway", () => {
    expect(generateItinerary(input({ destinationSlugs: ["leh"], days: 6 }), destinations).legs[0]!.mode).toBe("flight");
    const byTrain = generateItinerary(input({ destinationSlugs: ["manali"], days: 6, transport: "train" }), destinations);
    expect(byTrain.legs[0]!.mode).toBe("road");
    expect(byTrain.warnings.join(" ")).toMatch(/no railway station/);
  });

  it("ignores unknown destinations safely", () => {
    const trip = generateItinerary(input({ destinationSlugs: ["jaipur", "not-a-place"] }), destinations);
    expect(trip.legs).toHaveLength(1);
  });
});

describe("planning helpers", () => {
  it("allocates exactly the available days, at least one each", () => {
    const list = destinations.slice(0, 3);
    for (const total of [3, 5, 9, 14]) {
      const days = allocateDays(list, total);
      expect(days.reduce((a, b) => a + b, 0)).toBe(total);
      expect(Math.min(...days)).toBeGreaterThanOrEqual(1);
    }
  });

  it("moves an item between days without losing or duplicating it", () => {
    const { days } = generateItinerary(input(), destinations);
    const item = days[0]!.items[0]!;
    const before = days.flatMap((day) => day.items).length;
    const moved = moveItem(days, item.id, days[2]!.id, 0);
    expect(moved.flatMap((day) => day.items)).toHaveLength(before);
    expect(moved[2]!.items[0]!.id).toBe(item.id);
    expect(moved[0]!.items.some((other) => other.id === item.id)).toBe(false);
  });

  it("writes a valid calendar file and escapes text", () => {
    const { days } = generateItinerary(input(), destinations);
    days[0]!.place = "Agra, Fort; \\ City";
    const ics = toIcs(days, new Date("2026-11-08T00:00:00Z"));
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(6);
    expect(ics).toContain("Agra\\, Fort\\; \\\\ City");
    expect(ics).toContain("DTSTART;VALUE=DATE:20270110");
  });

  it("round-trips a shared trip, including non-English text", () => {
    const value = { note: "₹ दिल्ली ✓", list: [1, 2] };
    expect(decodeTrip(encodeTrip(value))).toEqual(value);
    expect(encodeTrip(value)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("returns null for a corrupted share link", () => {
    expect(decodeTrip("%%%not-base64")).toBeNull();
  });

  it("rebuilds a shared trip with its edits, at a small size", () => {
    const made = generateItinerary(input({ destinationSlugs: ["jaipur", "agra", "delhi"], days: 14 }), destinations);
    const edited = moveItem(made.days, made.days[0]!.items[0]!.id, made.days[1]!.id, 0);
    const hash = shareHash(made.input, edited);
    expect(hash.length).toBeLessThan(4000);
    const decoded = decodeShared(hash.replace("trip=", ""), destinations)!;
    expect(decoded.days.map((day) => day.items.map((item) => item.id))).toEqual(edited.map((day) => day.items.map((item) => item.id)));
  });

  const valid = () => ({ input: { startName: "Delhi", destinationSlugs: ["goa"], startDate: null, travellers: 2, days: 3, budget: null, transport: "mixed", interests: [] }, layout: [] as string[][] });

  it.each([
    ["an enormous trip", { days: 1_000_000_000 }],
    ["infinite days", { days: Infinity }],
    ["fractional days", { days: 2.5 }],
    ["too many travellers", { travellers: 1e9 }],
    ["an impossible date", { startDate: "2027-02-31" }],
    ["a far-future date", { startDate: "12345-01-01" }],
    ["an unknown start", { startName: "Atlantis" }],
    ["coordinates in place of a city", { startName: { lat: 1, lng: 1 } }],
    ["a missing interest list", { interests: undefined }],
    ["an unknown interest", { interests: ["<script>"] }],
    ["an unknown transport", { transport: "teleport" }],
    ["no destinations", { destinationSlugs: [] }],
    ["duplicate destinations", { destinationSlugs: ["goa", "goa"] }],
    ["too many destinations", { destinationSlugs: ["goa", "leh", "agra", "delhi", "jaipur", "hampi", "munnar"] }],
    ["an unknown destination", { destinationSlugs: ["atlantis"] }],
  ])("rejects a shared link with %s", (_label, change) => {
    const payload = valid();
    Object.assign(payload.input, change);
    expect(decodeShared(encodeTrip(payload), destinations)).toBeNull();
  });

  it.each([
    ["null", null],
    ["a number", 42],
    ["an empty object", {}],
    ["days of the wrong type", { input: valid().input, layout: [null] }],
    ["layout as a string", { input: valid().input, layout: "x" }],
  ])("rejects a shared payload that is %s", (_label, payload) => {
    expect(decodeShared(encodeTrip(payload), destinations)).toBeNull();
  });

  it("can't inject text through a shared link", () => {
    const payload = valid();
    payload.layout = [["Pay your deposit to this UPI ID"]];
    const decoded = decodeShared(encodeTrip(payload), destinations)!;
    expect(JSON.stringify(decoded)).not.toContain("deposit");
  });

  it("refuses oversized links", () => {
    expect(decodeShared("a".repeat(20_001), destinations)).toBeNull();
  });

  it("can't inject calendar properties", () => {
    const { days } = generateItinerary(input(), destinations);
    days[0]!.id = "x\r\nATTACH:https://evil.example/a";
    days[0]!.place = "Line\rbreak\nhere";
    const ics = toIcs(days);
    expect(ics).not.toContain("ATTACH:");
    expect(ics.split("\r\n").every((line) => !line.includes("\r") && !line.includes("\n"))).toBe(true);
  });

  it("settles shared expenses", () => {
    const payments = settleUp(["A", "B", "C"], [
      { id: "1", label: "Hotel", amount: 3000, paidBy: "A" },
      { id: "2", label: "Taxi", amount: 300, paidBy: "B" },
    ]);
    expect(payments).toEqual([
      { from: "C", to: "A", amount: 1100 },
      { from: "B", to: "A", amount: 800 },
    ]);
  });

  it("validates trip dates", () => {
    expect(isValidTripDate("2027-02-28")).toBe(true);
    expect(isValidTripDate("2027-02-30")).toBe(false);
    expect(isValidTripDate("1999-12-31")).toBe(false);
    expect(isValidTripDate("yesterday")).toBe(false);
  });

  it("handles no expenses and an empty group", () => {
    expect(settleUp(["A", "B"], [])).toEqual([]);
    expect(settleUp([], [])).toEqual([]);
  });

  it("adjusts packing lists to the season and place", () => {
    const leh = destinations.filter((item) => item.slug === "leh");
    const groups = packingList(leh, [7]).map((group) => group.group);
    expect(groups).toContain("Cold weather");
    expect(groups).toContain("Monsoon");
    expect(packingList(leh, [1]).map((group) => group.group)).not.toContain("Monsoon");
  });
});

describe("other logic", () => {
  it("formats month ranges, including ones that wrap the year", () => {
    expect(formatMonthRange([10, 11, 12, 1, 2, 3])).toBe("October to March");
    expect(formatMonthRange([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe("All year");
    expect(formatMonthRange([3])).toBe("March");
    expect(formatMonthRange([])).toBe("Varies");
    expect(formatMonthRange([1, 2, 7, 8])).toContain("July to August");
  });

  it("projects to the same place every time", () => {
    const point = projectToMap({ lat: 20, lng: 80 }, { scale: 1000, translate: [10, 20] });
    expect(point.x).toBeCloseTo(1000 * (80 * Math.PI) / 180 + 10);
    expect(point.y).toBeLessThan(20);
  });

  it("prefers matching destinations in the quiz", () => {
    const candidates = [
      { slug: "peak", categories: ["mountains" as const], region: "north" as const, months: [6], minDays: 5 },
      { slug: "shore", categories: ["beaches" as const], region: "west" as const, months: [12], minDays: 3 },
    ];
    expect(scoreQuiz(candidates, [quiz[0]!.options[1]!])[0]).toBe("shore");
    expect(scoreQuiz(candidates, [quiz[0]!.options[0]!])[0]).toBe("peak");
  });

  it("awards badges only for recorded stamps", () => {
    const earned = (stamps: string[]) => computeBadges(stamps, () => "south").filter((badge) => badge.earned).map((badge) => badge.id);
    expect(earned([])).toEqual([]);
    expect(earned(["goa"])).toEqual(["first"]);
    expect(earned(["goa", "kerala", "tamil-nadu"])).toContain("coast");
  });
});
