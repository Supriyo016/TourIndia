/**
 * Downloads a hand-picked set of openly licensed travel videos from Wikimedia
 * Commons, at a web-friendly resolution, with their licence details.
 * Usage: node scripts/fetch-videos.mts
 *
 * With --art it instead finds one performance or craft video with a sound track
 * for each art form (src/data/arts.ts), keeps only free licences, downloads the
 * Commons 480p (or 360p) WebM transcode when it is small enough, saves any
 * Commons subtitles as WebVTT, and writes src/data/generated/art-videos.json.
 * Commons does the transcoding, so ffmpeg is not needed. Finished slugs are
 * kept; delete an entry to fetch it again. Add --only=slug to limit the run.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

/** The hand-picked travel clips shown on the home page. */
async function fetchTravelVideos() {
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
}

/** Commons search terms and the words a file's title or description must contain, per art form. */
const ART_VIDEO_SEARCH: Record<string, [string, RegExp]> = {
  bharatanatyam: ["Bharatanatyam", /bharata ?natyam|bharathanatyam/i],
  kathak: ["Kathak", /kathak(?!ali)/i],
  kathakali: ["Kathakali", /kathakali/i],
  kuchipudi: ["Kuchipudi", /kuchipudi/i],
  "manipuri-dance": ["Manipuri dance", /manipuri|raslila|ras lila|pung cholom/i],
  mohiniyattam: ["Mohiniyattam", /mohiniyattam|mohiniattam/i],
  odissi: ["Odissi", /odissi/i],
  sattriya: ["Sattriya", /sattriya|satriya/i],
  bhangra: ["Bhangra", /bhangra/i],
  garba: ["Garba Navratri OR Garba dance OR Dandiya", /garba|dandiya/i],
  ghoomar: ["Ghoomar", /ghoomar|ghumar/i],
  lavani: ["Lavani", /lavani/i],
  "bihu-dance": ["Bihu dance", /bihu/i],
  chhau: ["Chhau", /chhau|chau dance/i],
  kalbelia: ["Kalbelia", /kalbelia|kalbeliya/i],
  cheraw: ["Cheraw", /cheraw|bamboo dance/i],
  karakattam: ["Karakattam", /karagattam|karakattam|karagam/i],
  "dollu-kunitha": ["Dollu Kunitha", /dollu/i],
  "hindustani-music": ["sitar OR sarod OR raag OR Hindustani OR tabla", /hindustani|raga|raag|sitar|sarod|khayal|dhrupad/i],
  "carnatic-music": ["Carnatic OR Karnatic OR mridangam OR veena", /carnatic|karnatic/i],
  baul: ["Baul", /\bbaul/i],
  qawwali: ["Qawwali", /qawwali|qawali/i],
  "gurbani-kirtan": ["Gurbani kirtan", /kirtan|gurbani/i],
  manganiyar: ["Manganiyar", /manganiyar|langa|kamaicha/i],
  pashmina: ["Pashmina", /pashmina/i],
  "banarasi-silk": ["Banarasi weaving", /banaras|varanasi/i],
  "blue-pottery": ["blue pottery Jaipur", /blue pottery/i],
  bidriware: ["Bidri", /bidri/i],
  "channapatna-toys": ["Channapatna", /channapatna/i],
  dhokra: ["Dhokra", /dhokra|dokra/i],
  ajrakh: ["Ajrakh", /ajrakh/i],
  "sanganer-block-printing": ["block printing Rajasthan", /block print/i],
  zardozi: ["Zardozi", /zardozi|zari/i],
  "bankura-terracotta": ["Bankura terracotta", /bankura|terracotta/i],
  "northeast-cane-bamboo": ["bamboo craft Tripura Assam", /bamboo|cane/i],
  "kutch-embroidery": ["Kutch embroidery", /embroider/i],
  sari: ["saree weaving handloom", /sari|saree|handloom/i],
  "salwar-kameez": ["salwar kameez", /salwar|kameez/i],
  "dhoti-mundu": ["mundu", /mundu|dhoti/i],
  turban: ["turban tying", /turban|pagri|pagdi|dastar/i],
  pheran: ["pheran", /pheran/i],
  "mekhela-chador": ["mekhela chador", /mekhela/i],
  "chaniya-choli": ["chaniya choli", /chaniya|ghagra/i],
  "naga-shawls": ["Naga weaving", /naga/i],
  madhubani: ["Madhubani painting", /madhubani|mithila/i],
  warli: ["Warli painting", /warli/i],
  pattachitra: ["Pattachitra", /pattachitra|patachitra|patua/i],
  kalamkari: ["Kalamkari", /kalamkari/i],
  "pahari-painting": ["Pahari painting", /pahari|kangra painting/i],
  "rajput-painting": ["Rajput miniature painting", /miniature painting|rajput painting/i],
  "thanjavur-painting": ["Thanjavur painting", /thanjavur painting|tanjore painting/i],
  "gond-art": ["Gond painting", /gond/i],
  "hindi-devanagari": ["Hindi pronunciation", /hindi/i],
  bengali: ["Bengali language", /bengali|bangla/i],
  tamil: ["Tamil language", /tamil/i],
  urdu: ["Urdu", /urdu/i],
  "punjabi-gurmukhi": ["Punjabi Gurmukhi", /punjabi|gurmukhi/i],
  malayalam: ["Malayalam language", /malayalam/i],
  namaste: ["Namaste greeting", /namaste|namaskar/i],
  "shoes-off": ["shoes outside temple", /shoe|footwear/i],
  "right-hand": ["eating with hand India", /eating with (the )?hand/i],
  "kerala-temple-dress": ["Kerala temple festival", /kerala temple/i],
  langar: ["Langar", /langar/i],
  "buddhist-circumambulation": ["prayer wheel monastery", /prayer wheel|kora|circumambulat/i],
};

