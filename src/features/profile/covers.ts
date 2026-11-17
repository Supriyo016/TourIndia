/** Profile covers: the site's own licensed hero photographs, so nothing new is stored or credited. */
export const COVERS = [
  { key: "hero:ladakh", name: "Ladakh" },
  { key: "hero:kerala", name: "Kerala backwaters" },
  { key: "hero:taj-mahal", name: "Taj Mahal" },
  { key: "hero:rajasthan", name: "Rajasthan" },
  { key: "hero:varanasi", name: "Varanasi" },
  { key: "hero:goa", name: "Goa" },
  { key: "hero:kashmir", name: "Kashmir" },
  { key: "hero:northeast", name: "The North East" },
  { key: "hero:hampi", name: "Hampi" },
  { key: "hero:udaipur", name: "Udaipur" },
  { key: "hero:munnar", name: "Munnar" },
  { key: "hero:konark", name: "Konark" },
  { key: "hero:amritsar", name: "Amritsar" },
] as const;

export type CoverKey = (typeof COVERS)[number]["key"];
export const COVER_KEYS = COVERS.map((c) => c.key) as [CoverKey, ...CoverKey[]];
export const DEFAULT_COVER: CoverKey = "hero:ladakh";
