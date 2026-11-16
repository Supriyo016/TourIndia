/**
 * Festival and holiday dates calculated from rules, for any year from 2000 to 2100.
 *
 * Hindu festivals come from the lunar calendar in ./lunar (amanta months, tithis for New
 * Delhi). Each festival uses the time of day its tradition looks at: most take the tithi at
 * sunrise; Ganesh Chaturthi and Ram Navami midday; Dussehra the afternoon (aparahna);
 * Maha Shivaratri midnight (nishita); Diwali and Holika Dahan the evening (pradosh).
 * Islamic dates use the tabular Islamic calendar (civil epoch, the "Kuwaiti algorithm").
 * India usually sights the new crescent a day after Saudi Arabia, and the tabular calendar
 * runs about a day ahead of Saudi practice, so its dates match India's most often; actual
 * dates follow moon sighting and can differ by a day. Good Friday
 * uses the Gregorian computus and is exact.
 *
 * Nothing here runs at import time: call computedForYear(year) when a year is shown.
 */
import {
  addDays,
  istDate,
  jdFromDate,
  lunarMonthsAround,
  nakshatraAt,
  sankrantiTime,
  sunTimes,
  tithiSpan,
  type LunarMonth,
} from "./lunar";

export const FIRST_YEAR = 2000;
export const LAST_YEAR = 2100;
export const CALCULATED_NOTE = "Calculated, may differ by a day locally";

export type ComputedKind = "listed" | "festival";

export interface ComputedDate {
  date: string;
  name: string;
  kind: ComputedKind;
  href?: string;
  detail?: string;
  /** Other names an official list may use for the same day. */
  aliases?: string[];
  calculated: true;
}

/** Which part of the day decides the date when a tithi spans two days. */
type Timing = "sunrise" | "midday" | "afternoon" | "midnight" | "diwali" | "rakhi";

interface LunarRule {
  name: string;
  kind: ComputedKind;
  /** Amanta month index (0 = Chaitra) and tithi (1..15 bright, 16..30 dark). */
  month: number;
  tithi: number;
  timing: Timing;
  href?: string;
  detail: string;
  aliases?: string[];
}

const festival = (slug: string) => `/culture/festivals/${slug}`;

const LUNAR_RULES: LunarRule[] = [
  { name: "Maha Shivaratri", kind: "festival", month: 10, tithi: 29, timing: "midnight", detail: "Night of the dark fourteenth of Magha (amanta), Phalguna in the north.", aliases: ["Mahashivratri", "Maha Shivratri"] },
  { name: "Ram Navami", kind: "festival", month: 0, tithi: 9, timing: "midday", detail: "Ninth day of the bright half of Chaitra, birth of Rama.", aliases: ["Rama Navami"] },
  { name: "Mahavir Jayanti", kind: "listed", month: 0, tithi: 13, timing: "sunrise", detail: "Thirteenth day of the bright half of Chaitra, birth of Mahavira." },
  { name: "Buddha Purnima", kind: "listed", month: 1, tithi: 15, timing: "sunrise", detail: "Full moon of Vaishakha.", aliases: ["Buddha Purnima (Vesak)", "Vesak"] },
  { name: "Raksha Bandhan", kind: "festival", month: 4, tithi: 15, timing: "rakhi", detail: "Full moon of Shravana.", aliases: ["Rakhi"] },
  { name: "Janmashtami", kind: "festival", month: 4, tithi: 23, timing: "sunrise", detail: "Dark eighth of Shravana (amanta), Bhadrapada in the north: birth of Krishna.", aliases: ["Janmashtami (Vaishnava)", "Krishna Janmashtami"] },
  { name: "Ganesh Chaturthi", kind: "festival", month: 5, tithi: 4, timing: "midday", href: festival("ganesh-chaturthi"), detail: "Bright fourth of Bhadrapada.", aliases: ["Vinayaka Chaturthi"] },
  { name: "Dussehra", kind: "listed", month: 6, tithi: 10, timing: "afternoon", href: festival("navratri"), detail: "Bright tenth of Ashvina (Vijayadashami).", aliases: ["Vijayadashami", "Vijaya Dashami"] },
  { name: "Diwali", kind: "listed", month: 6, tithi: 30, timing: "diwali", href: festival("diwali"), detail: "New moon ending Ashvina (amanta), Kartika in the north: Lakshmi Puja evening.", aliases: ["Deepavali"] },
  { name: "Guru Nanak Jayanti", kind: "listed", month: 7, tithi: 15, timing: "sunrise", detail: "Full moon of Kartika.", aliases: ["Guru Nanak's Birthday", "Guru Nanak Jayanti"] },
];

