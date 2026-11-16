import { describe, expect, it } from "vitest";
import { holidaysForYear } from "@/data/holidays";
import { holidaysInMonth, holidaysOn, monthGrid, nextHoliday, shiftMonth, todayInIndia } from "@/features/calendar/calendar";

describe("calendar", () => {
  it("starts weeks on Monday and places the first of the month correctly", () => {
    // 1 November 2026 is a Sunday.
    const weeks = monthGrid(2026, 11);
    expect(weeks[0]!.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(weeks[0]![6]).toBe("2026-11-01");
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });

  it("handles a leap February", () => {
    expect(monthGrid(2028, 2).flat().filter(Boolean)).toHaveLength(29);
    expect(monthGrid(2027, 2).flat().filter(Boolean)).toHaveLength(28);
  });

  it("finds fixed holidays in any year", () => {
    expect(holidaysOn("2030-01-26").map((holiday) => holiday.name)).toEqual(["Republic Day"]);
    expect(holidaysForYear(2031).map((holiday) => holiday.date)).toContain("2031-08-15");
  });

  it("lists confirmed dated holidays", () => {
    expect(holidaysOn("2027-10-29").map((holiday) => holiday.name)).toEqual(["Diwali"]);
    expect(holidaysInMonth(2027, 3).map((holiday) => holiday.name)).toContain("Holi");
  });

  it("never invents lunar dates for years without a source", () => {
    expect(holidaysForYear(2031).map((holiday) => holiday.name).join()).not.toMatch(/Diwali|Holi|Eid/);
  });

  it("finds the next holiday, including across a year end", () => {
    expect(nextHoliday("2026-11-09")?.name).toBe("Guru Nanak's Birthday");
    expect(nextHoliday("2026-12-26")?.date).toBe("2027-01-14");
    expect(nextHoliday("2026-11-24")?.date).toBe("2026-11-24");
  });

  it("wraps months across years", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2027, 1, -1)).toEqual({ year: 2026, month: 12 });
  });

  it("uses India's date, not the server's", () => {
    // 20:00 UTC is 01:30 the next day in India.
    expect(todayInIndia(new Date("2026-11-09T20:00:00Z"))).toBe("2026-11-10");
  });
});
