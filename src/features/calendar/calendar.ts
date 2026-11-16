import { holidaysForYear, type Holiday } from "@/data/holidays";

const pad = (value: number) => String(value).padStart(2, "0");

export const isoDate = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`;

/** Today's date in India, whatever the visitor's own time zone is. */
export function todayInIndia(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function formatIndiaDateTime(now: Date) {
  const zone = { timeZone: "Asia/Kolkata" } as const;
  return {
    date: new Intl.DateTimeFormat("en-IN", { ...zone, weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(now),
    time: new Intl.DateTimeFormat("en-IN", { ...zone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).format(now),
  };
}

export function holidaysOn(date: string): Holiday[] {
  return holidaysForYear(Number(date.slice(0, 4))).filter((holiday) => holiday.date === date);
}

export function holidaysInMonth(year: number, month: number): Holiday[] {
  const prefix = `${year}-${pad(month)}-`;
  return holidaysForYear(year).filter((holiday) => holiday.date.startsWith(prefix));
}

/** The next holiday on or after a date, looking into the following year if needed. */
export function nextHoliday(from: string): Holiday | undefined {
  const year = Number(from.slice(0, 4));
  return [...holidaysForYear(year), ...holidaysForYear(year + 1)].find((holiday) => holiday.date >= from);
}

/** Weeks starting on Monday. Days outside the month are null. */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(isoDate(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

export function shiftMonth(year: number, month: number, delta: number) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function formatLongDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