/** The first IST date, from the day before `from`, for which `test` holds; at most four days. */
function firstDay(from: number, test: (iso: string) => boolean): string | undefined {
  let iso = addDays(istDate(from), -1);
  for (let step = 0; step < 4; step += 1, iso = addDays(iso, 1)) if (test(iso)) return iso;
  return undefined;
}

const within = (jd: number, span: { start: number; end: number }) => jd >= span.start && jd < span.end;

/** The day whose sunrise falls in the tithi; for a tithi that touches no sunrise, the day it runs. */
function bySunrise(span: { start: number; end: number }): string {
  return firstDay(span.start, (iso) => within(sunTimes(iso).sunrise, span)) ?? istDate(span.start);
}

function dateFor(rule: LunarRule, span: { start: number; end: number }): string {
  const day = (iso: string) => {
    const { sunrise, sunset } = sunTimes(iso);
    return { sunrise, sunset, length: sunset - sunrise };
  };
  switch (rule.timing) {
    case "sunrise":
      return bySunrise(span);
    case "midday":
      // Madhyahna: the tithi in force at the middle of the daytime.
      return firstDay(span.start, (iso) => {
        const { sunrise, length } = day(iso);
        return within(sunrise + 0.5 * length, span);
      }) ?? bySunrise(span);
    case "afternoon": {
      // Vijayadashami: Dashami in force at aparahna (the fourth fifth of the daytime). If it
      // is there on both days, or only on the first while the second day starts in Dashami,
      // the second day wins when the Moon is in Shravana nakshatra at its aparahna.
      const first = istDate(span.start);
      const second = addDays(first, 1);
      const aparahna = (iso: string) => {
        const { sunrise, length } = day(iso);
        return sunrise + 0.7 * length;
      };
      const onFirst = within(aparahna(first), span);
      const onSecond = within(aparahna(second), span);
      const shravana = nakshatraAt(aparahna(second)) === 22;
      if (onFirst && onSecond) return shravana ? second : first;
      if (onSecond) return second;
      if (onFirst) return shravana && within(sunTimes(second).sunrise, span) ? second : first;
      return bySunrise(span);
    }
    case "midnight":
      // Nishita, the middle of the night that begins on this date.
      return firstDay(span.start, (iso) => within((day(iso).sunset + sunTimes(addDays(iso, 1)).sunrise) / 2, span)) ?? bySunrise(span);
    case "diwali": {
      // Amavasya at pradosh. When it covers sunset on two days, the second day counts only if
      // Amavasya lasts at least one ghati (24 minutes) past that sunset.
      const evenings = [istDate(span.start), addDays(istDate(span.start), 1)];
      const [first, second] = evenings.map((iso) => day(iso).sunset) as [number, number];
      if (within(second, span) && span.end - second >= 24 / 1440) return evenings[1]!;
      if (within(first, span)) return evenings[0]!;
      return within(second, span) ? evenings[1]! : evenings[0]!;
    }
    case "rakhi": {
      // Purnima at sunrise, if it lasts six ghati (2 h 24 min) past it; otherwise the day before.
      const iso = bySunrise(span);
      const { sunrise } = day(iso);
      if (within(sunrise, span) && span.end - sunrise < 0.1) return istDate(span.start);
      return iso;
    }
  }
}

function lunarDates(year: number, months: LunarMonth[]): ComputedDate[] {
  const result: ComputedDate[] = [];
  for (const month of months) {
    if (month.adhika) continue;
    for (const rule of LUNAR_RULES) {
      if (rule.month !== month.month) continue;
      const date = dateFor(rule, tithiSpan(month, rule.tithi));
      if (date.startsWith(`${year}-`)) result.push(make(rule, date));
    }
  }
  return result;
}

function make(rule: Omit<LunarRule, "month" | "tithi" | "timing">, date: string): ComputedDate {
  return { date, name: rule.name, kind: rule.kind, href: rule.href, detail: rule.detail, aliases: rule.aliases, calculated: true };
}

