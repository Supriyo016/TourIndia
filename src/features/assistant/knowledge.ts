import { destinations, getState, states } from "@/data";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { holidaysForYear } from "@/data/holidays";
import { startCities } from "@/data/start-cities";
import { stories } from "@/data/stories";
import { categories, formatMonthRange, monthName, monthNames, regions } from "@/data/taxonomy";
import { nextHoliday, todayInIndia } from "@/features/calendar/calendar";
import { searchEntries } from "@/features/discovery/search";
import { buildSearchIndex } from "@/features/discovery/search-index";
import { generateItinerary, ESTIMATE_ASSUMPTIONS, type TransportMode } from "@/features/itinerary/generate";
import { shareHash } from "@/features/itinerary/share";
import type { CategoryId, Destination, RegionId, TravelInterest } from "@/types/content";

/**
 * Read-only answers from Tour India's own content. Both the AI tools and the
 * no-AI guide mode use these, so they always agree with what the site says.
 */
const normalise = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const mentions = (text: string, phrase: string) => ` ${text} `.includes(` ${normalise(phrase)} `);

export function resolveDestination(text: string): Destination | undefined {
  const needle = normalise(text);
  return (
    destinations.find((item) => item.slug === text || normalise(item.name) === needle) ??
    destinations.find((item) => normalise(item.name).includes(needle) && needle.length >= 3) ??
    destinations.find((item) => needle.includes(normalise(item.name)))
  );
}

const resolveState = (text: string) => {
  const needle = normalise(text);
  return states.find((item) => item.slug === text || normalise(item.name) === needle) ?? states.find((item) => normalise(item.name).includes(needle) && needle.length >= 3);
};

export function searchSite(query: string, limit = 6) {
  return searchEntries(buildSearchIndex(), query, limit).map(({ type, title, subtitle, href }) => ({ type, title, subtitle, href }));
}

export function destinationBrief(name: string) {
  const item = resolveDestination(name);
  if (!item) return { found: false, message: `No guide matches "${name}".`, suggestions: searchSite(name, 4) };
  return {
    found: true,
    name: item.name,
    state: getState(item.stateSlug)?.name,
    href: `/destinations/${item.slug}`,
    tagline: item.tagline,
    overview: item.overview[0],
    bestMonths: formatMonthRange(item.bestMonths),
    bestTimeNote: item.bestTimeNote,
    suggestedDays: `${item.recommendedDays.min} to ${item.recommendedDays.max}`,
    dailyCostEstimateInr: { budget: item.budget.budget, midRange: item.budget.midRange, comfort: item.budget.comfort, assumptions: item.budget.assumptions },
    attractions: item.attractions.map(({ name: title, visitHours }) => ({ name: title, visitHours })),
    gettingThere: item.gettingThere,
    stay: item.accommodation,
    food: item.cuisine.map((dish) => dish.name),
    festivals: item.festivals,
    permits: item.permits ?? null,
    precautions: item.precautions,
    accessibility: item.accessibility,
    nearby: item.nearby.map((place) => `${place.name} (about ${place.distanceKm} km)`),
    lastUpdated: item.lastReviewed,
  };
}

export function stateBrief(name: string) {
  const item = resolveState(name);
  if (!item) return { found: false, message: `No state or Union Territory matches "${name}".` };
  return {
    found: true,
    name: item.name,
    kind: item.kind,
    capital: item.capital,
    href: `/explore/${item.slug}`,
    tagline: item.tagline,
    culture: item.culture,
    bestMonths: formatMonthRange(item.bestMonths),
    food: item.cuisine,
    festivals: item.festivals,
    languages: item.languages,
    permitNote: item.permitNote ?? null,
    guides: destinations.filter((guide) => guide.stateSlug === item.slug).map((guide) => ({ name: guide.name, href: `/destinations/${guide.slug}` })),
  };
}

export function findDestinations(filters: { month?: number; region?: string; category?: string; maxDays?: number; limit?: number }) {
  return destinations
    .filter((item) => !filters.month || item.bestMonths.includes(filters.month as never))
    .filter((item) => !filters.region || item.region === (filters.region as RegionId))
    .filter((item) => !filters.category || item.categories.includes(filters.category as CategoryId))
    .filter((item) => !filters.maxDays || item.recommendedDays.min <= filters.maxDays)
    .slice(0, filters.limit ?? 8)
    .map((item) => ({ name: item.name, state: getState(item.stateSlug)?.name, tagline: item.tagline, bestMonths: formatMonthRange(item.bestMonths), href: `/destinations/${item.slug}` }));
}

