/**
 * Converts the state-boundary TopoJSON into pre-projected SVG paths, so the
 * map renders on the server with no map library in the browser. Boundaries
 * come from the source dataset unchanged apart from topology-preserving
 * simplification. No shape is drawn by hand.
 *
 * Usage: node scripts/build-india-map.mjs <path-to-india-topojson>
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { geoMercator, geoPath, geoArea } from "d3-geo";
import { feature } from "topojson-client";
import { presimplify, quantile, simplify } from "topojson-simplify";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = process.argv[2];
if (!input) throw new Error("Pass the path to the India TopoJSON file.");

const WIDTH = 800;
const HEIGHT = 900;

const raw = JSON.parse(readFileSync(input, "utf8"));
const objectName = raw.objects.states ? "states" : Object.keys(raw.objects)[0];
const prepared = presimplify({ ...raw, objects: { states: raw.objects[objectName] } });
const simplified = simplify(prepared, quantile(prepared, 0.12));
const collection = feature(simplified, simplified.objects.states);

const nameOf = (properties) => properties.st_nm ?? properties.ST_NM ?? properties.name ?? properties.NAME_1;

const projection = geoMercator().fitExtent([[6, 6], [WIDTH - 6, HEIGHT - 6]], collection);
const path = geoPath(projection).digits(1);
const slugify = (value) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const states = collection.features.map((item) => {
  const name = nameOf(item.properties);
  const [cx, cy] = path.centroid(item);
  const [[x0, y0], [x1, y1]] = path.bounds(item);
  return {
    slug: slugify(name),
    name,
    d: path(item),
    cx: Math.round(cx * 10) / 10,
    cy: Math.round(cy * 10) / 10,
    // Very small territories get an extra marker so they can be seen and clicked.
    small: Math.max(x1 - x0, y1 - y0) < 16 || geoArea(item) < 0.00012,
  };
});

if (states.length !== 36) throw new Error(`Expected 36 states and UTs, found ${states.length}`);

const output = {
  width: WIDTH,
  height: HEIGHT,
  // geoMercator parameters, so coordinates can be placed without d3 on the client.
  scale: projection.scale(),
  translate: projection.translate(),
  states: states.sort((a, b) => a.name.localeCompare(b.name)),
};

const target = join(root, "src/data/generated/india-map.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(output));
console.log(`Wrote ${states.length} regions, ${(Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(0)} KB`);
console.log(`Small markers: ${states.filter((state) => state.small).map((state) => state.name).join(", ")}`);
