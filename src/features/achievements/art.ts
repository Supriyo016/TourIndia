/** The motifs drawn on achievement badges (see components/achievements/BadgeArt.tsx). */
export const BADGE_ART = ["stamp", "stamps", "compass", "wave", "mountain", "hills", "india", "route", "routes", "folder", "quill", "book", "postcard", "question", "scales", "speech", "thumb", "star", "check"] as const;
export type BadgeArtId = (typeof BADGE_ART)[number];
