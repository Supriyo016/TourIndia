import { describe, expect, it } from "vitest";
import { computedForYear, easter, FIRST_YEAR, LAST_YEAR } from "@/features/calendar/computed";
import { istDate, lunarMonthsAround, LUNAR_MONTHS, moonLongitude, newMoonsBetween, jdFromDate, sunLongitude, sunTimes } from "@/features/calendar/lunar";

const dateOf = (name: string, year: number) => computedForYear(year).filter((item) => item.name === name).map((item) => item.date);
const dayDiff = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / 86_400_000);

/**
 * Reference dates as observed in India (Government of India holiday lists and the
 * New Delhi panchang). Diwali 2024 is the Lakshmi Puja date of the New Delhi panchang
 * (1 November); many households and the central government list kept 31 October.
 */
const HINDU: Record<string, string[]> = {
  Diwali: ["2015-11-11", "2016-10-30", "2017-10-19", "2018-11-07", "2019-10-27", "2020-11-14", "2021-11-04", "2022-10-24", "2023-11-12", "2024-11-01", "2025-10-20"],
  Holi: ["2017-03-13", "2018-03-02", "2019-03-21", "2020-03-10", "2021-03-29", "2022-03-18", "2023-03-08", "2024-03-25", "2025-03-14", "2026-03-04"],
  Dussehra: ["2016-10-11", "2017-09-30", "2018-10-19", "2019-10-08", "2020-10-25", "2021-10-15", "2022-10-05", "2023-10-24", "2024-10-12", "2025-10-02"],
  Janmashtami: ["2021-08-30", "2024-08-26", "2025-08-16"],
  "Ganesh Chaturthi": ["2019-09-02", "2020-08-22", "2021-09-10", "2022-08-31", "2023-09-19", "2024-09-07", "2025-08-27"],
  "Maha Shivaratri": ["2020-02-21", "2021-03-11", "2022-03-01", "2023-02-18", "2024-03-08", "2025-02-26", "2026-02-15"],
  "Raksha Bandhan": ["2020-08-03", "2021-08-22", "2022-08-11", "2023-08-30", "2024-08-19", "2025-08-09"],
  "Ram Navami": ["2023-03-30", "2024-04-17", "2025-04-06"],
  "Guru Nanak Jayanti": ["2023-11-27", "2024-11-15", "2025-11-05", "2026-11-24"],
  "Buddha Purnima": ["2023-05-05", "2024-05-23", "2025-05-12"],
  "Mahavir Jayanti": ["2023-04-04", "2024-04-21", "2025-04-10"],
  "Makar Sankranti": ["2023-01-15", "2024-01-15", "2025-01-14", "2026-01-14"],
};

/** Islamic dates follow moon sighting, so a day either way is accepted. */
const ISLAMIC: Record<string, string[]> = {
  "Eid al-Fitr": ["2023-04-22", "2024-04-11", "2025-03-31"],
  "Eid al-Adha (Bakrid)": ["2023-06-29", "2024-06-17", "2025-06-07"],
  "Muharram (Ashura)": ["2024-07-17", "2025-07-06"],
  "Milad-un-Nabi": ["2024-09-16", "2025-09-05"],
};

describe("astronomy", () => {
  it("matches the worked examples in Meeus", () => {
    // Example 47.a: the Moon on 1992 April 12, 0h TD, apparent longitude 133.167 degrees.
    expect(moonLongitude(2_448_724.5 - 58 / 86_400)).toBeCloseTo(133.1673, 2);
    // Example 25.a: the Sun on 1992 October 13, 0h TD, apparent longitude 199.909 degrees.
    expect(sunLongitude(2_448_908.5 - 59 / 86_400)).toBeCloseTo(199.909, 2);
  });

  it("finds new moons to the minute", () => {
    // 1 November 2024, 12:47 UTC = 18:17 IST.
    const moon = newMoonsBetween(jdFromDate(2024, 10, 20), jdFromDate(2024, 11, 10)).find((jd) => istDate(jd) === "2024-11-01");
    expect(moon).toBeDefined();
    expect(Math.abs(moon! - (jdFromDate(2024, 11, 1) + (12 * 60 + 47) / 1440))).toBeLessThan(3 / 1440);
  });

  it("gives New Delhi sunrise within a few minutes", () => {
    // About 05:24 IST at the June solstice and 07:15 IST in early January.
    const june = sunTimes("2024-06-21").sunrise;
    expect(Math.abs(june - (jdFromDate(2024, 6, 21) - 5.5 / 24 + (5 * 60 + 24) / 1440))).toBeLessThan(4 / 1440);
  });

  it("names lunar months and finds the adhika month of 2023", () => {
    const months = lunarMonthsAround(2023).filter((month) => istDate(month.start).startsWith("2023-"));
    const adhika = months.filter((month) => month.adhika);
    expect(adhika).toHaveLength(1);
    expect(LUNAR_MONTHS[adhika[0]!.month]).toBe("Shravana");
    expect(istDate(adhika[0]!.start)).toBe("2023-07-18");
  });
});

describe("calculated festival dates", () => {
  it("matches published Hindu festival dates exactly", () => {
    const misses: string[] = [];
    let total = 0;
    for (const [name, dates] of Object.entries(HINDU)) {
      for (const date of dates) {
        total += 1;
        const got = dateOf(name, Number(date.slice(0, 4)));
        if (!got.includes(date)) misses.push(`${name} ${date}: got ${got.join(", ")}`);
      }
    }
    expect(misses).toEqual([]);
    expect(total).toBeGreaterThan(70);
  });

  it("puts Holika Dahan on the evening before Holi", () => {
    expect(dateOf("Holika Dahan", 2024)).toEqual(["2024-03-24"]);
    expect(dateOf("Holika Dahan", 2025)).toEqual(["2025-03-13"]);
  });

  it("matches Islamic dates in India within a day (moon sighting decides the actual day)", () => {
    for (const [name, dates] of Object.entries(ISLAMIC)) {
      for (const date of dates) {
        const got = dateOf(name, Number(date.slice(0, 4)));
        expect(got.some((value) => Math.abs(dayDiff(value, date)) <= 1), `${name} ${date}: got ${got.join(", ")}`).toBe(true);
      }
    }
  });

  it("computes Good Friday exactly", () => {
    expect(dateOf("Good Friday", 2024)).toEqual(["2024-03-29"]);
    expect(dateOf("Good Friday", 2025)).toEqual(["2025-04-18"]);
    expect(easter(2000)).toEqual([4, 23]);
    expect(easter(2100)).toEqual([3, 28]);
  });

  it("has each Hindu festival once in every year from 2000 to 2100, all flagged as calculated", () => {
    for (let year = FIRST_YEAR; year <= LAST_YEAR; year += 1) {
      const list = computedForYear(year);
      for (const name of [...Object.keys(HINDU), "Holika Dahan", "Good Friday"]) {
        expect(list.filter((item) => item.name === name), `${name} ${year}`).toHaveLength(1);
      }
      expect(list.every((item) => item.calculated && item.date.startsWith(`${year}-`))).toBe(true);
    }
    expect(computedForYear(1999)).toEqual([]);
    expect(computedForYear(2101)).toEqual([]);
  });
});
