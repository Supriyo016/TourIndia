/** Support ticket vocabulary, shared by the contact form, the server and the admin screens. */

export const TICKET_CATEGORIES = {
  general: "A general question",
  correction: "Wrong or outdated information on a page",
  bug: "Something on the site isn't working",
  feature: "An idea or feature request",
  accessibility: "An accessibility problem",
  account: "My account or signing in",
  privacy: "A privacy or data request",
  copyright: "A copyright or photo credit issue",
  other: "Something else",
} as const;
export type TicketCategory = keyof typeof TICKET_CATEGORIES;
export const CATEGORY_IDS = Object.keys(TICKET_CATEGORIES) as [TicketCategory, ...TicketCategory[]];

/** New → Under review → In progress → Resolved → Closed. */
export const TICKET_STATUSES = {
  new: "New",
  under_review: "Under review",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
} as const;
export type TicketStatus = keyof typeof TICKET_STATUSES;
export const STATUS_IDS = Object.keys(TICKET_STATUSES) as [TicketStatus, ...TicketStatus[]];

export const PRIORITIES = { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" } as const;
export type Priority = keyof typeof PRIORITIES;
export const PRIORITY_IDS = Object.keys(PRIORITIES) as [Priority, ...Priority[]];

/** Some requests have legal or safety weight, so they start higher in the list. */
export const startingPriority = (category: TicketCategory): Priority => (category === "privacy" || category === "copyright" || category === "accessibility" ? "high" : "normal");
