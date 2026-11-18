import "server-only";
import type { Metadata } from "next";
import { site } from "@/config/site";
import { moreNavigation, navigation } from "@/config/navigation";
import { redirects } from "@/config/redirects";
import { destinations, states } from "@/data";
import { artArticles } from "@/data/arts-encyclopedia";
import { artForms } from "@/data/arts";
import { circuits } from "@/data/circuits";
import { festivals } from "@/data/festivals";
import { foods, regionalCuisines } from "@/data/food";
import { museumsAndSites, unescoSites } from "@/data/heritage";
import { stories } from "@/data/stories";
import { categories } from "@/data/taxonomy";
import { allImages } from "@/lib/images";
import sitemap from "@/app/sitemap";

/**
 * The SEO centre's report, computed from the site's own data, page metadata and sitemap. Each
 * page's title and description come from the page's real `metadata` or `generateMetadata`, so the
 * report can't drift from what search engines see. Read-only.
 */

export const TITLE_MAX = 60;
export const TITLE_MIN = 15;
export const DESCRIPTION_MAX = 160;
export const DESCRIPTION_MIN = 50;

type MetaSource = { metadata?: Metadata; generateMetadata?: (props: never) => Promise<Metadata> | Metadata };
type Loader = () => Promise<object>;

/** Pages in the sitemap with fixed addresses, and where their metadata lives. */
const STATIC_PAGES: Record<string, Loader> = {
  "": () => import("@/app/page"),
  "/explore": () => import("@/app/explore/page"),
  "/discover": () => import("@/app/discover/page"),
  "/planner": () => import("@/app/planner/page"),
  "/calendar": () => import("@/app/calendar/page"),
  "/compare": () => import("@/app/compare/page"),
  "/quiz": () => import("@/app/quiz/page"),
  "/bookings": () => import("@/app/bookings/page"),
  "/services": () => import("@/app/services/page"),
  "/gallery": () => import("@/app/gallery/page"),
  "/stories": () => import("@/app/stories/page"),
  "/culture": () => import("@/app/culture/page"),
  "/culture/festivals": () => import("@/app/culture/festivals/page"),
  "/culture/food": () => import("@/app/culture/food/page"),
  "/culture/heritage": () => import("@/app/culture/heritage/page"),
  "/culture/arts": () => import("@/app/culture/arts/page"),
  "/about": () => import("@/app/about/page"),
  "/contact": () => import("@/app/contact/page"),
  "/privacy": () => import("@/app/privacy/page"),
  "/terms": () => import("@/app/terms/page"),
  "/cookies": () => import("@/app/cookies/page"),
  "/disclaimer": () => import("@/app/disclaimer/page"),
  "/content-policy": () => import("@/app/content-policy/page"),
  "/credits": () => import("@/app/credits/page"),
  "/encyclopedia": () => import("@/app/encyclopedia/page"),
};

/** Pages with a slug in the address: the prefix, the route's param name and where the metadata lives. */
const DYNAMIC_PAGES: { prefix: string; param: string; slugs: string[]; load: Loader }[] = [
  { prefix: "/explore/", param: "state", slugs: states.map((s) => s.slug), load: () => import("@/app/explore/[state]/page") },
  { prefix: "/destinations/", param: "slug", slugs: destinations.map((d) => d.slug), load: () => import("@/app/destinations/[slug]/page") },
  { prefix: "/discover/", param: "category", slugs: categories.map((c) => c.id), load: () => import("@/app/discover/[category]/page") },
  { prefix: "/culture/festivals/", param: "slug", slugs: festivals.map((f) => f.slug), load: () => import("@/app/culture/festivals/[slug]/page") },
  { prefix: "/culture/food/", param: "slug", slugs: foods.map((f) => f.slug), load: () => import("@/app/culture/food/[slug]/page") },
  { prefix: "/stories/", param: "slug", slugs: stories.map((s) => s.slug), load: () => import("@/app/stories/[slug]/page") },
  { prefix: "/culture/arts/", param: "slug", slugs: artForms.map((a) => a.slug), load: () => import("@/app/culture/arts/[slug]/page") },
  { prefix: "/encyclopedia/states/", param: "slug", slugs: states.map((s) => s.slug), load: () => import("@/app/encyclopedia/states/[slug]/page") },
  { prefix: "/encyclopedia/", param: "slug", slugs: destinations.map((d) => d.slug), load: () => import("@/app/encyclopedia/[slug]/page") },
];

/**
 * Pages that ask search engines not to index them (robots noindex). Kept by hand; a test checks it
 * against every `index: false` in src/app so it can't fall out of date.
 */
