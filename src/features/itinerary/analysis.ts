/**
 * Trip analysis: scores a generated itinerary and explains why, from data on this site only
 * (each guide's best months, festival dates confirmed against sources, public holidays,
 * and the generator's own travel estimates). Pure and deterministic, so it is unit-tested
 * and runs in the browser. Weather notes are seasonal patterns, not forecasts.
 */
import type { Itinerary, PlannerDestination, TripLeg } from "./generate";
import { PACE_HOURS } from "./generate";

export interface FestivalFact {
  name: string;
  slug: string;
  stateSlugs: string[];
  panIndian: boolean;
  /** Confirmed start dates (ISO). */
  dates: string[];
}

export interface HolidayFact {
  date: string;
  name: string;
}

export type Tone = "good" | "watch" | "risk";
export interface Finding {
  tone: Tone;
  text: string;
  /** A same-site link with more detail. */
  href?: string;
}
export interface ScorePart {
  label: string;
  score: number;
  findings: Finding[];
}
export interface TripAnalysis {
  score: number;
  verdict: string;
  parts: ScorePart[];
  festivals: { name: string; slug: string; date: string; place: string }[];
  holidays: HolidayFact[];
  stats: { totalKm: number; travelHours: number; sightseeingHours: number; busiestDay: number; carbonKg: number };
  suggestions: string[];
}

const MONSOON: Record<string, number[]> = {
  default: [6, 7, 8, 9],
  // The north-east monsoon brings the main rain to Tamil Nadu and Puducherry.
  "tamil-nadu": [10, 11, 12],
  puducherry: [10, 11, 12],
  kerala: [6, 7, 8, 9, 10],
  meghalaya: [5, 6, 7, 8, 9],
};
/** Regions with very hot pre-monsoon months in the plains. */
const HOT_REGIONS = new Set(["north", "central", "west"]);
const HOT_MONTHS = [4, 5, 6];
const COLD_MONTHS = [12, 1, 2];
/** Per passenger, per km: rough averages for comparison, not a carbon audit. */
const CARBON_PER_KM: Record<TripLeg["mode"], number> = { train: 0.035, road: 0.11, flight: 0.15, "ferry or flight": 0.15 };

const monthOf = (iso: string) => Number(iso.slice(5, 7));
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const isMountain = (place: PlannerDestination) => place.categories.some((category) => category === "mountains" || category === "hill-stations");

