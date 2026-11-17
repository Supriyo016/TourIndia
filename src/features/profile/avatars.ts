/**
 * The preset avatars: original illustrations drawn in code (see components/profile/Avatar.tsx),
 * so there are no uploads to store, scan or moderate. Each is a traveller against an Indian
 * landscape. Mix of skin tones, hair and accessories so most people can find one that feels theirs.
 */

export type Skin = "s1" | "s2" | "s3" | "s4" | "s5";
export type Hair = "short" | "long" | "bun" | "curly" | "bob" | "cap" | "hat" | "crop";
export type Extra = "glasses" | "sunglasses" | "earrings" | "flower" | "headphones" | "scarf" | "camera" | "beard" | "moustache";
export type Scene = "mountains" | "sea" | "dunes" | "tea" | "sunrise" | "city" | "backwaters" | "monsoon";

export interface AvatarSpec {
  id: string;
  name: string;
  skin: Skin;
  hair: Hair;
  hairColour: string;
  top: string;
  scene: Scene;
  extras: Extra[];
}

export const AVATARS = [
  { id: "hill-trekker", name: "Hill trekker", skin: "s3", hair: "cap", hairColour: "#2b1d14", top: "#c2410c", scene: "mountains", extras: ["sunglasses"] },
  { id: "beach-morning", name: "Beach morning", skin: "s2", hair: "long", hairColour: "#3a2416", top: "#0e7490", scene: "sea", extras: ["flower"] },
  { id: "desert-dawn", name: "Desert dawn", skin: "s4", hair: "short", hairColour: "#1b1410", top: "#b45309", scene: "dunes", extras: ["scarf", "moustache"] },
  { id: "tea-garden", name: "Tea garden", skin: "s3", hair: "bun", hairColour: "#21160f", top: "#15803d", scene: "tea", extras: ["earrings"] },
  { id: "ghat-sunrise", name: "Ghat at sunrise", skin: "s4", hair: "crop", hairColour: "#191210", top: "#9d174d", scene: "sunrise", extras: ["glasses", "beard"] },
  { id: "city-walker", name: "City walker", skin: "s2", hair: "bob", hairColour: "#2a1a12", top: "#4338ca", scene: "city", extras: ["headphones"] },
  { id: "backwater-drifter", name: "Backwater drifter", skin: "s5", hair: "curly", hairColour: "#120d0a", top: "#047857", scene: "backwaters", extras: [] },
  { id: "monsoon-chaser", name: "Monsoon chaser", skin: "s3", hair: "short", hairColour: "#2b1d14", top: "#1d4ed8", scene: "monsoon", extras: ["camera"] },
  { id: "snow-line", name: "Snow line", skin: "s1", hair: "hat", hairColour: "#5b3a21", top: "#7c3aed", scene: "mountains", extras: ["scarf"] },
  { id: "fort-explorer", name: "Fort explorer", skin: "s4", hair: "long", hairColour: "#16100c", top: "#be123c", scene: "dunes", extras: ["earrings", "sunglasses"] },
  { id: "photo-walk", name: "Photo walk", skin: "s2", hair: "crop", hairColour: "#3a2416", top: "#334155", scene: "city", extras: ["camera", "beard"] },
  { id: "island-hopper", name: "Island hopper", skin: "s5", hair: "hat", hairColour: "#120d0a", top: "#0891b2", scene: "sea", extras: [] },
  { id: "valley-reader", name: "Valley reader", skin: "s3", hair: "bob", hairColour: "#1b1410", top: "#a16207", scene: "tea", extras: ["glasses"] },
  { id: "rain-cafe", name: "Rain café", skin: "s2", hair: "bun", hairColour: "#2a1a12", top: "#6d28d9", scene: "monsoon", extras: ["headphones", "earrings"] },
  { id: "temple-town", name: "Temple town", skin: "s5", hair: "short", hairColour: "#120d0a", top: "#ea580c", scene: "sunrise", extras: ["moustache"] },
  { id: "houseboat", name: "Houseboat", skin: "s4", hair: "curly", hairColour: "#191210", top: "#0f766e", scene: "backwaters", extras: ["flower"] },
] as const satisfies readonly AvatarSpec[];

export type AvatarId = (typeof AVATARS)[number]["id"];
export const AVATAR_IDS = AVATARS.map((a) => a.id) as [AvatarId, ...AvatarId[]];
const BY_ID = new Map<string, AvatarSpec>(AVATARS.map((a) => [a.id, a]));

export const avatarById = (id: string | undefined): AvatarSpec => BY_ID.get(id ?? "") ?? AVATARS[0];

/** A stable starting avatar for someone who hasn't picked one, so profiles don't all look alike. */
export function defaultAvatar(seed: string): AvatarId {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return AVATARS[hash % AVATARS.length]!.id;
}
