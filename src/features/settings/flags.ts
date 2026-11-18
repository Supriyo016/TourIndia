/** Feature flags, as pure data shared by the server and the settings screen. Every flag is on unless turned off. */
export const FLAGS = {
  assistant: { label: "Yatri answers questions", off: "Yatri is resting for a while. The guides and the search still work." },
  comments: { label: "People can comment, rate and suggest edits", off: "Comments and suggestions are paused for a while." },
  stories: { label: "People can send in travel stories", off: "Story submissions are paused for a while." },
  bookings: { label: "People can send trip-planning requests", off: "Trip-planning requests are paused for a while." },
  newsletter: { label: "People can sign up for the newsletter", off: "Newsletter sign-ups are paused for a while." },
} as const;

export type Flag = keyof typeof FLAGS;
export const FLAG_IDS = Object.keys(FLAGS) as Flag[];

export const DEFAULT_MAINTENANCE_MESSAGE = "Tour India is having some maintenance and will be back shortly. Thank you for your patience.";
