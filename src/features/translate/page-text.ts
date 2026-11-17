import "server-only";

/**
 * Only text that really appears on one of the site's own pages is sent to the model. The browser
 * says which page it is reading; the server loads that page from its own origin and checks every
 * piece of text against it. This keeps the shared translation cache from being filled with
 * made-up text (cache poisoning) and stops the endpoint being used as a free translator.
 */

const PATH = /^\/[A-Za-z0-9\-/_.~%]{0,200}$/;
const TTL_MS = 10 * 60_000;
const MAX_PAGES = 100;
const FETCH_TIMEOUT_MS = 8_000;

const pages = new Map<string, { text: string; expires: number }>();

export const isPagePath = (path: string) => PATH.test(path) && !path.includes("..") && !path.startsWith("/api/") && !path.startsWith("//");

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Text with link markers and every kind of whitespace removed, so DOM text and HTML text compare equal. */
export function squash(text: string): string {
  return text.replace(/⟦\d+⟧/g, "").replace(/[\s ​]+/g, "");
}

/** The visible text of an HTML page, squashed. Scripts, styles and tags are dropped; entities decoded. */
export function htmlText(html: string): string {
  const text = html
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
      if (name[0] === "#") {
        const code = name[1] === "x" || name[1] === "X" ? Number.parseInt(name.slice(2), 16) : Number(name.slice(1));
        return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : entity;
      }
      return ENTITIES[name.toLowerCase()] ?? entity;
    });
  return squash(text);
}

async function loadPage(origin: string, path: string, fetchImpl: typeof fetch): Promise<string | null> {
  const key = `${origin}${path}`;
  const cached = pages.get(key);
  if (cached && cached.expires > Date.now()) return cached.text;
  try {
    const response = await fetchImpl(new URL(path, origin), { redirect: "follow", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), headers: { accept: "text/html" } });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
    const text = htmlText(await response.text());
    if (pages.size >= MAX_PAGES) pages.delete(pages.keys().next().value!);
    pages.set(key, { text, expires: Date.now() + TTL_MS });
    return text;
  } catch {
    return null;
  }
}

/** For each text, whether it appears on the page at `path` of `origin`. */
export async function textsOnPage(origin: string, path: string, texts: string[], fetchImpl: typeof fetch = fetch): Promise<boolean[]> {
  if (!isPagePath(path)) return texts.map(() => false);
  const page = await loadPage(origin, path, fetchImpl);
  if (!page) return texts.map(() => false);
  return texts.map((text) => {
    const needle = squash(text);
    return needle.length > 0 && page.includes(needle);
  });
}

/** Test helper. */
export function clearPageCache() {
  pages.clear();
}
