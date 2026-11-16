/**
 * Things people can love, rate, comment on and share. Every target is checked against
 * the site's own content, so nothing can be attached to an id that doesn't exist.
 * Shared by the browser and the server.
 */
export const TARGET_TYPES = ["place", "state", "story", "festival", "food", "art"] as const;
export type TargetType = (typeof TARGET_TYPES)[number];

export interface Target {
  type: TargetType;
  id: string;
}

export const targetKey = (target: Target) => `${target.type}:${target.id}`;

export const TARGET_LABELS: Record<TargetType, string> = {
  place: "place",
  state: "state",
  story: "story",
  festival: "festival",
  food: "dish",
  art: "art form",
};

export const COMMENT_KINDS = {
  viewpoint: "Viewpoint",
  tip: "Tip for others",
  question: "Question",
} as const;
export type CommentKind = keyof typeof COMMENT_KINDS;

/** Encyclopedia fields people can suggest changes to. "paragraphs" and "list" are edited one item per line. */
export type FieldKind = "text" | "paragraphs" | "list";
export const EDITABLE_FIELDS: Partial<Record<TargetType, Record<string, { label: string; kind: FieldKind }>>> = {
  place: {
    overview: { label: "Overview", kind: "paragraphs" },
    history: { label: "History", kind: "paragraphs" },
    bestTimeNote: { label: "Best time to visit", kind: "text" },
    "gettingThere.air": { label: "Getting there by air", kind: "text" },
    "gettingThere.rail": { label: "Getting there by rail", kind: "text" },
    "gettingThere.road": { label: "Getting there by road", kind: "text" },
    "gettingThere.local": { label: "Getting around", kind: "text" },
    accommodation: { label: "Where to stay", kind: "text" },
    permits: { label: "Permits", kind: "text" },
    accessibility: { label: "Accessibility", kind: "text" },
    responsibleTravel: { label: "Responsible travel", kind: "text" },
    tips: { label: "Tips", kind: "list" },
    precautions: { label: "Precautions", kind: "list" },
  },
  state: {
    overview: { label: "Overview", kind: "paragraphs" },
    culture: { label: "Culture", kind: "text" },
    capital: { label: "Capital", kind: "text" },
    languages: { label: "Languages", kind: "list" },
  },
};

/** Reads a dotted field such as "gettingThere.air" from a content object. */
export function readField(source: object, field: string): unknown {
  return field.split(".").reduce<unknown>((value, key) => (value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined), source);
}

/** Turns a stored value into the text shown in the edit box, and back again. */
export function fieldToText(value: unknown, kind: FieldKind): string {
  if (Array.isArray(value)) return value.join(kind === "paragraphs" ? "\n\n" : "\n");
  return typeof value === "string" ? value : "";
}

export function textToField(text: string, kind: FieldKind): string | string[] {
  if (kind === "text") return text.trim();
  return text
    .split(kind === "paragraphs" ? /\n\s*\n/ : /\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Returns a copy of the content with approved changes applied. */
export function applyOverrides<T extends object>(source: T, overrides: Record<string, unknown>): T {
  const copy = structuredClone(source) as Record<string, unknown>;
  for (const [field, value] of Object.entries(overrides)) {
    const keys = field.split(".");
    let node = copy;
    for (const key of keys.slice(0, -1)) {
      if (!node[key] || typeof node[key] !== "object") node[key] = {};
      node = node[key] as Record<string, unknown>;
    }
    node[keys[keys.length - 1]!] = value;
  }
  return copy as T;
}
