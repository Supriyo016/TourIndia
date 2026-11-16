export type SearchType = "Destination" | "State" | "Region" | "Travel style" | "Festival" | "Experience" | "Food";

export interface SearchEntry {
  type: SearchType;
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
}

const normalise = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const typeWeight: Record<SearchType, number> = {
  Destination: 6,
  State: 5,
  Region: 4,
  "Travel style": 3,
  Festival: 3,
  Food: 1,
  Experience: 0,
};

function scoreEntry(entry: SearchEntry, tokens: string[]): number {
  const title = normalise(entry.title);
  const haystack = `${title} ${normalise(entry.keywords)} ${normalise(entry.subtitle)}`;
  let score = typeWeight[entry.type];
  for (const token of tokens) {
    if (title === token) score += 60;
    else if (title.startsWith(token)) score += 40;
    else if (title.split(" ").some((word) => word.startsWith(token))) score += 28;
    else if (haystack.split(" ").some((word) => word.startsWith(token))) score += 12;
    else if (token.length >= 3 && haystack.includes(token)) score += 6;
    else return 0;
  }
  return score;
}

/** Every word in the query must match somewhere; better matches rank first. */
export function searchEntries(entries: SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const tokens = normalise(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [];
  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map(({ entry }) => entry);
}
