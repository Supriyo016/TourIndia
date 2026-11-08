/**
 * Builds the licensed photo library from Wikimedia Commons.
 *
 * For each content record it finds the lead image of the record's English
 * Wikipedia article, confirms the file carries a free licence, downloads a
 * resized copy and records author and licence for the Credits page. Files with
 * any other licence are skipped. Safe to re-run: finished keys are not fetched
 * again unless their entry is removed from images.json.
 *
 * Usage: node scripts/fetch-images.mts [--only=prefix]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { northDestinations } from "../src/data/destinations/north.ts";
import { westSouthDestinations } from "../src/data/destinations/west-south.ts";
import { eastIslandDestinations } from "../src/data/destinations/east-islands.ts";
import { northeastDestinations } from "../src/data/destinations/northeast.ts";
import { states } from "../src/data/states.ts";
import { festivals } from "../src/data/festivals.ts";
import { foods } from "../src/data/food.ts";
import { unescoSites } from "../src/data/heritage.ts";
import { stories } from "../src/data/stories.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "src/data/generated/images.json");
const USER_AGENT = "TourIndiaBuild/2.0 (https://github.com/Supriyo016/TourIndia)";
const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice(7);

interface Job {
  key: string;
  folder: string;
  file: string;
  title: string;
  alt: string;
  width: number;
  /** Prefer landscape framing. */
  landscape: boolean;
  /** Skip this many suitable images, used to get a second view of a place. */
  offset?: number;
}

const destinations = [
  ...northDestinations,
  ...westSouthDestinations,
  ...eastIslandDestinations,
  ...northeastDestinations,
];
const stateName = (slug: string) => states.find((state) => state.slug === slug)?.name ?? "";

/** Better subjects where a city article opens with a collage. */
const titleOverrides: Record<string, string | null> = JSON.parse(
  readFileSync(join(root, "scripts/image-overrides.json"), "utf8"),
);

const hero: [string, string, string][] = [
  ["taj-mahal", "Taj Mahal", "The Taj Mahal at Agra seen across its gardens"],
  ["kashmir", "Dal Lake", "Dal Lake at Srinagar with the mountains of Kashmir beyond"],
  ["kerala", "Kerala backwaters", "A boat on the backwaters of Kerala"],
  ["rajasthan", "Jaisalmer Fort", "The sandstone walls of Jaisalmer Fort in Rajasthan"],
  ["varanasi", "Ghats in Varanasi", "Stone ghats along the Ganga at Varanasi"],
  ["northeast", "Living root bridge", "A living root bridge in Meghalaya"],
  ["goa", "Palolem Beach", "A beach on the coast of Goa"],
  ["ladakh", "Nubra Valley", "The Nubra Valley in Ladakh"],
];

const jobs: Job[] = [
  ...hero.map(([slug, title, alt]) => ({
    key: `hero:${slug}`, folder: "hero", file: slug, title, alt, width: 1920, landscape: true,
  })),
  ...destinations.flatMap((item) => {
    const place = `${item.name}, ${stateName(item.stateSlug)}`;
    return [
      { key: `destination:${item.slug}`, folder: "destinations", file: item.slug, title: titleOverrides[`destination:${item.slug}`] ?? item.wikipediaTitle, alt: place, width: 1600, landscape: true },
      { key: `gallery:${item.slug}-2`, folder: "gallery", file: `${item.slug}-2`, title: item.wikipediaTitle, alt: place, width: 1200, landscape: false, offset: 2 },
    ];
  }),
  ...states.map((item) => ({
    key: `state:${item.slug}`, folder: "states", file: item.slug, title: titleOverrides[`state:${item.slug}`] ?? item.wikipediaTitle, alt: item.name, width: 1400, landscape: true,
  })),
  ...festivals.map((item) => ({
    key: `festival:${item.slug}`, folder: "festivals", file: item.slug, title: item.wikipediaTitle, alt: `${item.name} celebrations`, width: 1200, landscape: true,
  })),
  ...foods.map((item) => ({
    key: `food:${item.slug}`, folder: "food", file: item.slug, title: item.wikipediaTitle, alt: `${item.name}, served`, width: 1000, landscape: false,
  })),
  ...unescoSites.map((item) => {
    const file = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
    return { key: `unesco:${file}`, folder: "unesco", file, title: item.wikipediaTitle, alt: item.name, width: 1000, landscape: true };
  }),
  ...stories.map((item) => ({
    key: `story:${item.slug}`, folder: "stories", file: item.slug, title: item.wikipediaTitle, alt: item.title, width: 1400, landscape: true,
  })),
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string): Promise<Response> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(45_000),
      });
      if (response.status !== 429 && response.status < 500) return response;
      await sleep(4000 * (attempt + 1));
    } catch {
      await sleep(3000 * (attempt + 1));
    }
  }
  throw new Error(`Gave up on ${url}`);
}

interface ImageInfo {
  thumburl?: string;
  url: string;
  width: number;
  height: number;
  descriptionurl: string;
  extmetadata?: Record<string, { value?: string | boolean }>;
}

interface ApiResult {
  query?: {
    pages?: { missing?: boolean; pageimage?: string; images?: { title: string }[]; imageinfo?: ImageInfo[] }[];
  };
}

async function api(host: string, params: Record<string, string>) {
  const query = new URLSearchParams({ format: "json", formatversion: "2", origin: "*", ...params });
  const response = await fetchWithRetry(`https://${host}/w/api.php?${query}`);
  return response.json() as Promise<ApiResult>;
}

