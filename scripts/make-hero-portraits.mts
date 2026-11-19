/**
 * Portrait crops of the home slider photos, for phones held upright. A wide photo shown with
 * object-fit: cover on a tall screen keeps only a narrow strip and has to be stretched, so phones get
 * a pre-cut 3:5 crop instead, centred on each photo's subject (FOCUS, chosen by eye; 0 is the left edge).
 *
 * Run: node scripts/make-hero-portraits.mts
 */
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const SOURCE = "public/images/hero";
const OUT = join(SOURCE, "portrait");
const RATIO = 3 / 5;
const MAX_HEIGHT = 2000;
const FOCUS: Record<string, number> = {
  amritsar: 0.25, hampi: 0.85, "hawa-mahal": 0.36, "holi-barsana": 0.4, kashmir: 0.65, "kerala-thali": 0.45,
  kerala: 0.45, "khajuraho-dance": 0.55, khajuraho: 0.35, konark: 0.45, malpua: 0.4, "masala-dosa": 0.45,
  meenakshi: 0.82, munnar: 0.55, rajasthan: 0.4, "red-fort": 0.55, "shore-temple": 0.48, "taj-mahal": 0.52,
  "tamil-thali": 0.48, udaipur: 0.38, varanasi: 0.6,
};

mkdirSync(OUT, { recursive: true });
const manifest: Record<string, { src: string; width: number; height: number }> = {};

for (const file of readdirSync(SOURCE).filter((name) => name.endsWith(".webp")).sort()) {
  const input = join(SOURCE, file);
  const { width = 0, height = 0 } = await sharp(input).metadata();
  const outHeight = Math.min(height, MAX_HEIGHT);
  const outWidth = Math.round(outHeight * RATIO);
  if (width < outWidth) continue;
  const cropWidth = Math.round(height * RATIO);
  const focus = FOCUS[file.replace(".webp", "")] ?? 0.5;
  const left = Math.min(width - cropWidth, Math.max(0, Math.round(focus * width - cropWidth / 2)));
  await sharp(input)
    .extract({ left, top: 0, width: cropWidth, height })
    .resize({ width: outWidth, height: outHeight })
    .webp({ quality: 80 })
    .toFile(join(OUT, file));
  manifest[`/images/hero/${file}`] = { src: `/images/hero/portrait/${file}`, width: outWidth, height: outHeight };
  console.log(file, `${width}x${height} -> ${outWidth}x${outHeight}`);
}

writeFileSync("src/data/generated/hero-portraits.json", `${JSON.stringify(manifest, null, 2)}\n`);