/** Holika Dahan on the evening of Phalguna Purnima, Holi (Dhulandi) the next day. */
function holi(year: number, months: LunarMonth[]): ComputedDate[] {
  const phalguna = months.find((month) => month.month === 11 && !month.adhika && istDate(month.start).startsWith(`${year}-`));
  if (!phalguna) return [];
  const span = tithiSpan(phalguna, 15);
  const first = istDate(span.start);
  const second = addDays(first, 1);
  const sunsetFirst = sunTimes(first).sunset;
  const sunsetSecond = sunTimes(second).sunset;
  // Holika burns in the evening (pradosh, taken as 2 h 24 min after sunset) of Purnima, but
  // not during Bhadra (vishti karana), which fills the first half of Purnima. If Bhadra
  // covers the first evening, the second evening is used when Purnima still lasts three
  // prahar (9 hours) after that day's sunrise; otherwise the first, after Bhadra ends.
  const bhadraEnd = (span.start + span.end) / 2;
  const sunriseSecond = sunTimes(second).sunrise;
  let dahan: string;
  if (within(sunsetSecond, span)) dahan = second;
  else if (within(sunsetFirst, span) && bhadraEnd <= sunsetFirst + 0.1) dahan = first;
  else dahan = span.end - sunriseSecond >= 9 / 24 ? second : first;
  return [
    make({ name: "Holika Dahan", kind: "festival", href: festival("holi"), detail: "Bonfire on the evening of Phalguna Purnima." }, dahan),
    make({ name: "Holi", kind: "festival", href: festival("holi"), detail: "Festival of colours, the day after Holika Dahan." }, addDays(dahan, 1)),
  ];
}

/** Makar Sankranti: the sidereal Sun enters Capricorn; after sunset, the next day. */
function makarSankranti(year: number): ComputedDate {
  const moment = sankrantiTime(9, jdFromDate(year, 1, 14));
  let date = istDate(moment);
  if (moment > sunTimes(date).sunset) date = addDays(date, 1);
  return make({ name: "Makar Sankranti", kind: "festival", href: festival("makar-sankranti"), detail: "The Sun enters sidereal Capricorn (Makara).", aliases: ["Makar Sankranti and Magha Bihu"] }, date);
}

/** Easter Sunday (anonymous Gregorian algorithm), as [month, day]. */
export function easter(year: number): [number, number] {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return [month, day];
}

const ISLAMIC_EPOCH = 1_948_439.5;
/** Days to add to the tabular date for India; zero fitted best against 2022 to 2025. */
const INDIA_OFFSET = 0;

/** Julian Day (noon-based civil date at 00:00 UT) of a tabular Islamic date. */
export function islamicToJd(year: number, month: number, day: number): number {
  return day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30) + ISLAMIC_EPOCH - 1;
}

const ISLAMIC_RULES: { name: string; month: number; day: number; href?: string; detail: string; aliases?: string[] }[] = [
  { name: "Eid al-Fitr", month: 10, day: 1, href: festival("eid-al-fitr"), detail: "1 Shawwal, the end of Ramadan.", aliases: ["Id-ul-Fitr", "Eid ul-Fitr"] },
  { name: "Eid al-Adha (Bakrid)", month: 12, day: 10, detail: "10 Dhu al-Hijjah.", aliases: ["Eid al-Adha", "Id-ul-Zuha", "Bakrid"] },
  { name: "Muharram (Ashura)", month: 1, day: 10, detail: "10 Muharram.", aliases: ["Muharram", "Ashura"] },
  { name: "Milad-un-Nabi", month: 3, day: 12, detail: "12 Rabi al-Awwal, the Prophet's birthday.", aliases: ["Id-e-Milad", "Prophet's Birthday", "Milad-un-Nabi or Id-e-Milad"] },
];

const gregorianOfJd = (jd: number) => new Date((jd - 2_440_587.5) * 86_400_000).toISOString().slice(0, 10);

function islamicDates(year: number): ComputedDate[] {
  // A Gregorian year overlaps two or three Islamic years.
  const firstHijri = Math.floor(((year - 622) * 33) / 32) - 1;
  const result: ComputedDate[] = [];
  for (let hijri = firstHijri; hijri <= firstHijri + 3; hijri += 1) {
    for (const rule of ISLAMIC_RULES) {
      const date = gregorianOfJd(islamicToJd(hijri, rule.month, rule.day) + INDIA_OFFSET);
      if (date.startsWith(`${year}-`)) result.push(make({ ...rule, kind: "listed" }, date));
    }
  }
  return result;
}

const cache = new Map<number, ComputedDate[]>();

/** All calculated dates for one year (2000 to 2100), sorted. Cached per year. */
export function computedForYear(year: number): ComputedDate[] {
  if (year < FIRST_YEAR || year > LAST_YEAR) return [];
  const hit = cache.get(year);
  if (hit) return hit;
  const months = lunarMonthsAround(year);
  const [easterMonth, easterDay] = easter(year);
  const goodFriday = gregorianOfJd(jdFromDate(year, easterMonth, easterDay) - 2);
  const list = [
    ...lunarDates(year, months),
    ...holi(year, months),
    makarSankranti(year),
    ...islamicDates(year),
    make({ name: "Good Friday", kind: "listed", detail: "The Friday before Easter (Gregorian computus)." }, goodFriday),
  ].sort((a, b) => a.date.localeCompare(b.date));
  cache.set(year, list);
  return list;
}