export function festivalsInfo(filters: { month?: number; state?: string; name?: string }) {
  const state = filters.state ? resolveState(filters.state) : undefined;
  const needle = filters.name ? normalise(filters.name) : "";
  return festivals
    .filter((item) => !filters.month || item.months.includes(filters.month as never))
    .filter((item) => !state || item.panIndian || item.stateSlugs.includes(state.slug))
    .filter((item) => !needle || normalise(item.name).includes(needle))
    .slice(0, 10)
    .map((item) => ({
      name: item.name,
      href: `/culture/festivals/${item.slug}`,
      usualMonths: formatMonthRange(item.months),
      howDateIsSet: item.dateRule,
      confirmedDates: item.confirmedDates.map((date) => date.label),
      summary: item.summary,
    }));
}

export function holidaysInfo(filters: { year?: number; month?: number }) {
  const year = filters.year ?? Number(todayInIndia().slice(0, 4));
  const prefix = filters.month ? `${year}-${String(filters.month).padStart(2, "0")}` : `${year}`;
  return {
    calendar: "/calendar",
    note: "Fixed national holidays and days from Government of India lists. States add their own, and moon-dependent dates can change.",
    holidays: holidaysForYear(year).filter((holiday) => holiday.date.startsWith(prefix)).map(({ date, name, note }) => ({ date, name, note })),
  };
}

export function foodInfo(query: string) {
  const needle = normalise(query);
  return foods
    .filter((item) => normalise(`${item.name} ${item.description} ${item.ingredients.join(" ")} ${item.stateSlugs.join(" ")} ${item.region}`).includes(needle))
    .slice(0, 6)
    .map((item) => ({ name: item.name, vegetarian: item.vegetarian, description: item.description, hasRecipe: Boolean(item.recipe), href: `/culture/food/${item.slug}` }));
}

export function practicalInfo() {
  return {
    emergencyNumber: "112",
    touristHelpline: "1800-11-1363 (short code 1363), Ministry of Tourism",
    safetyPage: "/services#safety",
    bookingsPage: "/bookings",
    permitsGuide: "/stories/permits-for-restricted-areas",
    trainGuide: "/stories/how-to-book-and-read-indian-train-tickets",
    tourIndiaSellsTravel: false,
  };
}

export function planTrip(input: { start: string; destinations: string[]; days: number; travellers?: number; budget?: number | null; startDate?: string | null; transport?: TransportMode; interests?: TravelInterest[] }) {
  const city = startCities.find((item) => normalise(item.name).startsWith(normalise(input.start))) ?? startCities.find((item) => item.name === "Delhi")!;
  const chosen = input.destinations.map(resolveDestination).filter((item): item is Destination => Boolean(item));
  if (chosen.length === 0) return { found: false, message: "None of those places has a guide yet." };
  const trip = generateItinerary(
    {
      startName: city.name,
      start: city.point,
      destinationSlugs: [...new Set(chosen.map((item) => item.slug))].slice(0, 6),
      startDate: input.startDate ?? null,
      travellers: Math.min(Math.max(input.travellers ?? 2, 1), 30),
      days: Math.min(Math.max(input.days, 1), 45),
      budget: input.budget ?? null,
      transport: input.transport ?? "mixed",
      interests: input.interests ?? [],
    },
    destinations,
  );
  return {
    found: true,
    startingFrom: city.name,
    days: trip.days.map((day) => ({ day: day.number, date: day.date, place: day.place, plan: day.items.map((item) => item.title), food: day.food.split(":")[0] })),
    legs: trip.legs.map((leg) => `${leg.from} to ${leg.to}: about ${leg.hours} h by ${leg.mode}`),
    estimatedCostInr: trip.totals,
    warnings: trip.warnings,
    estimateAssumptions: ESTIMATE_ASSUMPTIONS,
    openInPlanner: `/planner#${shareHash(trip.input, trip.days)}`,
  };
}

export function today() {
  const date = todayInIndia();
  return { date, weekdayAndDate: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }), nextHoliday: nextHoliday(date) ?? null };
}

function parseMonth(text: string): number | undefined {
  const index = monthNames.findIndex((name) => mentions(text, name));
  return index >= 0 ? index + 1 : undefined;
}

const link = (label: string, href: string) => `[${label}](${href})`;