interface ArtVideo {
  src: string;
  height: number;
  bytes: number;
  duration: number;
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
  captions: { lang: string; label: string; src: string }[];
}

type SearchInfo = Info & { metadata?: { name: string; value: unknown }[] };
interface SearchPage { title: string; videoinfo?: SearchInfo[] }

const MAX_BYTES = 6.5 * 1024 * 1024;
/** Compilations, lessons, news and reviews that match a keyword but are not footage of the tradition. */
const OFF_TOPIC = /lyric|greatest hits|best of|best songs|collection|jukebox|album|top \d|wikipedia|wikimania|lesson|tutorial|bbc|voa|unboxing|review|prueba|movie|\b(19[0-6]\d)\b|deep ?seek|explosion|coronavirus|interview|for sale/i;
/** Language and custom entries need footage of song, poetry or the custom itself, not just speech. */
const PERFORMANCE = /song|poem|poetry|recit|sing|kavi|music|dance|festival|greet|langar|prayer|kirtan|ritual|temple/i;
/** Files a reviewer turned down after a run, with the reason. */
const REJECTED = new Set([
  "File:Zupiria mundu berriko aukerak eu.webm", // Basque: "mundu" means world
  "File:Deep seek-mobile-basic by Tamil language-2025 March10.webm", // software tutorial
  "File:Beirut Explosion Moment of blast captured in a BBC interview - BBC URDU.webm", // news footage
  "File:Giveaway Unboxing Mini HD action camera.webm", // product video
  "File:Wikimania 2017 - Jayanta Nath speaks about his experience contributing to Bengali Wikipedia (Bengali version).webm", // conference talk
  "File:Khajuraho Dance Festival 2025 01.webm", // mixed festival clip, Manipuri not identifiable
  "File:Aishat Garba - une volontaire des Jeux heureuse.webm", // a person named Garba
  "File:Roland SPD-S for sale..webm", // sales video
  "File:RSS Prarthna Namaste Sada Vatsale Matribhume Prayer.webm", // an organisation's prayer, not the greeting
  "File:Greetings from the President- Hola, Alo, Namaste!.webm", // a foreign head of state's greeting, not the custom in India
]);
const LANGUAGE_NAMES: Record<string, string> = { en: "English", hi: "Hindi", bn: "Bengali", ta: "Tamil", ml: "Malayalam", ur: "Urdu", pa: "Punjabi", as: "Assamese", or: "Odia", kn: "Kannada", te: "Telugu", mr: "Marathi", gu: "Gujarati" };

