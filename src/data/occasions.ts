/**
 * Everything the calendar shows, for any year from 2000 to 2100: national holidays, central
 * government public holidays, festivals, national and international days on fixed dates,
 * state formation days, and typical nature seasons.
 *
 * Dates published by a source (holidays.ts, festivals.ts) always win. For every other year,
 * festivals and holidays that follow the moon are calculated from astronomical rules (see
 * src/features/calendar/computed.ts), carry `calculated: true`, and say so on screen.
 * Fixed days appear only from the year they began.
 */
import { CALCULATED_NOTE, computedForYear } from "@/features/calendar/computed";
import { holidaysForYear, type Holiday } from "./holidays";

export type OccasionKind = "national" | "listed" | "festival" | "observance" | "state";

export interface Occasion {
  date: string;
  name: string;
  kind: OccasionKind;
  href?: string;
  note?: string;
  detail?: string;
  source?: { label: string; url: string };
  /** Worked out from astronomical rules rather than read from a published list. */
  calculated?: boolean;
}

export const OCCASION_KINDS: Record<OccasionKind, { label: string; className: string }> = {
  national: { label: "National holiday", className: "bg-rani" },
  listed: { label: "Public holiday", className: "bg-accent" },
  festival: { label: "Festival", className: "bg-gold" },
  observance: { label: "Day of observance", className: "bg-brand" },
  state: { label: "State day", className: "bg-forest" },
};

const wiki = (title: string) => ({ label: "Wikipedia", url: `https://en.wikipedia.org/wiki/${title}` });
const UN_DAYS = { label: "United Nations: international days", url: "https://www.un.org/en/observances/list-days-weeks" };

/** A day on a fixed date, shown from the year `from` (when it began) onward. */
type Fixed = Omit<Occasion, "date"> & { monthDay: string; from?: number };

const OBSERVANCES: Fixed[] = [
  { monthDay: "01-12", name: "National Youth Day", kind: "observance", detail: "Marks the birth anniversary of Swami Vivekananda.", source: wiki("National_Youth_Day_(India)") },
  { monthDay: "01-25", name: "National Tourism Day", kind: "observance", detail: "Observed by the Ministry of Tourism to highlight tourism's role in the economy.", source: wiki("National_Tourism_Day") },
  { monthDay: "01-25", name: "National Voters' Day", kind: "observance", from: 2011, detail: "Marks the founding of the Election Commission of India in 1950.", source: wiki("National_Voters%27_Day") },
  { monthDay: "02-28", name: "National Science Day", kind: "observance", detail: "Marks C. V. Raman's announcement of the Raman effect in 1928.", source: wiki("National_Science_Day") },
  { monthDay: "03-08", name: "International Women's Day", kind: "observance", source: UN_DAYS },
  { monthDay: "03-22", name: "World Water Day", kind: "observance", source: UN_DAYS },
  { monthDay: "04-14", name: "Ambedkar Jayanti", kind: "observance", detail: "Birth anniversary of B. R. Ambedkar, principal architect of the Constitution. A holiday in many states.", source: wiki("Ambedkar_Jayanti") },
  { monthDay: "04-22", name: "Earth Day", kind: "observance", source: UN_DAYS },
  { monthDay: "05-01", name: "Labour Day", kind: "observance", detail: "International Workers' Day. A holiday in several states.", source: wiki("International_Workers%27_Day") },
  { monthDay: "06-05", name: "World Environment Day", kind: "observance", source: UN_DAYS },
  { monthDay: "06-21", name: "International Day of Yoga", kind: "observance", from: 2015, detail: "Proposed by India and adopted by the UN General Assembly in 2014.", source: UN_DAYS },
  { monthDay: "07-01", name: "National Doctors' Day", kind: "observance", detail: "Birth and death anniversary of Dr B. C. Roy.", source: wiki("National_Doctors%27_Day") },
  { monthDay: "09-05", name: "Teachers' Day", kind: "observance", detail: "Birth anniversary of S. Radhakrishnan, India's second President.", source: wiki("Teachers%27_Day") },
  { monthDay: "09-14", name: "Hindi Diwas", kind: "observance", detail: "Marks the adoption of Hindi in Devanagari as an official language of the Union in 1949.", source: wiki("Hindi_Day") },
  { monthDay: "09-27", name: "World Tourism Day", kind: "observance", source: UN_DAYS },
  { monthDay: "10-31", name: "National Unity Day", kind: "observance", from: 2014, detail: "Birth anniversary of Sardar Vallabhbhai Patel.", source: wiki("National_Unity_Day_(India)") },
  { monthDay: "11-14", name: "Children's Day", kind: "observance", detail: "Birth anniversary of Jawaharlal Nehru.", source: wiki("Children%27s_Day#India") },
  { monthDay: "11-26", name: "Constitution Day", kind: "observance", from: 2015, detail: "Marks the adoption of the Constitution of India in 1949. Observed under this name since 2015.", source: wiki("Constitution_Day_(India)") },
  { monthDay: "12-04", name: "Navy Day", kind: "observance", source: wiki("Navy_Day_(India)") },
];

