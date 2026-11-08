import type { CategoryId, Month, RegionId, TravelInterest } from "@/types/content";

export const regions: { id: RegionId; name: string; blurb: string }[] = [
  { id: "north", name: "North India", blurb: "Himalayan valleys, the Ganga plain, Mughal capitals and the Thar." },
  { id: "west", name: "West India", blurb: "The Konkan coast, Deccan caves, the salt desert of Kutch and Mumbai." },
  { id: "central", name: "Central India", blurb: "Tiger forests, temple towns and the Adivasi heartland." },
  { id: "south", name: "South India", blurb: "Dravidian temples, backwaters, spice hills and Deccan ruins." },
  { id: "east", name: "East India", blurb: "Kolkata, the Sundarbans, Odisha's temples and Buddhist Bihar." },
  { id: "northeast", name: "Northeast India", blurb: "Eight states of rainforest, river islands and high monasteries." },
  { id: "islands", name: "Islands", blurb: "The Andaman and Nicobar archipelago and the Lakshadweep atolls." },
];

export const categories: { id: CategoryId; name: string; blurb: string }[] = [
  { id: "hill-stations", name: "Hill stations", blurb: "Cool-weather towns in the Himalaya, Western Ghats and Nilgiris." },
  { id: "beaches", name: "Beaches", blurb: "Arabian Sea and Bay of Bengal shores, plus island coral sand." },
  { id: "mountains", name: "Mountains", blurb: "High passes, cold deserts and trekking country." },
  { id: "waterfalls", name: "Waterfalls", blurb: "Falls at their fullest during and just after the monsoon." },
  { id: "lakes", name: "Lakes", blurb: "High-altitude, palace-lined and floating-island lakes." },
  { id: "monuments", name: "Historical monuments", blurb: "Tombs, observatories, stepwells and colonial landmarks." },
  { id: "forts-palaces", name: "Forts and palaces", blurb: "Rajput, Mughal, Deccan and princely-state architecture." },
  { id: "temples-heritage", name: "Temples and heritage", blurb: "Living temple towns and carved stone from many dynasties." },
  { id: "wildlife", name: "Wildlife sanctuaries", blurb: "Places to see tigers, rhinos, elephants and birds." },
  { id: "national-parks", name: "National parks", blurb: "Protected landscapes, with seasonal opening and permit rules." },
  { id: "adventure", name: "Adventure", blurb: "Trekking, rafting, diving and high-altitude road journeys." },
  { id: "religious", name: "Pilgrimage", blurb: "Sacred sites across India's many faiths." },
  { id: "cultural", name: "Culture", blurb: "Living crafts, performance traditions and city neighbourhoods." },
  { id: "village", name: "Village tourism", blurb: "Community-run stays and rural landscapes." },
  { id: "photography", name: "Photography", blurb: "Places that reward an early start and a patient eye." },
  { id: "weekend", name: "Weekend getaways", blurb: "Short trips that work in two to three days." },
  { id: "hidden-gems", name: "Lesser-known places", blurb: "Quieter alternatives that see fewer visitors." },
];

export const interests: { id: TravelInterest; name: string }[] = [
  { id: "history", name: "History" },
  { id: "nature", name: "Nature" },
  { id: "spiritual", name: "Spiritual" },
  { id: "food", name: "Food" },
  { id: "adventure", name: "Adventure" },
  { id: "wildlife", name: "Wildlife" },
  { id: "culture", name: "Culture" },
  { id: "relaxation", name: "Relaxation" },
  { id: "photography", name: "Photography" },
  { id: "shopping", name: "Markets and crafts" },
];

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function monthName(month: Month | number): string {
  return monthNames[month - 1] ?? "";
}

export function regionName(id: RegionId): string {
  return regions.find((region) => region.id === id)?.name ?? id;
}

export function categoryName(id: CategoryId): string {
  return categories.find((category) => category.id === id)?.name ?? id;
}

/** Compresses a list of month numbers into text such as "October to March". */
export function formatMonthRange(months: readonly number[]): string {
  if (months.length === 0) return "Varies";
  if (months.length === 12) return "All year";
  const set = new Set(months);
  const start = months.find((month) => !set.has(month === 1 ? 12 : month - 1)) ?? months[0]!;
  const ranges: [number, number][] = [];
  let cursor = start;
  let visited = 0;
  while (visited < 12) {
    if (set.has(cursor)) {
      const from = cursor;
      let to = cursor;
      while (set.has(to === 12 ? 1 : to + 1) && (to === 12 ? 1 : to + 1) !== from) {
        to = to === 12 ? 1 : to + 1;
        visited += 1;
      }
      ranges.push([from, to]);
      cursor = to;
    }
    cursor = cursor === 12 ? 1 : cursor + 1;
    visited += 1;
  }
  return ranges
    .map(([from, to]) => (from === to ? monthName(from) : `${monthName(from)} to ${monthName(to)}`))
    .join(", ");
}
