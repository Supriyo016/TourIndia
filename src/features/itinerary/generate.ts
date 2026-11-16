/**
 * Rule-based itinerary generator. Deterministic and free of I/O, so it runs
 * instantly in the browser and can be unit-tested. Every cost and travel time
 * it produces is an estimate; ESTIMATE_ASSUMPTIONS is shown beside the results.
 */
import type { Attraction, Destination as FullDestination, LatLng, Month, TravelInterest } from "@/types/content";
import { haversineKm } from "@/lib/utils";

/** Only what planning needs, so the browser isn't sent every guide in full. */
export type PlannerDestination = Pick<
  FullDestination,
  | "slug"
  | "name"
  | "stateSlug"
  | "region"
  | "coordinates"
  | "categories"
  | "attractions"
  | "bestMonths"
  | "bestTimeNote"
  | "recommendedDays"
  | "budget"
  | "accommodation"
  | "cuisine"
  | "nearby"
  | "permits"
>;
type Destination = PlannerDestination;

export type TransportMode = "mixed" | "train" | "road" | "flight";

export interface TripInput {
  startName: string;
  start: LatLng;
  destinationSlugs: string[];
  startDate: string | null;
  travellers: number;
  days: number;
  /** Total for the group, in INR. Null when the traveller does not set one. */
  budget: number | null;
  transport: TransportMode;
  interests: TravelInterest[];
  /** Keep the destinations in the order given rather than optimising. */
  keepOrder?: boolean;
  /** How full each day is. Relaxed plans about 5 hours of sightseeing, packed about 9. */
  pace?: Pace;
  /** Used by the trip analysis to tailor advice. */
  withChildren?: boolean;
  withSeniors?: boolean;
  stepFree?: boolean;
  diet?: Diet;
}

export type Pace = "relaxed" | "balanced" | "packed";
export type Diet = "any" | "vegetarian" | "vegan" | "jain";
export const PACE_HOURS: Record<Pace, number> = { relaxed: 5, balanced: 7, packed: 9 };

export interface TripItem {
  id: string;
  kind: "visit" | "travel";
  title: string;
  note: string;
  hours: number;
}

export interface TripDay {
  id: string;
  number: number;
  date: string | null;
  place: string;
  destinationSlug: string;
  items: TripItem[];
  food: string;
  stay: string;
  alternative: string | null;
  costPerPerson: number;
}

export interface TripLeg {
  from: string;
  to: string;
  fromPoint: LatLng;
  toPoint: LatLng;
  km: number;
  hours: number;
  mode: Exclude<TransportMode, "mixed"> | "ferry or flight";
  costPerPerson: number;
}

export interface Itinerary {
  input: TripInput;
  days: TripDay[];
  legs: TripLeg[];
  tier: "budget" | "midRange" | "comfort";
  totals: { travel: number; ground: number; group: number; perPerson: number };
  warnings: string[];
}

export const ESTIMATE_ASSUMPTIONS = [
  "Distances are straight-line figures multiplied by 1.3 for rail and 1.35 for road, so real routes will differ.",
  "Road travel is taken at 45 km/h and rail at 55 km/h, with 3.5 extra hours for airport time on flights.",
  "Fares are estimated at ₹1.2 per km by train, ₹2.5 per km by road and ₹6 per km by air (minimum ₹3,000).",
  "Daily costs come from each guide's estimate and cover a shared room, meals, local transport and entry fees.",
  "Long-distance costs cover the journey out and between stops. The trip home is not included.",
  "None of these figures is a quote, a live fare or a guarantee of availability.",
] as const;

const ISLAND_SLUGS = new Set(["andaman", "lakshadweep"]);
/** Guides with no railway station within practical reach. */
const NO_RAIL_SLUGS = new Set(["leh", "spiti-valley", "manali", "tawang", "ziro", "gangtok", "munnar", "coorg", "valley-of-flowers"]);

/** A leg over eight hours takes a day of its own, or more for very long journeys. */
const travelDaysFor = (leg: TripLeg) => (leg.hours > 8 ? Math.ceil(leg.hours / 24) : 0);

function nearestOrder(start: LatLng, list: Destination[]): Destination[] {
  const remaining = [...list];
  const ordered: Destination[] = [];
  let cursor = start;
  while (remaining.length) {
    remaining.sort((a, b) => haversineKm(cursor, a.coordinates) - haversineKm(cursor, b.coordinates));
    const next = remaining.shift()!;
    ordered.push(next);
    cursor = next.coordinates;
  }
  return ordered;
}

