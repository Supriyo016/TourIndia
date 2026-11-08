/**
 * Downloads a hand-picked set of openly licensed travel videos from Wikimedia
 * Commons, at a web-friendly resolution, with their licence details.
 * Usage: node scripts/fetch-videos.mts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const USER_AGENT = "TourIndiaBuild/2.0 (https://github.com/Supriyo016/TourIndia)";
const FREE = /^(cc0|cc[ -]by([ -]sa)?([ -]\d(\.\d)?)?|public domain|pd\b|pd-)/i;

const picks = [
  { file: "File:Ganga aarti at Varanasi.webm", slug: "ganga-aarti", title: "Ganga aarti at Varanasi", href: "/destinations/varanasi" },
  { file: "File:Panorama from Basgo monastery, Ladakh, 2.webm", slug: "basgo-ladakh", title: "View from Basgo monastery, Ladakh", href: "/destinations/leh" },
  { file: "File:Children playing colors during Holi in a Bengaluru street.webm", slug: "holi-bengaluru", title: "Children playing Holi in Bengaluru", href: "/culture/festivals/holi" },
  { file: "File:Durga Puja in Kolkata 2017 Video Time Lapse 01.webm", slug: "durga-puja-kolkata", title: "Durga Puja crowds in Kolkata", href: "/culture/festivals/durga-puja" },
  { file: "File:Nohkalikai Cliffs.webm", slug: "nohkalikai", title: "The cliffs at Nohkalikai, Meghalaya", href: "/destinations/shillong-sohra" },
];

interface Derivative { src: string; type: string; width: number; height: number; transcodekey?: string }
interface Info {
  url: string; thumburl?: string; descriptionurl: string; duration?: number;
  derivatives?: Derivative[];
  extmetadata?: Record<string, { value?: string }>;
}

const stripHtml = (value = "") => value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

async function get(url: string | URL) {
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(180_000) });
    if (response.ok) return response;
    if (attempt >= 3) throw new Error(`${response.status} for ${url}`);
    await new Promise((resolve) => setTimeout(resolve, 4000 * (attempt + 1)));
  }
}

const output = [];
const directory = join(root, "public/videos");
mkdirSync(directory, { recursive: true });

for (const pick of picks) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  for (const [key, value] of Object.entries({ action: "query", format: "json", formatversion: "2", titles: pick.file, prop: "videoinfo", viprop: "url|size|derivatives|extmetadata", viurlwidth: "960" })) api.searchParams.set(key, value);
  const data = (await (await get(api)).json()) as { query: { pages: { videoinfo?: Info[] }[] } };
  const info = data.query.pages[0]?.videoinfo?.[0];
  if (!info) { console.log(`missing: ${pick.file}`); continue; }
  const license = stripHtml(info.extmetadata?.LicenseShortName?.value);
  if (!FREE.test(license)) { console.log(`licence rejected: ${pick.file} (${license})`); continue; }

  const web = (info.derivatives ?? []).filter((item) => item.type.startsWith("video/webm"));
  const chosen = web.find((item) => item.height === 480 || item.width === 854) ?? web.find((item) => item.height === 360) ?? { src: info.url, type: "video/webm", width: 960, height: 540 };
  const video = Buffer.from(await (await get(chosen.src)).arrayBuffer());
  writeFileSync(join(directory, `${pick.slug}.webm`), video);

  let poster: string | undefined;
  if (info.thumburl) {
    const frame = Buffer.from(await (await get(info.thumburl)).arrayBuffer());
    writeFileSync(join(directory, `${pick.slug}.webp`), await sharp(frame).webp({ quality: 72 }).toBuffer());
    poster = `/videos/${pick.slug}.webp`;
  }

  output.push({
    slug: pick.slug,
    title: pick.title,
    href: pick.href,
    src: `/videos/${pick.slug}.webm`,
    poster,
    duration: Math.round(info.duration ?? 0),
    author: stripHtml(info.extmetadata?.Artist?.value).slice(0, 160) || "Unknown author",
    license,
    sourceUrl: info.descriptionurl,
  });
  console.log(`ok ${pick.slug}: ${(video.length / 1048576).toFixed(1)} MB, ${chosen.height}p, ${license}`);
}

writeFileSync(join(root, "src/data/generated/videos.json"), `${JSON.stringify(output, null, 1)}\n`);
console.log(`Saved ${output.length} videos.`);
