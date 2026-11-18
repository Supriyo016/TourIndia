import type { ReactNode } from "react";
import type { AchievementGroup } from "@/features/achievements/service";
import type { BadgeArtId } from "@/features/achievements/art";

/**
 * Original badge illustrations, drawn in code: a medallion in the group's colour with a stamped
 * inner ring and a simple line motif. Uses the theme's colours, so it suits dark and light.
 * Locked badges are drawn faded and without colour.
 */

const COLOURS: Record<AchievementGroup, string> = {
  Passport: "var(--brand)",
  Planning: "var(--accent-strong)",
  Memories: "var(--rani)",
  Quiz: "var(--gold)",
  Community: "var(--forest)",
};

const MOTIFS: Record<BadgeArtId, ReactNode> = {
  stamp: (
    <>
      <rect x="22" y="21" width="20" height="22" rx="1.5" strokeDasharray="2.2 1.6" />
      <path d="M25 39l5-7 4 4 3-3 3 6" />
    </>
  ),
  stamps: (
    <>
      <rect x="19" y="24" width="16" height="18" rx="1.5" strokeDasharray="2 1.5" />
      <rect x="29" y="20" width="16" height="18" rx="1.5" strokeDasharray="2 1.5" />
      <path d="M32 34l4-5 3 3 3-2" />
    </>
  ),
  compass: (
    <>
      <circle cx="32" cy="32" r="13" />
      <path d="M32 21l3.5 11L32 43l-3.5-11z" fill="currentColor" fillOpacity="0.35" />
      <path d="M32 17v2M32 45v2M17 32h2M45 32h2" />
    </>
  ),
  wave: (
    <>
      <circle cx="39" cy="23" r="3.5" />
      <path d="M17 32q3.75-4 7.5 0t7.5 0 7.5 0 7.5 0" />
      <path d="M17 39q3.75-4 7.5 0t7.5 0 7.5 0 7.5 0" />
    </>
  ),
  mountain: (
    <>
      <path d="M16 42l11-17 6 9 5-6 10 14z" />
      <path d="M23.5 30.5l3.5-5.5 3.5 5" />
    </>
  ),
  hills: (
    <>
      <path d="M16 36q8-12 16 0t16 0" />
      <path d="M16 43q8-9 16 0t16 0" />
      <path d="M32 22c-3 2-3 6 0 8 3-2 3-6 0-8z" />
    </>
  ),
  india: (
    <>
      <circle cx="32" cy="32" r="7" />
      <path d="M32 18v5M32 41v5M18 32h5M41 32h5M22 22l3.5 3.5M38.5 38.5L42 42M42 22l-3.5 3.5M25.5 38.5L22 42" />
    </>
  ),
  route: (
    <>
      <path d="M19 43c6-2 4-10 11-10s6-8 12-10" strokeDasharray="3 3" />
      <path d="M42 17a4 4 0 0 1 4 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 0 1 4-4z" />
      <circle cx="19" cy="43" r="1.8" fill="currentColor" />
    </>
  ),
  routes: (
    <>
      <path d="M18 44c5-4 8-12 14-12" strokeDasharray="3 3" />
      <path d="M18 24c6 0 8 8 14 8" strokeDasharray="3 3" />
      <path d="M32 32h8" />
      <path d="M44 25a4 4 0 0 1 4 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 0 1 4-4z" />
    </>
  ),
  folder: (
    <>
      <path d="M18 24h9l3 3h16v16H18z" />
      <path d="M32 40s-5-3-5-6a2.5 2.5 0 0 1 5-1 2.5 2.5 0 0 1 5 1c0 3-5 6-5 6z" />
    </>
  ),
  quill: (
    <>
      <path d="M44 18c-10 2-18 10-20 22l4-2c6-4 12-10 16-20z" />
      <path d="M24 40l-4 6M30 34l-6 6" />
    </>
  ),
  book: (
    <>
      <path d="M32 24c-4-3-9-3-14-2v20c5-1 10-1 14 2 4-3 9-3 14-2V22c-5-1-10-1-14 2z" />
      <path d="M32 24v20" />
    </>
  ),
  postcard: (
    <>
      <rect x="17" y="23" width="30" height="20" rx="2" />
      <rect x="38" y="26" width="6" height="7" strokeDasharray="1.6 1.2" />
      <path d="M21 30h10M21 35h10M21 40h7M34 26v14" />
    </>
  ),
  question: (
    <>
      <path d="M26 27a6 6 0 1 1 9 5c-2 1-3 2-3 5" />
      <circle cx="32" cy="43" r="1.6" fill="currentColor" />
    </>
  ),
  scales: (
    <>
      <path d="M32 19v25M24 44h16M20 25h24" />
      <path d="M20 25l-4 9h8zM44 25l-4 9h8z" />
    </>
  ),
  speech: (
    <>
      <path d="M18 22h28v16H30l-7 6v-6h-5z" />
      <path d="M23 28h18M23 33h12" />
    </>
  ),
  thumb: (
    <>
      <path d="M20 31h5v13h-5z" />
      <path d="M25 32l5-9c2-1 4 1 3 3l-1 5h8c2 0 3 2 2.5 3.5L40 43c-.5 1-1.5 1.5-2.5 1.5H25" />
    </>
  ),
  star: <path d="M32 17l4.4 9.2 10 1.3-7.3 7 1.8 10L32 39.6l-8.9 4.9 1.8-10-7.3-7 10-1.3z" />,
  check: (
    <>
      <path d="M32 17l12 4v9c0 8-5 13-12 16-7-3-12-8-12-16v-9z" />
      <path d="M26 31l4.5 4.5L39 27" />
    </>
  ),
};

export function BadgeArt({ art, group, earned = true, size = 64, className }: { art: BadgeArtId; group: AchievementGroup; earned?: boolean; size?: number; className?: string }) {
  const colour = earned ? COLOURS[group] : "var(--muted)";
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className={className} style={{ color: colour, opacity: earned ? 1 : 0.45 }}>
      <circle cx="32" cy="32" r="30" fill="currentColor" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface)" strokeWidth="1.4" strokeDasharray="2.4 2.2" />
      <circle cx="32" cy="32" r="22.5" fill="var(--surface)" />
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {MOTIFS[art]}
      </g>
    </svg>
  );
}
