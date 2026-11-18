/**
 * Builds the home slider from 8K originals on Wikimedia Commons.
 *
 * Each slide is a named file at least 7680 px wide under a free licence. The
 * original is downloaded once, then stored as a 3840 px WebP (the site sends
 * each screen a smaller size from it). Author and licence go to images.json
 * for the Credits page.
 *
 * Usage: node scripts/fetch-hero.mts [--only=key,key]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "src/data/generated/images.json");
const USER_AGENT = "TourIndiaBuild/2.0 (https://github.com/Supriyo016/TourIndia)";
const FREE = /^(CC BY(-SA)? [0-9.]+|CC0|Public domain)/i;

/** [key, Commons file, alt text] */
export const slides: [string, string, string][] = [
  ["taj-mahal", "Taj Mahal - South Facade - Agra 2014-05-14 3762-3764 Compress.JPG", "The south face of the Taj Mahal at Agra"],
  ["kerala", "Kumarakom backwaters panorama.jpg", "Palm-lined backwaters at Kumarakom in Kerala"],
  ["rajasthan", "Jaisalmer fort city.jpg", "Jaisalmer Fort above the golden city"],
  ["varanasi", "Dashashwamedh Ghat (21753416031).jpg", "Dashashwamedh Ghat on the Ganga at Varanasi"],
  ["northeast", "Nature and Agriculture in Mawphlang Kukon Meghalaya India.jpg", "Green hills and fields at Mawphlang in Meghalaya"],
  ["goa", "Coco Beach Goa 25012016.jpg", "Coco Beach on the coast of Goa"],
  ["ladakh", "The Pangong Tso lake.jpg", "Pangong Tso lake in Ladakh"],
  ["hampi", "Virupaksha Temple as seen from the Hemakuta hill 001.jpg", "The Virupaksha Temple at Hampi, seen from Hemakuta Hill"],
  ["udaipur", "Udaipur-Lac Pichola-Jag Niwas-20131013.jpg", "Lake Pichola and the Lake Palace at Udaipur"],
  ["amritsar", "Golden Temple (Harmandir Sahib) at night, Amritsar, Punjab, India (2017) 5.jpg", "The Golden Temple at Amritsar lit up at night"],
  ["konark", "Suryamandir at Konark, an unique example of artful stone carving.jpg", "The carved Sun Temple at Konark in Odisha"],
  ["munnar", "Panorama of Munnar Tea Gardens.jpg", "Tea gardens on the hills of Munnar"],
  // Heritage
  ["hawa-mahal", "Hawa Mahal in Jaipur in 2016 01.jpg", "The pink sandstone face of the Hawa Mahal over a Jaipur street"],
  ["mysore-palace", "Glorious Illumination.jpg", "Mysore Palace lit by thousands of bulbs at night"],
  ["khajuraho", "Vishwanath N-MP-23.jpg", "The carved Vishvanatha Temple at Khajuraho"],
  ["meenakshi", "Meenakshi Amman West Tower.jpg", "Painted gopurams of the Meenakshi Amman Temple at Madurai"],
  ["airavatesvara", "Main building of Airavatesvara Temple.jpg", "The Chola-era Airavatesvara Temple at Darasuram under a blue sky"],
  ["victoria-memorial", "Victoria Memorial situated in Kolkata.jpg", "The white marble Victoria Memorial in Kolkata"],
  ["red-fort", "Red Fort - Delhi 2014-05-13 3143-3147 Compress.JPG", "The red sandstone walls and Lahori Gate of the Red Fort in Delhi"],
  ["shore-temple", "Shore temple-Mahabalipuram-Kancheepuram District-Tamil Nadu.jpg", "The Shore Temple at Mahabalipuram by the sea"],
  // Festivals and traditions
  ["durga-idol", "Durga Family - Durga Puja Pandal - Singhi Park - Dover Lane - Kolkata 2015-10-21 6208-6210.tif", "Goddess Durga and her family inside a Kolkata Durga Puja pandal"],
  ["durga-pandal", "Durga Puja Pandal - Ballygunge Sarbojanin Durgotsab - Deshapriya Park - Kolkata 2014-10-02 9096-9099.TIF", "A lit Durga Puja pandal at dusk in Kolkata"],
  ["holi-vrindavan", "Vrindavan holi 02.jpg", "Flower petals and colour over a Holi crowd in Vrindavan"],
  ["holi-barsana", "Festival of colors 04.jpg", "Women in red at the Lathmar Holi celebrations near Mathura"],
  ["kathakali", "Kathakali artists in costume 2023.jpg", "Kathakali artists in full costume and make-up in Kerala"],
  ["khajuraho-dance", "Khajuraho Dance Festival.jpg", "Classical dancers on stage before the temples at the Khajuraho Dance Festival"],
  // Food
  ["kerala-thali", "Kerala thali.jpg", "A Kerala thali of rice and curries on a steel plate"],
  ["tamil-thali", "Vegetarian Thali (Saapadu) from Tamil Nadu.jpg", "A Tamil Nadu vegetarian saapadu served on a banana leaf"],
  ["masala-dosa", "Ghee Masala Dosa.jpg", "A crisp ghee masala dosa with chutney and sambar"],
  ["malpua", "A street vendor preparing Malpua Sweet in Kolkata, India.jpg", "A street cook frying malpua in Kolkata"],
];

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function info(file: string) {
  // Commons throttles bursts, so pause between files and retry when it says so.
  for (let attempt = 0; attempt < 6; attempt++) {
    await wait(3000);
    try {
      return await lookup(file);
    } catch (error) {
      if (!String(error).includes("throttled")) throw error;
      await wait(15000 * (attempt + 1));
    }
  }
  throw new Error(`Commons kept refusing ${file}`);
}