function addDays(iso: string, count: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

export function analyzeTrip(trip: Itinerary, catalogue: PlannerDestination[], festivals: FestivalFact[], holidays: HolidayFact[]): TripAnalysis {
  const input = trip.input;
  const places = new Map(catalogue.map((place) => [place.slug, place]));
  const start = input.startDate;
  const end = start ? addDays(start, Math.max(trip.days.length - 1, 0)) : null;
  const pace = input.pace ?? "balanced";
  const dayHours = trip.days.map((day) => day.items.reduce((sum, item) => sum + item.hours, 0));
  const sightseeingHours = trip.days.reduce((sum, day) => sum + day.items.filter((item) => item.kind === "visit").reduce((total, item) => total + item.hours, 0), 0);
  const travelHours = trip.legs.reduce((sum, leg) => sum + leg.hours, 0);
  const totalKm = Math.round(trip.legs.reduce((sum, leg) => sum + leg.km, 0));
  const carbonKg = Math.round(trip.legs.reduce((sum, leg) => sum + leg.km * CARBON_PER_KM[leg.mode], 0));
  const suggestions: string[] = [];

  // ---- Season and weather -------------------------------------------------
  const season: Finding[] = [];
  let seasonScore = 100;
  if (!start) {
    season.push({ tone: "watch", text: "Add a start date to check seasons, festivals and holidays." });
    seasonScore = 70;
  } else {
    const seen = new Set<string>();
    for (const day of trip.days) {
      const place = places.get(day.destinationSlug);
      if (!place || !day.date || seen.has(place.slug)) continue;
      seen.add(place.slug);
      const month = monthOf(day.date);
      if (place.bestMonths.includes(month as never)) {
        season.push({ tone: "good", text: `${place.name} is in its best season.` });
      } else {
        seasonScore -= 25;
        season.push({ tone: "risk", text: `${place.name} is outside its best months. ${place.bestTimeNote}`, href: `/destinations/${place.slug}#when` });
      }
      const wet = MONSOON[place.stateSlug] ?? MONSOON.default!;
      if (wet.includes(month)) {
        seasonScore -= 8;
        season.push({ tone: "watch", text: `${place.name}: monsoon rain is likely. Allow for slow roads and landslides in hill areas.` });
      }
      if (HOT_REGIONS.has(place.region) && HOT_MONTHS.includes(month) && !isMountain(place)) {
        seasonScore -= 8;
        season.push({ tone: "watch", text: `${place.name}: daytime heat is usually severe. Sightsee early and late.` });
      }
      if (isMountain(place) && COLD_MONTHS.includes(month)) {
        seasonScore -= 6;
        season.push({ tone: "watch", text: `${place.name}: expect cold and possible snow closures on high passes.` });
      }
    }
  }

  // ---- Festivals and public holidays -------------------------------------
  const visitedStates = new Set(trip.days.map((day) => places.get(day.destinationSlug)?.stateSlug).filter(Boolean) as string[]);
  const inTrip = (iso: string) => Boolean(start && end && iso >= start && iso <= end);
  const tripFestivals: TripAnalysis["festivals"] = [];
  for (const festival of festivals) {
    for (const date of festival.dates) {
      if (!inTrip(date)) continue;
      const day = trip.days.find((item) => item.date === date);
      const statePlace = day && places.get(day.destinationSlug);
      if (festival.panIndian || festival.stateSlugs.some((state) => visitedStates.has(state))) {
        tripFestivals.push({ name: festival.name, slug: festival.slug, date, place: statePlace?.name ?? "on your route" });
      }
    }
  }
  const tripHolidays = holidays.filter((holiday) => inTrip(holiday.date));
  const events: Finding[] = [
    ...tripFestivals.map<Finding>((festival) => ({ tone: "good", text: `${festival.name} falls on ${festival.date}, while you are ${festival.place === "on your route" ? "travelling" : `in ${festival.place}`}. Expect celebrations, and crowds.`, href: `/culture/festivals/${festival.slug}` })),
    ...tripHolidays.map<Finding>((holiday) => ({ tone: "watch", text: `${holiday.name} (${holiday.date}) is a public holiday: trains and popular sights are busier, and some offices close.` })),
  ];
  if (tripFestivals.length || tripHolidays.length) suggestions.push("Book trains and rooms early: your dates include festivals or holidays.");

  // ---- Pace --------------------------------------------------------------
  const pacing: Finding[] = [];
  let paceScore = 100;
  const limit = PACE_HOURS[pace];
  const busiestDay = Math.max(0, ...dayHours);
  const longLegs = trip.legs.filter((leg) => leg.hours > 8);
  const overfull = dayHours.filter((hours) => hours > limit).length;
  if (overfull) {
    paceScore -= overfull * 10;
    pacing.push({ tone: "watch", text: `${overfull} day${overfull > 1 ? "s are" : " is"} fuller than your ${pace} pace.` });
  }
  if (longLegs.length) {
    paceScore -= longLegs.length * 8;
    pacing.push({ tone: "watch", text: `${longLegs.length} journey${longLegs.length > 1 ? "s take" : " takes"} over 8 hours. Consider an overnight train or a flight.` });
  }
  const stops = new Set(trip.days.map((day) => day.destinationSlug)).size;
  if (trip.days.length && stops / trip.days.length > 0.5 && trip.days.length > 3) {
    paceScore -= 15;
    pacing.push({ tone: "risk", text: "You change base more than every other day. Fewer stops would mean less packing and more seeing." });
    suggestions.push("Drop one stop, or add days, so each place gets at least two nights.");
  }
  if ((input.withChildren || input.withSeniors) && pace === "packed") {
    paceScore -= 15;
    pacing.push({ tone: "risk", text: "A packed pace is hard going with children or older travellers. Try relaxed or balanced." });
  }
  if (trip.days.length >= 7 && !trip.days.some((day, index) => index > 0 && dayHours[index]! <= 3)) {
    suggestions.push("Plan a light day mid-trip to rest, do laundry and catch up.");
  }
  if (!pacing.length) pacing.push({ tone: "good", text: `Days fit your ${pace} pace, with up to ${limit} hours of plans.` });

  // ---- Budget ------------------------------------------------------------
  const money: Finding[] = [];
  let budgetScore = 100;
  const travelShare = trip.totals.group ? trip.totals.travel / trip.totals.group : 0;
  if (input.budget !== null) {
    const ratio = trip.totals.group / input.budget;
    if (ratio > 1.15) {
      budgetScore -= Math.min(60, (ratio - 1) * 100);
      money.push({ tone: "risk", text: `The estimate is about ${Math.round((ratio - 1) * 100)}% over your budget.` });
      suggestions.push("To save money: take trains instead of flights, cut a far-off stop, or travel outside peak season.");
    } else if (ratio < 0.7) {
      money.push({ tone: "good", text: "Comfortably within budget, with room for better stays or experiences." });
    } else {
      money.push({ tone: "good", text: "Close to your budget. Keep a margin for surprises." });
    }
  } else {
    money.push({ tone: "watch", text: "No budget set, so this checks the split only." });
    budgetScore = 85;
  }
  if (travelShare > 0.5) {
    budgetScore -= 10;
    money.push({ tone: "watch", text: `Getting around is ${Math.round(travelShare * 100)}% of the cost. Closer stops would stretch the budget further.` });
  }

  // ---- Practicalities ----------------------------------------------------
  const practical: Finding[] = [];
  let practicalScore = 100;
  for (const slug of new Set(trip.days.map((day) => day.destinationSlug))) {
    const place = places.get(slug);
    if (place?.permits) {
      practicalScore -= 10;
      practical.push({ tone: "watch", text: `${place.name}: check permits before you book.`, href: `/destinations/${slug}` });
    }
    if (input.stepFree && isMountain(place!)) {
      practicalScore -= 10;
      practical.push({ tone: "watch", text: `${place!.name} has steep, uneven paths; step-free access is limited.` });
    }
  }
  if (input.diet === "jain" || input.diet === "vegan") {
    practical.push({ tone: "watch", text: `${input.diet === "jain" ? "Jain" : "Vegan"} meals are easy in big cities; in small towns, ask ahead and carry snacks.` });
  }
  if (input.withChildren) practical.push({ tone: "good", text: "Travelling with children: plan rest in the afternoon heat, and carry ORS and snacks." });
  if (carbonKg > 0) practical.push({ tone: trip.legs.some((leg) => leg.mode === "flight") ? "watch" : "good", text: `Travel emissions are roughly ${carbonKg} kg CO₂ per person (a rough average by mode). Trains are the lowest.` });
  if (!practical.length) practical.push({ tone: "good", text: "No permits or access issues flagged for these stops." });

  const parts: ScorePart[] = [
    { label: "Season and weather", score: clamp(seasonScore), findings: season },
    { label: "Pace", score: clamp(paceScore), findings: pacing },
    { label: "Budget", score: clamp(budgetScore), findings: money },
    { label: "Practicalities", score: clamp(practicalScore), findings: practical },
  ];
  // Season matters most: a well-paced trip in the wrong month still disappoints.
  const score = clamp(parts[0]!.score * 0.35 + parts[1]!.score * 0.25 + parts[2]!.score * 0.2 + parts[3]!.score * 0.2);
  const verdict = score >= 85 ? "A well-balanced plan" : score >= 70 ? "A good plan with a few things to check" : score >= 50 ? "Workable, but worth adjusting" : "This plan needs changes";

  return {
    score,
    verdict,
    parts: events.length ? [...parts, { label: "Festivals and holidays", score: 100, findings: events }] : parts,
    festivals: tripFestivals,
    holidays: tripHolidays,
    stats: { totalKm, travelHours: Math.round(travelHours), sightseeingHours: Math.round(sightseeingHours), busiestDay: Math.round(busiestDay), carbonKg },
    suggestions,
  };
}

/** Google Maps directions for the whole route, from the start city through each stop. No key needed. */
export function googleMapsRoute(trip: Itinerary): string {
  const points = [trip.legs[0]?.fromPoint, ...trip.legs.map((leg) => leg.toPoint)].filter(Boolean) as { lat: number; lng: number }[];
  const text = (point: { lat: number; lng: number }) => `${point.lat},${point.lng}`;
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  if (points.length) url.searchParams.set("origin", text(points[0]!));
  if (points.length > 1) url.searchParams.set("destination", text(points[points.length - 1]!));
  if (points.length > 2) url.searchParams.set("waypoints", points.slice(1, -1).map(text).join("|"));
  url.searchParams.set("travelmode", trip.input.transport === "road" ? "driving" : "transit");
  return url.toString();
}