const STATE_DAYS: Fixed[] = [
  { monthDay: "03-22", name: "Bihar Day", kind: "state", href: "/explore/bihar", from: 2010, detail: "Marks the creation of Bihar as a separate province in 1912. Celebrated by the state since 2010.", source: wiki("Bihar_Day") },
  { monthDay: "04-01", name: "Odisha Day (Utkal Divas)", kind: "state", href: "/explore/odisha", detail: "Marks the formation of Odisha as a province in 1936.", source: wiki("Odisha_Day") },
  { monthDay: "05-01", name: "Maharashtra Day", kind: "state", href: "/explore/maharashtra", detail: "Marks the formation of Maharashtra in 1960.", source: wiki("Maharashtra_Day") },
  { monthDay: "05-01", name: "Gujarat Day", kind: "state", href: "/explore/gujarat", detail: "Marks the formation of Gujarat in 1960.", source: wiki("Gujarat_Day") },
  { monthDay: "06-02", name: "Telangana Formation Day", kind: "state", from: 2014, href: "/explore/telangana", detail: "Marks the formation of Telangana in 2014.", source: wiki("Telangana_Formation_Day") },
  { monthDay: "11-01", name: "Kerala Piravi", kind: "state", href: "/explore/kerala", detail: "Marks the formation of Kerala in 1956.", source: wiki("Kerala_Piravi") },
  { monthDay: "11-01", name: "Karnataka Rajyotsava", kind: "state", href: "/explore/karnataka", detail: "Marks the formation of the Mysore State, later Karnataka, in 1956.", source: wiki("Karnataka_Rajyotsava") },
  { monthDay: "12-19", name: "Goa Liberation Day", kind: "state", href: "/explore/goa", detail: "Marks the end of Portuguese rule in Goa in 1961.", source: wiki("Goa_Liberation_Day") },
  { monthDay: "01-21", name: "Manipur Statehood Day", kind: "state", href: "/explore/manipur", detail: "Manipur became a full state on 21 January 1972.", source: wiki("Manipur") },
  { monthDay: "01-21", name: "Meghalaya Statehood Day", kind: "state", href: "/explore/meghalaya", detail: "Meghalaya became a full state on 21 January 1972.", source: wiki("Meghalaya") },
  { monthDay: "01-21", name: "Tripura Statehood Day", kind: "state", href: "/explore/tripura", detail: "Tripura became a full state on 21 January 1972.", source: wiki("Tripura") },
  { monthDay: "01-24", name: "Uttar Pradesh Day", kind: "state", href: "/explore/uttar-pradesh", from: 2018, detail: "The state took the name Uttar Pradesh on 24 January 1950. Celebrated by the state since 2018.", source: wiki("Uttar_Pradesh") },
  { monthDay: "01-25", name: "Himachal Pradesh Statehood Day", kind: "state", href: "/explore/himachal-pradesh", detail: "Himachal Pradesh became a full state on 25 January 1971.", source: wiki("Himachal_Pradesh") },
  { monthDay: "02-20", name: "Arunachal Pradesh Statehood Day", kind: "state", href: "/explore/arunachal-pradesh", detail: "Arunachal Pradesh became a state on 20 February 1987.", source: wiki("Arunachal_Pradesh") },
  { monthDay: "02-20", name: "Mizoram Statehood Day", kind: "state", href: "/explore/mizoram", detail: "Mizoram became a state on 20 February 1987.", source: wiki("Mizoram") },
  { monthDay: "03-30", name: "Rajasthan Day", kind: "state", href: "/explore/rajasthan", detail: "Marks the union of the Rajputana states into Rajasthan on 30 March 1949.", source: wiki("Rajasthan") },
  { monthDay: "05-16", name: "Sikkim State Day", kind: "state", href: "/explore/sikkim", detail: "Sikkim became a state of India on 16 May 1975.", source: wiki("Sikkim") },
  { monthDay: "05-30", name: "Goa Statehood Day", kind: "state", href: "/explore/goa", detail: "Goa became a state on 30 May 1987.", source: wiki("Goa") },
  { monthDay: "07-18", name: "Tamil Nadu Day", kind: "state", href: "/explore/tamil-nadu", from: 2022, detail: "Marks the 1967 resolution renaming Madras State as Tamil Nadu. Observed on this date since 2022.", source: wiki("Tamil_Nadu") },
  { monthDay: "10-31", name: "Ladakh Union Territory Day", kind: "state", href: "/explore/ladakh", from: 2019, detail: "Ladakh became a union territory on 31 October 2019.", source: wiki("Ladakh") },
  { monthDay: "10-31", name: "Jammu and Kashmir Union Territory Day", kind: "state", href: "/explore/jammu-and-kashmir", from: 2019, detail: "Jammu and Kashmir became a union territory on 31 October 2019.", source: wiki("Jammu_and_Kashmir_(union_territory)") },
  { monthDay: "11-01", name: "Madhya Pradesh Foundation Day", kind: "state", href: "/explore/madhya-pradesh", detail: "Marks the formation of Madhya Pradesh in 1956.", source: wiki("Madhya_Pradesh") },
  { monthDay: "11-01", name: "Haryana Day", kind: "state", href: "/explore/haryana", detail: "Marks the formation of Haryana in 1966.", source: wiki("Haryana") },
  { monthDay: "11-01", name: "Punjab Day", kind: "state", href: "/explore/punjab", detail: "Marks the 1966 reorganisation that formed the present Punjab.", source: wiki("Punjab,_India") },
  { monthDay: "11-01", name: "Chhattisgarh Rajyotsava", kind: "state", href: "/explore/chhattisgarh", from: 2000, detail: "Marks the formation of Chhattisgarh on 1 November 2000.", source: wiki("Chhattisgarh") },
  { monthDay: "11-09", name: "Uttarakhand Foundation Day", kind: "state", href: "/explore/uttarakhand", from: 2000, detail: "Marks the formation of Uttarakhand on 9 November 2000.", source: wiki("Uttarakhand") },
  { monthDay: "11-15", name: "Jharkhand Foundation Day", kind: "state", href: "/explore/jharkhand", from: 2000, detail: "Marks the formation of Jharkhand on 15 November 2000.", source: wiki("Jharkhand") },
  { monthDay: "12-01", name: "Nagaland Statehood Day", kind: "state", href: "/explore/nagaland", detail: "Nagaland became a state on 1 December 1963.", source: wiki("Nagaland") },
];