const FREE = /^(cc0|cc[ -]by([ -]sa)?([ -]\d(\.\d)?)?|public domain|pd\b|pd-)/i;
const SKIP_NAME = /(collage|montage|clockwise|map|locator|flag|logo|seal|emblem|coat[ _]of|icon|commons-|wiki|diagram|chart|stamp|banner|symbol|portrait|\.svg|\.gif|\.tif|\.webm|\.ogv|\.ogg|\.pdf)/i;

const stripHtml = (value = "") =>
  value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

/** An override of "search:terms" looks on Commons directly, for subjects with no usable article image. */
async function searchCommons(terms: string): Promise<string[]> {
  const found = await api("commons.wikimedia.org", {
    action: "query", generator: "search", gsrnamespace: "6", gsrlimit: "20", gsrsearch: `filetype:bitmap ${terms}`, prop: "info",
  });
  return (found.query?.pages ?? [])
    .map((page) => (page as { title?: string }).title ?? "")
    .filter((name) => /\.jpe?g$/i.test(name) && !SKIP_NAME.test(name.replace(/^File:/, "")));
}

async function candidates(title: string): Promise<string[]> {
  if (title.startsWith("search:")) return searchCommons(title.slice(7));
  const lead = await api("en.wikipedia.org", {
    action: "query", redirects: "1", titles: title, prop: "pageimages|images", piprop: "name", imlimit: "60",
  });
  const page = lead.query?.pages?.[0];
  if (!page || page.missing) return [];
  const names = (page.images ?? []).map((image) => image.title);
  const first = page.pageimage ? [`File:${page.pageimage}`] : [];
  return [...new Set([...first, ...names])]
    .filter((name) => !SKIP_NAME.test(name.replace(/^File:/, "")))
    .filter((name) => /\.jpe?g$/i.test(name))
    .slice(0, 24);
}

async function inspect(fileTitle: string, width: number) {
  const data = await api("commons.wikimedia.org", {
    action: "query", titles: fileTitle, prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: String(width),
  });
  const info = data.query?.pages?.[0]?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  const textOf = (key: string) => {
    const value = meta[key]?.value;
    return typeof value === "string" ? value : "";
  };
  const license = stripHtml(textOf("LicenseShortName"));
  if (!FREE.test(license) || meta.NonFree?.value === "true" || meta.NonFree?.value === true) return null;
  if (info.width < 1000) return null;
  return {
    thumb: info.thumburl ?? info.url,
    width: info.width,
    height: info.height,
    license,
    licenseUrl: textOf("LicenseUrl") || undefined,
    author: stripHtml(textOf("Artist")).slice(0, 160) || "Unknown author",
    sourceUrl: info.descriptionurl,
    description: stripHtml(textOf("ImageDescription")),
  };
}

const manifest: Record<string, unknown> = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, "utf8"))
  : {};
const save = () => writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 1)}\n`);
mkdirSync(dirname(manifestPath), { recursive: true });

const usedFiles = new Set<string>(Object.values(manifest).map((item) => (item as { sourceUrl: string }).sourceUrl));
const failures: string[] = [];
let done = 0;

for (const job of jobs) {
  // A null override means a person reviewed this slot and no automatic pick is wanted.
  if (manifest[job.key] || titleOverrides[job.key] === null || (only && !job.key.startsWith(only))) continue;
  try {
    const names = await candidates(titleOverrides[job.key] ?? job.title);
    let skip = job.offset ?? 0;
    let saved = false;
    for (const name of names) {
      const details = await inspect(name, job.width);
      await sleep(120);
      if (!details || usedFiles.has(details.sourceUrl)) continue;
      if (job.landscape && details.width < details.height * 1.15) continue;
      if (skip > 0) { skip -= 1; continue; }

      const response = await fetchWithRetry(details.thumb);
      if (!response.ok) continue;
      const input = Buffer.from(await response.arrayBuffer());
      const directory = join(root, "public/images", job.folder);
      mkdirSync(directory, { recursive: true });
      const output = await sharp(input)
        .rotate()
        .resize({ width: job.width, withoutEnlargement: true })
        .webp({ quality: 74 })
        .toBuffer({ resolveWithObject: true });
      writeFileSync(join(directory, `${job.file}.webp`), output.data);
      const blur = await sharp(input).resize(16).webp({ quality: 40 }).toBuffer();

      manifest[job.key] = {
        src: `/images/${job.folder}/${job.file}.webp`,
        width: output.info.width,
        height: output.info.height,
        blur: `data:image/webp;base64,${blur.toString("base64")}`,
        alt: job.alt,
        author: details.author,
        license: details.license,
        licenseUrl: details.licenseUrl,
        sourceUrl: details.sourceUrl,
      };
      usedFiles.add(details.sourceUrl);
      saved = true;
      done += 1;
      if (done % 10 === 0) save();
      console.log(`ok   ${job.key}  (${details.license})`);
      break;
    }
    if (!saved) failures.push(job.key);
  } catch (error) {
    failures.push(`${job.key}: ${(error as Error).message}`);
  }
  await sleep(250);
}

save();
console.log(`\nSaved ${done} new images. Manifest holds ${Object.keys(manifest).length}.`);
if (failures.length) console.log(`No suitable licensed image for:\n  ${failures.join("\n  ")}`);