export function planLeg(
  from: { name: string; point: LatLng },
  to: { name: string; point: LatLng; island?: boolean; noRail?: boolean },
  preferred: TransportMode,
): TripLeg {
  const straight = haversineKm(from.point, to.point);
  let mode: TripLeg["mode"];
  if (to.island) mode = "ferry or flight";
  else if (preferred === "train" && to.noRail) mode = "road";
  else if (preferred !== "mixed") mode = preferred;
  else if (straight > 900) mode = "flight";
  else if (to.noRail) mode = straight > 450 ? "flight" : "road";
  else if (straight > 220) mode = "train";
  else mode = "road";

  let km: number;
  let hours: number;
  let costPerPerson: number;
  if (mode === "flight" || mode === "ferry or flight") {
    km = straight;
    hours = straight / 650 + 3.5;
    costPerPerson = Math.max(3000, straight * 6);
  } else if (mode === "train") {
    km = straight * 1.3;
    hours = km / 55;
    costPerPerson = km * 1.2;
  } else {
    km = straight * 1.35;
    hours = km / 45;
    costPerPerson = km * 2.5;
  }
  return {
    from: from.name,
    to: to.name,
    fromPoint: from.point,
    toPoint: to.point,
    km: Math.round(km),
    hours: Math.round(hours * 10) / 10,
    mode,
    costPerPerson: Math.round(costPerPerson),
  };
}

/** Shares days out by each destination's suggested stay, with at least one each. */
export function allocateDays(list: Destination[], available: number): number[] {
  const share = list.map((item) => (item.recommendedDays.min + item.recommendedDays.max) / 2);
  const total = share.reduce((sum, value) => sum + value, 0);
  const days = share.map((value) => Math.max(1, Math.floor((value / total) * available)));
  let spare = available - days.reduce((sum, value) => sum + value, 0);
  let index = 0;
  while (spare > 0 && list.length) {
    days[index % list.length]! += 1;
    spare -= 1;
    index += 1;
  }
  while (spare < 0) {
    const largest = days.indexOf(Math.max(...days));
    if (days[largest]! <= 1) break;
    days[largest]! -= 1;
    spare += 1;
  }
  return days;
}

function pickTier(budgetPerPersonPerDay: number | null, list: Destination[]): Itinerary["tier"] {
  if (budgetPerPersonPerDay === null) return "midRange";
  const average = (tier: Itinerary["tier"]) =>
    list.reduce((sum, item) => sum + item.budget[tier][1], 0) / Math.max(1, list.length);
  if (budgetPerPersonPerDay >= average("comfort")) return "comfort";
  if (budgetPerPersonPerDay >= average("midRange")) return "midRange";
  return "budget";
}

function rankAttractions(list: Attraction[], interests: TravelInterest[]): Attraction[] {
  return list
    .map((attraction, index) => ({
      attraction,
      score: attraction.interests.filter((interest) => interests.includes(interest)).length * 10 - index,
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ attraction }) => attraction);
}

const PART_OF_DAY: Record<NonNullable<Attraction["timeOfDay"]>, number> = {
  morning: 0,
  any: 1,
  afternoon: 2,
  evening: 3,
};