export interface NatureSeason {
  name: string;
  months: number[];
  detail: string;
  href?: string;
  source?: { label: string; url: string };
}

/** Typical windows, which shift with each year's weather. Not forecasts. */
export const NATURE_SEASONS: NatureSeason[] = [
  { name: "South-west monsoon arrives", months: [6, 7], detail: "The monsoon's normal onset over Kerala is about 1 June, and it usually covers the whole country by early July.", source: { label: "India Meteorological Department", url: "https://mausam.imd.gov.in/" } },
  { name: "Monsoon withdraws", months: [9, 10], detail: "The monsoon usually begins to withdraw from north-west India in mid-September.", source: { label: "India Meteorological Department", url: "https://mausam.imd.gov.in/" } },
  { name: "North-east monsoon in Tamil Nadu", months: [10, 11, 12], detail: "Tamil Nadu and Puducherry get most of their rain in these months." },
  { name: "Winter bird migration", months: [10, 11, 12, 1, 2, 3], detail: "Migratory birds winter at wetlands such as Keoladeo (Bharatpur) and Chilika Lake.", href: "/discover/wildlife" },
  { name: "Snow in the Himalaya", months: [12, 1, 2], detail: "High passes may close; hill towns can see snowfall.", href: "/discover/mountains" },
  { name: "Olive ridley turtle nesting", months: [2, 3], detail: "Mass nesting usually happens on Odisha's coast, at Rushikulya and Gahirmatha.", href: "/explore/odisha" },
  { name: "Spring blooms in the hills", months: [3, 4, 5], detail: "Rhododendrons flower across the eastern and western Himalaya; Srinagar's tulip garden opens in spring.", href: "/destinations/srinagar" },
  { name: "Darjeeling first flush", months: [3, 4], detail: "The first tea harvest of the year in the Darjeeling hills." },
  { name: "Valley of Flowers in bloom", months: [7, 8], detail: "Peak flowering in the Valley of Flowers National Park.", href: "/destinations/valley-of-flowers" },
  { name: "Pre-monsoon heat in the plains", months: [4, 5, 6], detail: "Very hot days across north, central and western plains. Hill stations are popular." },
];

