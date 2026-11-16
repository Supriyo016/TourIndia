import { describe, expect, it } from "vitest";
import { natureInMonth, occasionsForYear, occasionsToIcs } from "@/data/occasions";
import { festivals } from "@/data/festivals";

const festivalDates = festivals.flatMap(({ name, slug, confirmedDates }) => confirmedDates.flatMap((date) => (date.isoStart ? [{ date: date.isoStart, name, slug }] : [])));

describe("calendar occasions", () => {
  it("includes holidays, observances and state days on fixed dates every year", () => {
    for (const year of [2026, 2030, 2100]) {
      const list = occasionsForYear(year, festivalDates);
      expect(list.find((item) => item.name === "Republic Day")?.date).toBe(`${year}-01-26`);
      expect(list.find((item) => item.name === "International Day of Yoga")?.date).toBe(`${year}-06-21`);
      expect(list.find((item) => item.name === "Kerala Piravi")?.kind).toBe("state");
    }
  });

  it("prefers published dates over calculated ones, without doubling holidays", () => {
    const year2027 = occasionsForYear(2027, festivalDates);
    const diwali = year2027.filter((item) => /Diwali/.test(item.name));
    expect(diwali).toHaveLength(1);
    expect(diwali[0]).toMatchObject({ date: "2027-10-29", kind: "listed" });
    expect(diwali[0]!.calculated).toBeUndefined();
    expect(year2027.filter((item) => item.name === "Holi").map((item) => item.date)).toEqual(["2027-03-23"]);
    // Guru Nanak's Birthday is published for 2026 under another name; no calculated copy.
    expect(occasionsForYear(2026).filter((item) => /Guru Nanak/.test(item.name))).toHaveLength(1);
  });

  it("calculates lunar festivals for years without published dates, and says so", () => {
    const list = occasionsForYear(2031, festivalDates);
    const calculated = list.filter((item) => item.calculated);
    expect(calculated.map((item) => item.name)).toEqual(expect.arrayContaining(["Diwali", "Holi", "Eid al-Fitr", "Good Friday"]));
    expect(calculated.every((item) => item.note === "Calculated, may differ by a day locally")).toBe(true);
    expect(list.filter((item) => !item.calculated && /Diwali|Holi|Eid/.test(item.name))).toEqual([]);
  });

  it("covers all five kinds in every year from 2000 to 2100", () => {
    for (const year of [2000, 2050, 2100]) {
      const kinds = new Set(occasionsForYear(year).map((item) => item.kind));
      expect([...kinds].sort()).toEqual(["festival", "listed", "national", "observance", "state"]);
    }
  });

  it("shows fixed days only from the year they began", () => {
    const names = (year: number) => occasionsForYear(year).map((item) => item.name);
    expect(names(2013)).not.toContain("Telangana Formation Day");
    expect(names(2014)).toContain("Telangana Formation Day");
    expect(names(2000)).toContain("Chhattisgarh Rajyotsava");
    expect(names(2018)).not.toContain("Ladakh Union Territory Day");
    expect(names(2019)).toContain("Ladakh Union Territory Day");
    expect(names(2014)).not.toContain("International Day of Yoga");
    expect(names(2015)).toContain("International Day of Yoga");
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