/** True when Commons' file metadata lists an audio stream. */
function hasAudio(metadata: SearchInfo["metadata"]): boolean {
  const text = JSON.stringify(metadata ?? []);
  return /"name":"audio","value":\[\{/.test(text) || /"type":"(Vorbis|Opus|Speex|FLAC)"/i.test(text);
}

async function commons(params: Record<string, string>) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  for (const [key, value] of Object.entries({ format: "json", formatversion: "2", ...params })) api.searchParams.set(key, value);
  const response = await get(api);
  await new Promise((resolve) => setTimeout(resolve, 300));
  return response.json();
}

async function fetchArtVideos() {
  const { artForms } = await import("../src/data/arts.ts");
  const manifestPath = join(root, "src/data/generated/art-videos.json");
  const manifest: Record<string, ArtVideo> = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
  const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice(7);
  const folder = join(root, "public/videos/art");
  mkdirSync(folder, { recursive: true });
  const used = new Set(Object.values(manifest).map((item) => item.sourceUrl));
  const save = () => writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 1)}\n`);
  const missing: string[] = [];

  for (const form of artForms) {
    if (manifest[form.slug] || (only && form.slug !== only)) continue;
    const [terms, pattern] = ART_VIDEO_SEARCH[form.slug] ?? [form.name, new RegExp(form.name, "i")];
    const data = (await commons({
      action: "query", generator: "search", gsrnamespace: "6", gsrlimit: "40", gsrsearch: `filetype:video ${terms}`,
      prop: "videoinfo", viprop: "url|size|mime|metadata|derivatives|extmetadata",
    })) as { query?: { pages?: SearchPage[] } };

    const pool = (data.query?.pages ?? []).flatMap((page) => {
      const info = page.videoinfo?.[0];
      if (!info) return [];
      const license = stripHtml(info.extmetadata?.LicenseShortName?.value);
      const description = stripHtml(info.extmetadata?.ImageDescription?.value);
      const duration = info.duration ?? 0;
      if (!FREE.test(license) || info.extmetadata?.NonFree?.value === "true") return [];
      if (!pattern.test(page.title) && !pattern.test(description)) return [];
      if (REJECTED.has(page.title) || OFF_TOPIC.test(page.title)) return [];
      if ((form.category === "language" || form.category === "custom") && !PERFORMANCE.test(`${page.title} ${description}`)) return [];
      if (!hasAudio(info.metadata) || duration < 8 || duration > 1200) return [];
      if (used.has(info.descriptionurl)) return [];
      // The derivative's codec list confirms the transcode kept the sound track.
      const webm = (info.derivatives ?? []).filter((item) => item.type.startsWith("video/webm") && /opus|vorbis/.test(item.type));
      // Commons rarely makes a 360p WebM, so 240p is the last resort for longer clips.
      const chosen = [480, 360, 240]
        .map((height) => webm.find((item) => item.height === height))
        .find((item) => item && (((item as Derivative & { bandwidth?: number }).bandwidth ?? 0) * duration) / 8 <= MAX_BYTES);
      if (!chosen) return [];
      // Title matches first, then clips of a watchable length.
      const score = (pattern.test(page.title) ? 0 : 100) + (duration >= 20 && duration <= 240 ? 0 : 10) + (chosen.height < 480 ? 5 : 0);
      return [{ page, info, license, duration, chosen, score }];
    }).sort((a, b) => a.score - b.score);

    let saved = false;
    for (const candidate of pool) {
      const video = Buffer.from(await (await get(candidate.chosen.src)).arrayBuffer());
      if (video.length > MAX_BYTES) continue;
      writeFileSync(join(folder, `${form.slug}.webm`), video);

      // Commons subtitles live in the TimedText namespace as "<file>.<lang>.srt".
      const fileName = candidate.page.title.replace(/^File:/, "");
      const tracks = (await commons({ action: "query", list: "allpages", apnamespace: "102", apprefix: fileName, aplimit: "20" })) as { query?: { allpages?: { title: string }[] } };
      const captions: ArtVideo["captions"] = [];
      for (const track of tracks.query?.allpages ?? []) {
        const lang = track.title.match(/\.([a-z-]{2,8})\.srt$/)?.[1];
        if (!lang) continue;
        const vtt = await (await get(`https://commons.wikimedia.org/w/api.php?action=timedtext&title=${encodeURIComponent(candidate.page.title)}&lang=${lang}&trackformat=vtt`)).text();
        if (!vtt.startsWith("WEBVTT")) continue;
        writeFileSync(join(folder, `${form.slug}.${lang}.vtt`), vtt);
        captions.push({ lang, label: LANGUAGE_NAMES[lang] ?? lang, src: `/videos/art/${form.slug}.${lang}.vtt` });
      }

      manifest[form.slug] = {
        src: `/videos/art/${form.slug}.webm`,
        height: candidate.chosen.height,
        bytes: video.length,
        duration: Math.round(candidate.duration),
        title: fileName.replace(/\.(webm|ogv|ogg)$/i, "").replace(/_/g, " "),
        author: stripHtml(candidate.info.extmetadata?.Artist?.value).slice(0, 160) || "Unknown author",
        license: candidate.license,
        licenseUrl: stripHtml(candidate.info.extmetadata?.LicenseUrl?.value) || undefined,
        sourceUrl: candidate.info.descriptionurl,
        captions,
      };
      used.add(candidate.info.descriptionurl);
      save();
      console.log(`ok   ${form.slug}: ${(video.length / 1048576).toFixed(1)} MB, ${candidate.chosen.height}p, ${candidate.license}, ${captions.length} caption tracks  <- ${candidate.page.title}`);
      saved = true;
      break;
    }
    if (!saved) missing.push(form.slug);
  }
  save();
  console.log(`\n${Object.keys(manifest).length} of ${artForms.length} art forms have a licensed video with sound.`);
  if (missing.length) console.log(`No licensed video with sound found for:\n  ${missing.join("\n  ")}`);
}

if (process.argv.includes("--art")) await fetchArtVideos();
else await fetchTravelVideos();