export interface FestivalDateFact {
  date: string;
  name: string;
  slug: string;
}

const onYear = (list: Fixed[], year: number): Occasion[] =>
  list.flatMap(({ monthDay, from, ...rest }) => ((from ?? 0) <= year ? [{ ...rest, date: `${year}-${monthDay}` }] : []));

const nameKey = (name: string) => name.toLowerCase().replace(/[^a-z]/g, "");

/**
 * Every dated occasion in a year. Festival dates come in as an argument, so the calendar
 * can receive just the dates rather than every festival guide. Calculated dates fill in
 * festivals and holidays that no source has published for the year; when a source has
 * published a date for the same occasion that year, the calculated one is left out.
 */
export function occasionsForYear(year: number, festivalDates: FestivalDateFact[] = []): Occasion[] {
  const holidays: Occasion[] = holidaysForYear(year).map((holiday: Holiday) => ({ ...holiday }));
  const taken = new Set(holidays.map((holiday) => `${holiday.date}:${holiday.href ?? holiday.name}`));
  const festivals: Occasion[] = festivalDates
    .filter((festival) => festival.date.startsWith(`${year}-`) && !taken.has(`${festival.date}:/culture/festivals/${festival.slug}`))
    .map((festival) => ({ date: festival.date, name: festival.name, kind: "festival", href: `/culture/festivals/${festival.slug}`, note: "Date confirmed by a published source" }));
  const published = new Set([...holidays, ...festivals].map((item) => nameKey(item.name)));
  const calculated: Occasion[] = computedForYear(year)
    .filter((item) => ![item.name, ...(item.aliases ?? [])].some((name) => published.has(nameKey(name))))
    .map((item) => ({ date: item.date, name: item.name, kind: item.kind, href: item.href, detail: item.detail, calculated: true, note: CALCULATED_NOTE }));
  const order: OccasionKind[] = ["national", "listed", "festival", "state", "observance"];
  return [...holidays, ...festivals, ...calculated, ...onYear(STATE_DAYS, year), ...onYear(OBSERVANCES, year)].sort(
    (a, b) => a.date.localeCompare(b.date) || order.indexOf(a.kind) - order.indexOf(b.kind),
  );
}

export const natureInMonth = (month: number) => NATURE_SEASONS.filter((season) => season.months.includes(month));

/** An .ics file for a list of occasions, as all-day events. */
export function occasionsToIcs(list: Occasion[], origin: string, stamp = new Date()): string {
  const escape = (value: string) => value.replace(/[\\;,]/g, (match) => `\\${match}`).replace(/\r?\n/g, "\\n");
  const compact = (iso: string) => iso.replace(/-/g, "");
  const next = (iso: string) => {
    const date = new Date(`${iso}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    return compact(date.toISOString().slice(0, 10));
  };
  const now = stamp.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const events = list.map((item) =>
    [
      "BEGIN:VEVENT",
      `UID:${compact(item.date)}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@tour-india`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${compact(item.date)}`,
      `DTEND;VALUE=DATE:${next(item.date)}`,
      `SUMMARY:${escape(item.name)}`,
      ...(item.detail || item.note ? [`DESCRIPTION:${escape([item.detail, item.note].filter(Boolean).join(" "))}`] : []),
      ...(item.href ? [`URL:${origin}${item.href}`] : []),
      "END:VEVENT",
    ].join("\r\n"),
  );
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tour India//Calendar//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR", ""].join("\r\n");
}
