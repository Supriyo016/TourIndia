/**
 * Date-based photo rotation, worked out on the server when a page is (re)built, so every visitor
 * sees the same photos on the same day and nothing changes between the server and the browser.
 *
 * - Home slider: half the slides change every 10 days, the other half 10 days later, so after
 *   20 days every slide is different. See `heroRotation`.
 * - Page photos: each page's lead photo moves to its next good alternative once a month, on a day
 *   of the month that differs from page to page, so the site changes a little every day rather
 *   than all at once. See `monthlyPick`.
 */

const DAY_MS = 86_400_000;
/** Midnight 1 January 2026 in India (UTC+5:30), the day the schedule counts from. */
const EPOCH = Date.UTC(2025, 11, 31, 18, 30);

/** Whole days since the epoch, counted in India time. */
export function dayIndex(now: Date = new Date()): number {
  return Math.floor((now.getTime() - EPOCH) / DAY_MS);
}

export const SLIDE_SWAP_DAYS = 10;
export const PAGE_PHOTO_DAYS = 30;

/**
 * Which pool entries the slider shows on a given day. Slots are split in two halves: one half
 * moves on at every even 10-day step, the other at every odd one, each jumping a whole slider's
 * worth along the pool. So 10 days on, half the slides are new; 20 days on, all of them are.
 * Needs a pool of at least twice the slider size so the halves never show the same picture.
 */
export function heroRotation(poolSize: number, slots: number, now: Date = new Date()): number[] {
  if (poolSize <= slots) return Array.from({ length: poolSize }, (_, i) => i);
  const step = Math.floor(dayIndex(now) / SLIDE_SWAP_DAYS);
  const half = Math.ceil(slots / 2);
  const firstGen = Math.floor((step + 1) / 2);
  const secondGen = Math.floor(step / 2);
  return Array.from({ length: slots }, (_, slot) => {
    const generation = slot < half ? firstGen : secondGen;
    return (((generation * slots + slot) % poolSize) + poolSize) % poolSize;
  });
}

/** Small stable hash, so each page gets its own change day. */
function hash(text: string): number {
  let value = 2166136261;
  for (const character of text) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return value >>> 0;
}

/**
 * One of `candidates` for this page this month. The first candidate is the page's own photo; the
 * page moves to the next one every 30 days, on its own day, and loops round.
 */
export function monthlyPick<T>(id: string, candidates: readonly T[], now: Date = new Date()): T | undefined {
  if (candidates.length <= 1) return candidates[0];
  const period = Math.floor((dayIndex(now) + (hash(id) % PAGE_PHOTO_DAYS)) / PAGE_PHOTO_DAYS);
  return candidates[((period % candidates.length) + candidates.length) % candidates.length];
}