export const NOINDEX_PAGES: { path: string; why: string }[] = [
  { path: "/admin/*", why: "Admin area" },
  { path: "/appeal", why: "Account appeals" },
  { path: "/c/[shareId]", why: "Shared collections (private links)" },
  { path: "/m/[shareId]", why: "Shared memories (private links)" },
  { path: "/maintenance", why: "Maintenance notice" },
  { path: "/profile/*", why: "Personal profile" },
  { path: "/saved", why: "Personal saved places" },
  { path: "/t/[shareId]", why: "Shared trips (private links)" },
  { path: "/u/[username]", why: "Public profiles" },
];

/** Addresses that exist but aren't in the sitemap (personal, utility or noindex pages). */
const OTHER_ROUTES = ["/saved", "/appeal", "/profile", "/account", "/admin", "/search", "/api"];

export interface PageMeta {
  path: string;
  title: string;
  /** The title as it appears in search results, with the site name added by the template. */
  fullTitle: string;
  description?: string;
  inheritsTitle: boolean;
  inheritsDescription: boolean;
}

export interface Issue {
  path: string;
  problem: string;
  detail?: string;
}

function resolveTitle(title: Metadata["title"]): { text?: string; templated: boolean } {
  if (!title) return { templated: false };
  if (typeof title === "string") return { text: title, templated: true };
  if ("absolute" in title && title.absolute) return { text: title.absolute, templated: false };
  if ("default" in title && title.default) return { text: title.default, templated: false };
  return { templated: false };
}

const DEFAULT_TITLE = `${site.name}: discover and plan travel across India`;

async function metaFor(path: string, source: MetaSource, params?: Record<string, string>): Promise<PageMeta> {
  const metadata = source.generateMetadata ? await source.generateMetadata({ params: Promise.resolve(params ?? {}), searchParams: Promise.resolve({}) } as never) : (source.metadata ?? {});
  const { text, templated } = resolveTitle(metadata.title);
  const description = typeof metadata.description === "string" && metadata.description.trim() ? metadata.description.trim() : undefined;
  return {
    path: path || "/",
    title: text ?? DEFAULT_TITLE,
    fullTitle: text ? (templated ? `${text} | ${site.name}` : text) : DEFAULT_TITLE,
    description: description ?? site.description,
    inheritsTitle: !text,
    inheritsDescription: !description,
  };
}

export async function pageMetadata(): Promise<PageMeta[]> {
  const pages: PageMeta[] = [];
  for (const [path, load] of Object.entries(STATIC_PAGES)) pages.push(await metaFor(path, (await load()) as MetaSource));
  for (const group of DYNAMIC_PAGES) {
    const source = (await group.load()) as MetaSource;
    for (const slug of group.slugs) pages.push(await metaFor(`${group.prefix}${slug}`, source, { [group.param]: slug }));
  }
  return pages;
}

/** Every internal path the site answers, from the sitemap plus the pages kept out of it. */
export function knownPaths(): Set<string> {
  const paths = new Set(sitemap().map((entry) => new URL(entry.url).pathname.replace(/\/$/, "") || "/"));
  for (const path of OTHER_ROUTES) paths.add(path);
  paths.add("/");
  return paths;
}