const findNamed = <T,>(text: string, items: T[], nameOf: (item: T) => string) =>
  [...items].sort((a, b) => nameOf(b).length - nameOf(a).length).find((item) => mentions(text, nameOf(item)));

/** Answers from site content alone, for when no AI model is connected or it fails. */
export function answerLocally(question: string): string {
  const text = normalise(question);
  const month = parseMonth(text);
  const place = findNamed(text, destinations, (item) => item.name);
  const state = findNamed(text, states, (item) => item.name);
  const festival = findNamed(text, festivals, (item) => item.name);
  const food = findNamed(text, foods, (item) => item.name);

  if (/\b(emergency|police|ambulance|helpline|hospital|lost|stolen)\b/.test(text)) {
    return `In India, call **112** for police, fire or ambulance. The Ministry of Tourism's helpline is **1800-11-1363**. There's more on the ${link("safety page", "/services#safety")}.`;
  }
  if (/\b(book|booking|ticket|tickets|refund)\b/.test(text) && !place) {
    return `Tour India doesn't sell tickets or take bookings. ${link("Where to book", "/bookings")} lists official sites, and there's a guide to ${link("Indian train tickets", "/stories/how-to-book-and-read-indian-train-tickets")}.`;
  }
  if (/\bholidays?\b/.test(text)) {
    const { nextHoliday: upcoming } = today();
    return `${upcoming ? `The next listed holiday is **${upcoming.name}** on ${upcoming.date}. ` : ""}See every listed date on the ${link("calendar", "/calendar")}.`;
  }
  if (/\b(permit|permits|ilp|rap|pap)\b/.test(text)) {
    const note = place?.permits ?? state?.permitNote;
    return `${note ? `${note} ` : ""}Rules differ for Indian and foreign visitors and can change, so confirm with the issuing authority. Start with the ${link("guide to permits", "/stories/permits-for-restricted-areas")}.`;
  }
  if (festival) {
    const dates = festival.confirmedDates[0]?.label;
    return `**${festival.name}**: ${festival.summary} ${dates ? `Confirmed: ${dates}.` : `It usually falls in ${formatMonthRange(festival.months)}.`} Read ${link("more about it", `/culture/festivals/${festival.slug}`)}.`;
  }
  if (food) return `**${food.name}**: ${food.description} ${link("See the dish", `/culture/food/${food.slug}`)}.`;
  if (place && /\b(plan|itinerary|trip)\b/.test(text)) {
    return `Start a day-by-day plan for ${place.name} in the ${link("trip planner", `/planner?d=${place.slug}`)}. A typical stay is ${place.recommendedDays.min} to ${place.recommendedDays.max} days.`;
  }
  if (place) {
    return `**${place.name}**, ${getState(place.stateSlug)?.name}: ${place.tagline} Best months: ${formatMonthRange(place.bestMonths)}. Typical stay: ${place.recommendedDays.min} to ${place.recommendedDays.max} days.${place.permits ? ` Permits: ${place.permits}` : ""} Read the ${link("full guide", `/destinations/${place.slug}`)}.`;
  }
  if (state) return `**${state.name}**: ${state.tagline} Best months: ${formatMonthRange(state.bestMonths)}. Capital: ${state.capital}. ${link(`Explore ${state.name}`, `/explore/${state.slug}`)}.`;
  if (month) {
    const region = regions.find((item) => mentions(text, item.id) || mentions(text, item.name));
    const list = findDestinations({ month, region: region?.id, limit: 6 });
    return `Good places to visit in ${monthName(month)}${region ? ` in ${region.name}` : ""}:\n${list.map((item) => `- ${link(item.name, item.href)}, ${item.state}`).join("\n")}`;
  }
  const category = categories.find((item) => mentions(text, item.name) || mentions(text, item.id.replace(/-/g, " ")));
  if (category) return `${category.blurb} Browse ${link(category.name.toLowerCase(), `/discover/${category.id}`)}.`;
  if (/\b(eat|food|dish|dishes|recipe|cuisine)\b/.test(text)) return `The ${link("food explorer", "/culture/food")} covers dishes and recipes by region.`;

  const results = searchSite(question, 5);
  if (results.length) return `Here's what I found on Tour India:\n${results.map((item) => `- ${link(item.title, item.href)} (${item.type})`).join("\n")}`;
  return `I couldn't find that in Tour India's guides. Try a state, a town, a festival or a month, or ${link("browse every guide", "/discover")}.`;
}