function addDays(iso: string, count: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

export function generateItinerary(input: TripInput, catalogue: Destination[]): Itinerary {
  const chosen = input.destinationSlugs
    .map((slug) => catalogue.find((item) => item.slug === slug))
    .filter((item): item is Destination => Boolean(item));
  const ordered = input.keepOrder ? chosen : nearestOrder(input.start, chosen);
  const warnings: string[] = [];
  const maxHours = PACE_HOURS[input.pace ?? "balanced"];

  const legs: TripLeg[] = [];
  let previous = { name: input.startName, point: input.start };
  for (const stop of ordered) {
    legs.push(
      planLeg(
        previous,
        { name: stop.name, point: stop.coordinates, island: ISLAND_SLUGS.has(stop.slug), noRail: NO_RAIL_SLUGS.has(stop.slug) },
        input.transport,
      ),
    );
    if (input.transport === "train" && NO_RAIL_SLUGS.has(stop.slug)) {
      warnings.push(`${stop.name} has no railway station within practical reach, so that leg is shown by road.`);
    }
    previous = { name: stop.name, point: stop.coordinates };
  }

  const longLegs = legs.reduce((sum, leg) => sum + travelDaysFor(leg), 0);
  const sightseeingDays = Math.max(ordered.length, input.days - longLegs);
  if (input.days < ordered.length + longLegs) {
    warnings.push(
      `${input.days} days is tight for ${ordered.length} ${ordered.length === 1 ? "place" : "places"} with this much travel. Consider dropping a stop or adding days.`,
    );
  }
  const allocation = allocateDays(ordered, sightseeingDays);
  const perDayBudget = input.budget === null ? null : input.budget / input.travellers / input.days;
  const tier = pickTier(perDayBudget, ordered);

  const days: TripDay[] = [];
  let dayNumber = 0;
  const dateFor = (number: number) => (input.startDate ? addDays(input.startDate, number - 1) : null);

  ordered.forEach((stop, stopIndex) => {
    const leg = legs[stopIndex]!;
    const remaining = rankAttractions(stop.attractions, input.interests);
    const nights = allocation[stopIndex] ?? 1;
    const costPerDay = (stop.budget[tier][0] + stop.budget[tier][1]) / 2;
    const travelDays = travelDaysFor(leg);

    for (let part = 0; part < travelDays; part += 1) {
      dayNumber += 1;
      days.push({
        id: `day-${dayNumber}`,
        number: dayNumber,
        date: dateFor(dayNumber),
        place: `Travelling to ${stop.name}`,
        destinationSlug: stop.slug,
        items: [
          {
            id: `d${dayNumber}-travel`,
            kind: "travel",
            title: part === 0 ? `${leg.from} to ${leg.to}` : `Continuing to ${leg.to}`,
            note: `About ${leg.hours} hours by ${leg.mode}, roughly ${leg.km} km (estimate)`,
            hours: Math.min(leg.hours, 24),
          },
        ],
        food: "Carry water and snacks, and eat at major stops.",
        stay: leg.hours >= 12 ? "Overnight on board, or break the journey along the way." : "Check in on arrival.",
        alternative: null,
        costPerPerson: Math.round(stop.budget[tier][0] / 2),
      });
    }

    for (let night = 0; night < nights; night += 1) {
      dayNumber += 1;
      const items: TripItem[] = [];
      let hours = 0;
      if (night === 0 && travelDays === 0) {
        items.push({
          id: `d${dayNumber}-travel`,
          kind: "travel",
          title: `${leg.from} to ${leg.to}`,
          note: `About ${leg.hours} hours by ${leg.mode}, roughly ${leg.km} km (estimate)`,
          hours: leg.hours,
        });
        hours = Math.min(leg.hours, maxHours - 1);
      }
      const picks: Attraction[] = [];
      for (const attraction of [...remaining]) {
        // A full-day outing counts as one whole day, so it can never block the rest of the stop.
        const cost = Math.min(attraction.visitHours, maxHours);
        if (hours + cost > maxHours) continue;
        picks.push(attraction);
        remaining.splice(remaining.indexOf(attraction), 1);
        hours += cost;
      }
      picks.sort((a, b) => PART_OF_DAY[a.timeOfDay ?? "any"] - PART_OF_DAY[b.timeOfDay ?? "any"]);
      for (const attraction of picks) {
        items.push({
          id: `d${dayNumber}-${attraction.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          kind: "visit",
          title: attraction.name,
          note: attraction.description,
          hours: attraction.visitHours,
        });
      }
      if (picks.length === 0 && night > 0) {
        items.push({
          id: `d${dayNumber}-free`,
          kind: "visit",
          title: "Unplanned time",
          note: stop.nearby[night % Math.max(1, stop.nearby.length)]
            ? `A slower day, or a side trip to ${stop.nearby[night % stop.nearby.length]!.name}: ${stop.nearby[night % stop.nearby.length]!.note}`
            : "A slower day for walking, markets and whatever you liked most.",
          hours: 4,
        });
      }
      const dish = stop.cuisine[(dayNumber - 1) % Math.max(1, stop.cuisine.length)];
      days.push({
        id: `day-${dayNumber}`,
        number: dayNumber,
        date: dateFor(dayNumber),
        place: stop.name,
        destinationSlug: stop.slug,
        items,
        food: dish ? `${dish.name}: ${dish.note}` : "Ask locally what is in season.",
        stay: stop.accommodation,
        alternative: remaining[0]?.name ?? stop.nearby[0]?.name ?? null,
        costPerPerson: Math.round(costPerDay),
      });
    }

    if (remaining.length > 0 && nights < stop.recommendedDays.min) {
      warnings.push(`${stop.name} usually needs at least ${stop.recommendedDays.min} days; some attractions were left out.`);
    }
    if (input.startDate && days.length) {
      const arrival = days.find((day) => day.destinationSlug === stop.slug)?.date;
      const month = arrival ? (Number(arrival.slice(5, 7)) as Month) : null;
      if (month && !stop.bestMonths.includes(month)) {
        warnings.push(`Your dates reach ${stop.name} outside its recommended months. ${stop.bestTimeNote}`);
      }
    }
    if (stop.permits) warnings.push(`${stop.name}: permits may be needed. ${stop.permits}`);
  });

  const travel = legs.reduce((sum, leg) => sum + leg.costPerPerson, 0);
  const ground = days.reduce((sum, day) => sum + day.costPerPerson, 0);
  const perPerson = travel + ground;
  const group = perPerson * input.travellers;
  if (input.budget !== null && group > input.budget) {
    warnings.push(
      `The estimate is above your budget by about ₹${Math.round(group - input.budget).toLocaleString("en-IN")} for the group. Fewer long legs or a shorter stay would bring it down.`,
    );
  }

  return { input, days, legs, tier, totals: { travel, ground, group, perPerson }, warnings };
}

/** Moves an item within or across days, keeping the plan otherwise unchanged. */
export function moveItem(days: TripDay[], itemId: string, toDayId: string, toIndex?: number): TripDay[] {
  const item = days.flatMap((day) => day.items).find((candidate) => candidate.id === itemId);
  if (!item) return days;
  const without = days.map((day) => ({ ...day, items: day.items.filter((candidate) => candidate.id !== itemId) }));
  return without.map((day) => {
    if (day.id !== toDayId) return day;
    const items = [...day.items];
    items.splice(toIndex ?? items.length, 0, item);
    return { ...day, items };
  });
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
}

/** One all-day calendar entry per day of the trip. */
export function toIcs(days: TripDay[], stamp = new Date()): string {
  const dtStamp = stamp.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tour India//Trip Planner//EN", "CALSCALE:GREGORIAN"];
  for (const day of days) {
    if (!day.date) continue;
    const start = day.date.replace(/-/g, "");
    const end = addDays(day.date, 1).replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:day-${day.number}-${start}@tourindia`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${icsEscape(`Day ${day.number}: ${day.place}`)}`,
      `DESCRIPTION:${icsEscape(day.items.map((item) => item.title).join("; "))}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function encodeTrip(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeTrip<T>(encoded: string): T | null {
  try {
    const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}

export interface Expense {
  id: string;
  label: string;
  amount: number;
  paidBy: string;
}

/** Works out who pays whom so that everyone ends up even, in as few payments as possible. */
export function settleUp(people: string[], expenses: Expense[]) {
  if (people.length === 0) return [];
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const share = total / people.length;
  const balance = new Map(people.map((person) => [person, -share]));
  for (const expense of expenses) {
    if (balance.has(expense.paidBy)) balance.set(expense.paidBy, balance.get(expense.paidBy)! + expense.amount);
  }
  const owes = [...balance].filter(([, value]) => value < -0.5).map(([name, value]) => ({ name, value: -value }));
  const owed = [...balance].filter(([, value]) => value > 0.5).map(([name, value]) => ({ name, value }));
  owes.sort((a, b) => b.value - a.value);
  owed.sort((a, b) => b.value - a.value);

  const payments: { from: string; to: string; amount: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < owes.length && j < owed.length) {
    const amount = Math.min(owes[i]!.value, owed[j]!.value);
    payments.push({ from: owes[i]!.name, to: owed[j]!.name, amount: Math.round(amount) });
    owes[i]!.value -= amount;
    owed[j]!.value -= amount;
    if (owes[i]!.value < 0.5) i += 1;
    if (owed[j]!.value < 0.5) j += 1;
  }
  return payments;
}

export function packingList(destinations: Destination[], months: number[]): { group: string; items: string[] }[] {
  const categories = new Set(destinations.flatMap((item) => item.categories));
  const cold = categories.has("mountains") || categories.has("hill-stations");
  const monsoon = months.some((month) => month >= 6 && month <= 9);
  const water = categories.has("beaches") || categories.has("lakes");
  const sacred = categories.has("religious") || categories.has("temples-heritage");
  const wild = categories.has("wildlife") || categories.has("national-parks");

  const groups = [
    { group: "Documents", items: ["Photo ID or passport, with copies", "Tickets and booking confirmations", "Any permits your route needs", "Travel insurance details"] },
    { group: "Health", items: ["Personal medicines and prescriptions", "Oral rehydration salts", "Hand sanitiser", "Sunscreen", "Insect repellent"] },
    { group: "Everyday", items: ["Refillable water bottle", "Power bank and adapter", "Comfortable walking shoes", "Some cash for small purchases"] },
  ];
  if (cold) groups.push({ group: "Cold weather", items: ["Warm layers", "Thermal base layer", "Woollen hat and gloves", "Sunglasses for high-altitude glare"] });
  if (monsoon) groups.push({ group: "Monsoon", items: ["Rain jacket", "Quick-drying clothes", "Waterproof bag for electronics", "Sandals with grip"] });
  if (water) groups.push({ group: "Beach and water", items: ["Swimwear", "Quick-dry towel", "Sun hat"] });
  if (sacred) groups.push({ group: "Sacred sites", items: ["Clothing that covers shoulders and knees", "Scarf for covering the head", "Easily removed shoes and clean socks"] });
  if (wild) groups.push({ group: "Wildlife", items: ["Binoculars", "Muted-colour clothing", "Layers for early safaris"] });
  return groups;
}