const INTERNAL = /(?:^|[\s("'=\]])((?:\/[a-z0-9][a-z0-9-]*)+\/?)(?:[#?][^\s)"']*)?(?=$|[\s)"'.,;:!])/g;

/** Walks any data value and yields internal-looking paths found in its strings, with where they came from. */
function* linksIn(value: unknown, where: string, depth = 0): Generator<{ path: string; where: string }> {
  if (depth > 8 || value === null || value === undefined) return;
  if (typeof value === "string") {
    for (const match of value.matchAll(INTERNAL)) {
      const path = match[1]!.replace(/\/$/, "");
      // File paths (images, data files) aren't page links.
      if (!/\.[a-z0-9]{2,5}$/i.test(path) && !path.startsWith("/images/") && !path.startsWith("/videos/")) yield { path, where };
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) yield* linksIn(item, where, depth + 1);
    return;
  }
  if (typeof value === "object") for (const item of Object.values(value)) yield* linksIn(item, where, depth + 1);
}

const label = (kind: string, item: { slug?: string; id?: string; name?: string; title?: string }) => `${kind}: ${item.name ?? item.title ?? item.slug ?? item.id ?? "?"}`;

export function brokenLinks(): Issue[] {
  const known = knownPaths();
  const sources: [string, { slug?: string; id?: string; name?: string; title?: string }[]][] = [
    ["Destination", destinations],
    ["State", states],
    ["Festival", festivals],
    ["Food", foods],
    ["Cuisine", regionalCuisines as never],
    ["Story", stories],
    ["Art form", artForms],
    ["UNESCO site", unescoSites as never],
    ["Museum or site", museumsAndSites as never],
    ["Circuit", circuits as never],
    ["Category", categories],
    ["Art article", Object.entries(artArticles).map(([slug, article]) => ({ slug, ...article })) as never],
    ["Navigation", [...navigation, ...moreNavigation] as never],
  ];
  const issues: Issue[] = [];
  const seen = new Set<string>();
  for (const [kind, items] of sources) {
    for (const item of items) {
      for (const { path, where } of linksIn(item, label(kind, item))) {
        if (known.has(path) || seen.has(`${where}${path}`)) continue;
        seen.add(`${where}${path}`);
        issues.push({ path, problem: "Links to a page that doesn't exist", detail: where });
      }
    }
  }
  // References by slug that render as links.
  const destinationSlugs = new Set(destinations.map((d) => d.slug));
  const stateSlugs = new Set(states.map((s) => s.slug));
  for (const d of destinations) if (!stateSlugs.has(d.stateSlug)) issues.push({ path: `/destinations/${d.slug}`, problem: "Belongs to a state that doesn't exist", detail: d.stateSlug });
  for (const f of festivals) for (const s of f.stateSlugs ?? []) if (!stateSlugs.has(s)) issues.push({ path: `/culture/festivals/${f.slug}`, problem: "Links to a state that doesn't exist", detail: s });
  for (const a of artForms as unknown as { slug: string; relatedDestinationSlugs?: string[] }[]) {
    for (const slug of a.relatedDestinationSlugs ?? []) if (!destinationSlugs.has(slug)) issues.push({ path: `/culture/arts/${a.slug}`, problem: "Links to a destination that doesn't exist", detail: slug });
  }
  return issues;
}

export function imageIssues(): Issue[] {
  const issues: Issue[] = [];
  for (const image of allImages()) {
    const alt = (image.alt ?? "").trim();
    if (!alt) issues.push({ path: image.src, problem: "No alt text", detail: image.key });
    else if (alt.length < 8 || /^(image|photo|picture|img)\b/i.test(alt) || /\.(jpe?g|png|webp|avif)$/i.test(alt)) issues.push({ path: image.src, problem: "Alt text doesn't describe the image", detail: `${image.key}: “${alt}”` });
  }
  return issues;
}

export function metadataIssues(pages: PageMeta[]): Issue[] {
  const issues: Issue[] = [];
  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();
  for (const page of pages) {
    if (page.inheritsTitle && page.path !== "/") issues.push({ path: page.path, problem: "No title of its own (uses the site's default)" });
    else if (page.fullTitle.length > TITLE_MAX) issues.push({ path: page.path, problem: `Title longer than ${TITLE_MAX} characters`, detail: `${page.fullTitle.length}: ${page.fullTitle}` });
    else if (page.fullTitle.length < TITLE_MIN && page.path !== "/") issues.push({ path: page.path, problem: `Title shorter than ${TITLE_MIN} characters`, detail: page.fullTitle });
    if (page.inheritsDescription && page.path !== "/") issues.push({ path: page.path, problem: "No description of its own (uses the site's default)" });
    else if (page.description && page.description.length > DESCRIPTION_MAX) issues.push({ path: page.path, problem: `Description longer than ${DESCRIPTION_MAX} characters`, detail: `${page.description.length} characters` });
    else if (page.description && page.description.length < DESCRIPTION_MIN) issues.push({ path: page.path, problem: `Description shorter than ${DESCRIPTION_MIN} characters`, detail: page.description });
    titles.set(page.fullTitle, [...(titles.get(page.fullTitle) ?? []), page.path]);
    if (!page.inheritsDescription && page.description) descriptions.set(page.description, [...(descriptions.get(page.description) ?? []), page.path]);
  }
  for (const [title, paths] of titles) if (paths.length > 1) issues.push({ path: paths[0]!, problem: `Same title as ${paths.length - 1} other ${paths.length === 2 ? "page" : "pages"}`, detail: `${title} (${paths.slice(1, 4).join(", ")}${paths.length > 4 ? "…" : ""})` });
  for (const [, paths] of descriptions) if (paths.length > 1) issues.push({ path: paths[0]!, problem: `Same description as ${paths.length - 1} other ${paths.length === 2 ? "page" : "pages"}`, detail: paths.slice(1, 4).join(", ") });
  return issues;
}

export function redirectReport() {
  const known = knownPaths();
  return redirects.map((r) => ({ ...r, destinationExists: known.has(r.destination.replace(/\/$/, "") || "/") }));
}

export async function seoReport() {
  const pages = await pageMetadata();
  const entries = sitemap();
  return {
    sitemapUrls: entries.length,
    pagesChecked: pages.length,
    metadata: metadataIssues(pages),
    images: imageIssues(),
    imagesChecked: allImages().length,
    links: brokenLinks(),
    redirects: redirectReport(),
    noindex: NOINDEX_PAGES,
  };
}
