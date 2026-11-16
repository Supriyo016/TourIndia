/**
 * A small, dependency-free astronomy module for the Indian calendar.
 *
 * Positions: the Moon from the main periodic terms of Meeus, "Astronomical Algorithms"
 * (2nd ed.), chapter 47; the Sun from chapter 25 (low-accuracy series, about 0.01 degrees).
 * New and full moons are found by solving for the Moon-Sun elongation, starting from the
 * mean-phase formula of chapter 49. Sidereal longitudes use the Lahiri (Chitrapaksha)
 * ayanamsa. Local times are for New Delhi in IST, with sunrise and sunset from the standard
 * solar-altitude formula (-0.833 degrees). The result is good to a few minutes, so a
 * festival whose tithi changes within minutes of sunrise can still land a day off.
 *
 * Every time here is a Julian Day in Universal Time unless the name says otherwise.
 */

const RAD = Math.PI / 180;
const IST_OFFSET = 5.5 / 24;
const DELHI = { lat: 28.6139, lon: 77.209 };
const SYNODIC = 29.530588861;

const norm = (deg: number) => ((deg % 360) + 360) % 360;
/** An angle difference folded into -180..180. */
const wrap = (deg: number) => norm(deg + 180) - 180;
const sin = (deg: number) => Math.sin(deg * RAD);
const cos = (deg: number) => Math.cos(deg * RAD);

const pad = (value: number) => String(value).padStart(2, "0");

/** Julian Day of 00:00 UT on a Gregorian date. */
export function jdFromDate(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day) / 86_400_000 + 2_440_587.5;
}

/** The IST calendar date (YYYY-MM-DD) on which a moment falls. */
export function istDate(jd: number): string {
  const date = new Date(Math.round((jd + IST_OFFSET - 2_440_587.5) * 86_400_000));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Julian Day of 00:00 IST on an ISO date. */
export function jdOfIstMidnight(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return jdFromDate(y, m, d) - IST_OFFSET;
}

export function addDays(iso: string, days: number): string {
  return istDate(jdOfIstMidnight(iso) + days + 0.5);
}

/** Terrestrial minus Universal Time, in days (Espenak and Meeus polynomials). */
function deltaT(jd: number): number {
  const y = 2000 + (jd - 2_451_545) / 365.25;
  let seconds: number;
  if (y < 2005) {
    const t = y - 2000;
    seconds = 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  } else if (y < 2050) {
    const t = y - 2000;
    seconds = 62.92 + 0.32217 * t + 0.005589 * t * t;
  } else {
    const u = (y - 1820) / 100;
    seconds = -20 + 32 * u * u - 0.5628 * (2150 - y);
  }
  return seconds / 86_400;
}

const centuries = (jd: number) => (jd + deltaT(jd) - 2_451_545) / 36_525;

/** Apparent geocentric longitude of the Sun, tropical, in degrees (Meeus ch. 25). */
export function sunLongitude(jd: number): number {
  const T = centuries(jd);
  const L0 = 280.46646 + 36_000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35_999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
  const omega = 125.04 - 1934.136 * T;
  return norm(L0 + C - 0.00569 - 0.00478 * sin(omega));
}

// Meeus table 47.A, longitude terms: multiples of D, M, M', F and the coefficient in 1e-6 degrees.
const MOON_TERMS: readonly (readonly [number, number, number, number, number])[] = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520], [1, 0, -2, 0, -487], [2, 1, 0, -2, -399], [0, 0, 2, -2, -381],
  [1, 1, 1, 0, 351], [3, 0, -2, 0, -340], [4, 0, -3, 0, 330], [2, -1, 2, 0, 327],
  [0, 2, 1, 0, -323], [1, 1, -1, 0, 299], [2, 0, 3, 0, 294],
];

/** Apparent geocentric longitude of the Moon, tropical, in degrees (Meeus ch. 47). */
export function moonLongitude(jd: number): number {
  const T = centuries(jd);
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const Lp = 218.3164477 + 481_267.88123421 * T - 0.0015786 * T2 + T3 / 538_841 - T4 / 65_194_000;
  const D = 297.8501921 + 445_267.1114034 * T - 0.0018819 * T2 + T3 / 545_868 - T4 / 113_065_000;
  const M = 357.5291092 + 35_999.0502909 * T - 0.0001536 * T2 + T3 / 24_490_000;
  const Mp = 134.9633964 + 477_198.8675055 * T + 0.0087414 * T2 + T3 / 69_699 - T4 / 14_712_000;
  const F = 93.272095 + 483_202.0175233 * T - 0.0036539 * T2 - T3 / 3_526_000 + T4 / 863_310_000;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  let sum = 0;
  for (const [d, m, mp, f, coefficient] of MOON_TERMS) {
    const eccentricity = m === 0 ? 1 : Math.abs(m) === 1 ? E : E * E;
    sum += coefficient * eccentricity * sin(d * D + m * M + mp * Mp + f * F);
  }
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479_264.29 * T;
  sum += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
  // Nutation in longitude, main terms; the Sun above already includes it.
  const omega = 125.04452 - 1934.136261 * T;
  const nutation = -17.2 * sin(omega) - 1.32 * sin(2 * (280.4665 + 36_000.7698 * T)) - 0.23 * sin(2 * Lp) + 0.21 * sin(2 * omega);
  return norm(Lp + sum / 1_000_000 + nutation / 3600);
}

/** Moon minus Sun, 0..360: 0 is new moon, 180 is full moon. */
export const elongation = (jd: number) => norm(moonLongitude(jd) - sunLongitude(jd));

