/**
 * The travel passport: a personal record of states and Union Territories, each marked by the
 * traveller as want to visit, exploring or visited, with an optional month for a visit.
 * Nothing here is inferred (no location, no browsing history), and it isn't an official document.
 * Shared by the server (validation) and the browser (display and the copy on this device).
 */

export const PASSPORT_STATUSES = ["want", "exploring", "visited"] as const;
export type PassportStatus = (typeof PASSPORT_STATUSES)[number];

export interface PassportEntry {
  state: string;
  status: PassportStatus;
  /** "YYYY-MM", only for visited states, and only when the traveller adds it. */
  month?: string;
}

export const STATUS_LABEL: Record<PassportStatus, string> = { want: "Want to visit", exploring: "Exploring", visited: "Visited" };

/** Map and legend colours, from the site's theme tokens so both themes work. */
export const STATUS_COLOUR: Record<PassportStatus, string> = { visited: "var(--forest)", exploring: "var(--accent)", want: "var(--brand)" };

export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
export const EARLIEST_YEAR = 1950;

/** A visit month must be a real month from 1950 up to this month (a day's grace for time zones). */
export function isVisitMonth(month: string, now = new Date()) {
  if (!MONTH_PATTERN.test(month)) return false;
  const year = Number(month.slice(0, 4));
  const latest = new Date(now.getTime() + 86_400_000);
  const limit = `${latest.getUTCFullYear()}-${String(latest.getUTCMonth() + 1).padStart(2, "0")}`;
  return year >= EARLIEST_YEAR && month <= limit;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTH_NAMES = MONTHS;

export function formatVisitMonth(month: string) {
  return `${MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const isPassportList = (value: unknown) =>
  Array.isArray(value) &&
  value.every(
    (entry) =>
      isRecord(entry) &&
      typeof entry.state === "string" &&
      (PASSPORT_STATUSES as readonly unknown[]).includes(entry.status) &&
      (entry.month === undefined || (typeof entry.month === "string" && MONTH_PATTERN.test(entry.month))),
  );

/** Old stamps were a list of states; every one of them was a visit. */
export const fromStamps = (stamps: string[]): PassportEntry[] => [...new Set(stamps)].map((state) => ({ state, status: "visited" }));

export const visitedStates = (entries: PassportEntry[]) => entries.filter((entry) => entry.status === "visited").map((entry) => entry.state);

/** Sets one state's status (null removes it). A state keeps its place in the list when it changes. */
export function applyPassport(entries: PassportEntry[], state: string, status: PassportStatus | null, month: string | null): PassportEntry[] {
  if (!status) return entries.filter((entry) => entry.state !== state);
  const next: PassportEntry = { state, status, ...(status === "visited" && month ? { month } : {}) };
  const at = entries.findIndex((entry) => entry.state === state);
  if (at === -1) return [...entries, next];
  return entries.map((entry, index) => (index === at ? next : entry));
}

export function passportCounts(entries: PassportEntry[]) {
  const counts: Record<PassportStatus, number> = { want: 0, exploring: 0, visited: 0 };
  for (const entry of entries) counts[entry.status] += 1;
  return counts;
}

/**
 * CSS that colours the map by status. The map is plain SVG with data-slug on each state, so a
 * scoped style sheet is all it takes, on the server or in the browser.
 */
export function passportMapCss(scope: string, entries: PassportEntry[]) {
  return entries
    .filter((entry) => /^[a-z0-9-]+$/.test(entry.state))
    .map((entry) => `[data-passport="${scope}"] [data-slug="${entry.state}"] :is(path,circle){fill:${STATUS_COLOUR[entry.status]}}`)
    .join("\n");
}
