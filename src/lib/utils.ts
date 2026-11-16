import clsx, { type ClassValue } from "clsx";
import type { LatLng } from "@/types/content";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const formatINR = (value: number) => inr.format(Math.round(value));

export const formatINRRange = ([low, high]: readonly [number, number]) => `${formatINR(low)} to ${formatINR(high)}`;

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Great-circle distance in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Matches the geoMercator projection used to generate the India map. */
export function projectToMap(point: LatLng, map: { scale: number; translate: readonly number[] }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x = map.scale * toRad(point.lng) + (map.translate[0] ?? 0);
  const y = -map.scale * Math.log(Math.tan(Math.PI / 4 + toRad(point.lat) / 2)) + (map.translate[1] ?? 0);
  return { x, y };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