/** Lahiri ayanamsa in degrees (23.853 degrees at J2000, general precession after). */
export function lahiriAyanamsa(jd: number): number {
  const T = (jd - 2_451_545) / 36_525;
  return 23.85306 + 1.396971 * T + 0.0003086 * T * T;
}

export const siderealSunLongitude = (jd: number) => norm(sunLongitude(jd) - lahiriAyanamsa(jd));

/** The moment near `guess` at which `fn` reaches `target` degrees, for a steadily rising angle. */
function solveAngle(fn: (jd: number) => number, target: number, guess: number, ratePerDay: number): number {
  let jd = guess;
  for (let step = 0; step < 30; step += 1) {
    const delta = wrap(fn(jd) - target);
    jd -= delta / ratePerDay;
    if (Math.abs(delta) < 1e-7) break;
  }
  return jd;
}

/** The moment the elongation reaches `angle` (a multiple of 12 starts a tithi), near `guess`. */
export const elongationTime = (angle: number, guess: number) => solveAngle(elongation, norm(angle), guess, 12.19);

/** New moons (as JD) from shortly before `fromJd` until after `toJd`. */
export function newMoonsBetween(fromJd: number, toJd: number): number[] {
  // Mean new moon of Meeus ch. 49, then the true moment by solving the elongation.
  let k = Math.floor((fromJd - 2_451_550.09766) / SYNODIC) - 1;
  const result: number[] = [];
  for (;;) {
    const moment = elongationTime(0, 2_451_550.09766 + SYNODIC * k);
    if (moment > toJd) {
      result.push(moment);
      return result;
    }
    if (moment >= fromJd - SYNODIC) result.push(moment);
    k += 1;
  }
}

/** The moment the sidereal Sun enters a sign (0 = Mesha .. 9 = Makara), near `guess`. */
export const sankrantiTime = (sign: number, guess: number) => solveAngle(siderealSunLongitude, sign * 30, guess, 0.9856);

/** Sunrise and sunset in New Delhi on an IST date, as JD (UT). */
export function sunTimes(iso: string): { sunrise: number; sunset: number } {
  const noon = jdOfIstMidnight(iso) + 0.5;
  const T = centuries(noon);
  const lambda = sunLongitude(noon);
  const epsilon = 23.439291 - 0.0130042 * T + 0.00256 * cos(125.04 - 1934.136 * T);
  const declination = Math.asin(sin(epsilon) * sin(lambda)) / RAD;
  const rightAscension = norm(Math.atan2(cos(epsilon) * sin(lambda), cos(lambda)) / RAD);
  const L0 = 280.46646 + 36_000.76983 * T;
  const equationOfTime = wrap(L0 - 0.0057183 - rightAscension) * 4; // minutes
  const cosH = (sin(-0.833) - sin(DELHI.lat) * sin(declination)) / (cos(DELHI.lat) * cos(declination));
  const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosH))) / RAD;
  const utMidnight = jdOfIstMidnight(iso) + IST_OFFSET;
  const solarNoon = utMidnight + (720 - 4 * DELHI.lon - equationOfTime) / 1440;
  return { sunrise: solarNoon - (hourAngle * 4) / 1440, sunset: solarNoon + (hourAngle * 4) / 1440 };
}

/** Lunar month names, amanta, with Chaitra first. */
export const LUNAR_MONTHS = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"] as const;

export interface LunarMonth {
  /** Index into LUNAR_MONTHS. */
  month: number;
  /** An adhika (extra) month: the Sun enters no new sign during it. */
  adhika: boolean;
  start: number;
  end: number;
}

/**
 * Amanta lunar months (new moon to new moon) overlapping a Gregorian year. A month takes the
 * name after the sidereal sign the Sun is in at its starting new moon (Sun in Mina names
 * Chaitra); when the Sun enters no new sign before the next new moon, the month is adhika
 * and shares the name of the month that follows it.
 */
export function lunarMonthsAround(year: number): LunarMonth[] {
  const moons = newMoonsBetween(jdFromDate(year - 1, 11, 1), jdFromDate(year + 1, 3, 1));
  const months: LunarMonth[] = [];
  for (let index = 0; index + 1 < moons.length; index += 1) {
    const start = moons[index]!;
    const end = moons[index + 1]!;
    const signAtStart = Math.floor(siderealSunLongitude(start) / 30);
    const signAtEnd = Math.floor(siderealSunLongitude(end) / 30);
    months.push({ month: (signAtStart + 1) % 12, adhika: signAtStart === signAtEnd, start, end });
  }
  return months;
}

/**
 * Start and end (JD) of a tithi within a lunar month. Tithi 1..15 is the bright fortnight
 * (15 = Purnima), 16..30 the dark fortnight (30 = Amavasya).
 */
export function tithiSpan(month: LunarMonth, tithi: number): { start: number; end: number } {
  const perTithi = (month.end - month.start) / 30;
  const start = tithi === 1 ? month.start : elongationTime((tithi - 1) * 12, month.start + (tithi - 1) * perTithi);
  const end = tithi === 30 ? month.end : elongationTime(tithi * 12, month.start + tithi * perTithi);
  return { start, end };
}

/** Nakshatra (1 = Ashvini .. 22 = Shravana .. 27 = Revati) of the Moon at a moment. */
export const nakshatraAt = (jd: number) => Math.floor(norm(moonLongitude(jd) - lahiriAyanamsa(jd)) / (360 / 27)) + 1;

/** Tithi (1..30) in force at a moment. */
export const tithiAt = (jd: number) => Math.floor(elongation(jd) / 12) + 1;
