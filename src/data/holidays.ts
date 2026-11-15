/**
 * Holidays shown on the calendar. Only dates backed by a named source are listed:
 * the fixed national days, and days from Government of India lists. Lunar dates can
 * move, and states set their own holidays, so the calendar says so beside the list.
 */
export interface Holiday {
  date: string;
  name: string;
  kind: "national" | "listed";
  href?: string;
  note?: string;
}

const FIXED: { monthDay: string; name: string; kind: Holiday["kind"]; href?: string }[] = [
  { monthDay: "01-26", name: "Republic Day", kind: "national" },
  { monthDay: "08-15", name: "Independence Day", kind: "national" },
  { monthDay: "10-02", name: "Gandhi Jayanti", kind: "national" },
  { monthDay: "12-25", name: "Christmas Day", kind: "listed", href: "/culture/festivals/christmas" },
];

const DATED: Holiday[] = [
  { date: "2026-11-24", name: "Guru Nanak's Birthday", kind: "listed" },
  { date: "2027-01-14", name: "Makar Sankranti and Magha Bihu", kind: "listed", href: "/culture/festivals/makar-sankranti" },
  { date: "2027-01-15", name: "Pongal", kind: "listed", href: "/culture/festivals/pongal" },
  { date: "2027-03-10", name: "Eid al-Fitr", kind: "listed", href: "/culture/festivals/eid-al-fitr", note: "Subject to the sighting of the moon" },
  { date: "2027-03-22", name: "Holika Dahan", kind: "listed", href: "/culture/festivals/holi" },
  { date: "2027-03-23", name: "Holi", kind: "listed", href: "/culture/festivals/holi" },
  { date: "2027-04-07", name: "Gudi Padwa and Ugadi", kind: "listed", href: "/culture/festivals/navratri" },
  { date: "2027-04-14", name: "Baisakhi", kind: "listed", href: "/culture/festivals/baisakhi" },
  { date: "2027-04-15", name: "Bohag Bihu", kind: "listed", href: "/culture/festivals/bihu" },
  { date: "2027-07-05", name: "Rath Yatra", kind: "listed", href: "/culture/festivals/rath-yatra" },
  { date: "2027-09-04", name: "Ganesh Chaturthi", kind: "listed", href: "/culture/festivals/ganesh-chaturthi" },
  { date: "2027-09-12", name: "Onam", kind: "listed", href: "/culture/festivals/onam" },
  { date: "2027-10-06", name: "Durga Puja: Saptami", kind: "listed", href: "/culture/festivals/durga-puja" },
  { date: "2027-10-07", name: "Durga Puja: Ashtami", kind: "listed", href: "/culture/festivals/durga-puja" },
  { date: "2027-10-08", name: "Durga Puja: Navami", kind: "listed", href: "/culture/festivals/durga-puja" },
  { date: "2027-10-09", name: "Dussehra", kind: "listed", href: "/culture/festivals/navratri" },
  { date: "2027-10-29", name: "Diwali", kind: "listed", href: "/culture/festivals/diwali" },
  { date: "2027-11-04", name: "Chhath Puja", kind: "listed", href: "/culture/festivals/chhath" },
];

export const HOLIDAY_SOURCES = [
  { label: "DoPT holidays for Central Government offices, 2027", url: "https://documents.doptcirculars.nic.in/D2/D02est/Holiday%20list%202027Cj0HU.PDF" },
  { label: "PIB: holidays for Central Government offices in 2026", url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2187285&reg=48&lang=2" },
];

/** Fixed days apply to any year; dated entries exist only where a source was read. */
export function holidaysForYear(year: number): Holiday[] {
  const fixed = FIXED.map(({ monthDay, ...rest }) => ({ ...rest, date: `${year}-${monthDay}` }));
  return [...fixed, ...DATED.filter((holiday) => holiday.date.startsWith(`${year}-`))].sort((a, b) => a.date.localeCompare(b.date));
}