async function lookup(file: string) {
  const params = new URLSearchParams({
    action: "query", format: "json", titles: `File:${file}`, prop: "imageinfo",
    iiprop: "url|size|extmetadata", iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { "User-Agent": USER_AGENT } });
  const text = await response.text();
  if (!text.startsWith("{")) throw new Error("throttled");
  const page = Object.values(JSON.parse(text).query.pages)[0] as { imageinfo?: { url: string; width: number; extmetadata: Record<string, { value: string }> }[] };
  const image = page.imageinfo?.[0];
  if (!image) throw new Error(`Not found: ${file}`);
  return image;
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
const directory = join(root, "public/images/hero");
mkdirSync(directory, { recursive: true });

const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice(7).split(",");

for (const [key, file, alt] of slides) {
  if (only && !only.includes(key)) continue;
  const image = await info(file);
  const meta = (name: string) => image.extmetadata[name]?.value ?? "";
  const license = stripHtml(meta("LicenseShortName"));
  if (!FREE.test(license)) throw new Error(`${file} has licence "${license}"`);
  if (image.width < 7680) throw new Error(`${file} is only ${image.width} px wide`);

  const response = await fetch(image.url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`Download failed for ${file}: ${response.status}`);
  const input = Buffer.from(await response.arrayBuffer());
  const output = await sharp(input, { limitInputPixels: false, failOn: "none" }).rotate().resize({ width: 3840, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer({ resolveWithObject: true });
  writeFileSync(join(directory, `${key}.webp`), output.data);
  const blur = await sharp(output.data).resize(16).webp({ quality: 40 }).toBuffer();

  manifest[`hero:${key}`] = {
    src: `/images/hero/${key}.webp`,
    width: output.info.width,
    height: output.info.height,
    sourceWidth: image.width,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
    alt,
    author: stripHtml(meta("Artist")).slice(0, 160) || "Unknown author",
    license,
    licenseUrl: meta("LicenseUrl") || undefined,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`,
  };
  // Saved after every photo, so a later failure never loses the credits of finished ones.
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}
`);
  console.log(`${key}: ${image.width} px original, ${(output.data.length / 1024).toFixed(0)} KB stored`);
  await new Promise((resolve) => setTimeout(resolve, 800));
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
