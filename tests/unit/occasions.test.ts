import { describe, expect, it } from "vitest";
import { natureInMonth, occasionsForYear, occasionsToIcs } from "@/data/occasions";
import { festivals } from "@/data/festivals";

const festivalDates = festivals.flatMap(({ name, slug, confirmedDates }) => confirmedDates.flatMap((date) => (date.isoStart ? [{ date: date.isoStart, name, slug }] : [])));

describe("calendar occasions", () => {
  it("includes holidays, observances and state days on fixed dates every year", () => {
    for (const year of [2026, 2030]) {
      const list = occasionsForYear(year, festivalDates);
      expect(list.find((item) => item.name === "Republic Day")?.date).toBe(`${year}-01-26`);
      expect(list.find((item) => item.name === "International Day of Yoga")?.date).toBe(`${year}-06-21`);
      expect(list.find((item) => item.name === "Kerala Piravi")?.kind).toBe("state");
    }
  });

  it("adds festivals only where a source published the date, without doubling holidays", () => {
    const year2027 = occasionsForYear(2027, festivalDates);
    const diwali = year2027.filter((item) => /Diwali/.test(item.name) && item.date === "2027-10-29");
    expect(diwali).toHaveLength(1);
    // No published dates for 2031, so no lunar festival is guessed.
    expect(occasionsForYear(2031, festivalDates).some((item) => item.kind === "festival")).toBe(false);
  });

  it("every observance and state day cites a source", () => {
    for (const item of occasionsForYear(2027).filter((entry) => entry.kind === "observance" || entry.kind === "state")) {
      expect(item.source?.url, item.name).toMatch(/^https:\/\//);
    }
  });

  it("is sorted by date", () => {
    const dates = occasionsForYear(2027, festivalDates).map((item) => item.date);
    expect(dates).toEqual([...dates].sort());
  });

  it("lists typical nature seasons by month", () => {
    expect(natureInMonth(6).map((season) => season.name)).toContain("South-west monsoon arrives");
    expect(natureInMonth(1).map((season) => season.name)).toContain("Winter bird migration");
  });

  it("exports valid all-day calendar events", () => {
    const ics = occasionsToIcs(occasionsForYear(2027).filter((item) => item.date.startsWith("2027-01")), "https://example.com", new Date("2027-01-01T00:00:00Z"));
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toMatch(/DTSTART;VALUE=DATE:20270126\r\nDTEND;VALUE=DATE:20270127/);
    expect(ics.trim().endsWith("END:VCALENDAR")).toBe(true);
  });
});
