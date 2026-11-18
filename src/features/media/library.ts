import "server-only";
import { revalidatePath } from "next/cache";
import { destinations, getDestination, getState, states } from "@/data";
import { artForms } from "@/data/arts";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { stories } from "@/data/stories";
import type { UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";
import { allImages, getImage, type ImageKey } from "@/lib/images";
import { audit } from "@/lib/security/audit";
import { IMAGE_FIELD } from "@/features/content/cms";
import type { Target } from "@/features/community/targets";

/**
 * The media manager: the site's licensed images (no uploads, by the owner's decision), where each
 * is used, pages missing an image, and which image a guide page uses. A page's image choice is a
 * content field (`image` in content_overrides), read by the encyclopedia and guide pages.
 */

export class MediaError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export const MEDIA_KINDS = ["hero", "destination", "gallery", "state", "festival", "food", "unesco", "story", "art", "ref"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const KIND_LABELS: Record<MediaKind, string> = {
  hero: "Home and section headers",
  destination: "Place guides",
  gallery: "Gallery",
  state: "States",
  festival: "Festivals",
  food: "Food",
  unesco: "Heritage sites",
  story: "Stories",
  art: "Arts",
  ref: "Encyclopedia references",
};

export interface Usage {
  label: string;
  href: string;
}

const title = (kind: string, slug: string): string => {
  switch (kind) {
    case "destination":
    case "gallery":
      return getDestination(slug.replace(/-\d+$/, ""))?.name ?? slug;
    case "state":
      return getState(slug)?.name ?? slug;
    case "festival":
      return festivals.find((item) => item.slug === slug)?.name ?? slug;
    case "food":
      return foods.find((item) => item.slug === slug)?.name ?? slug;
    case "story":
      return stories.find((item) => item.slug === slug)?.title ?? slug;
    default:
      return slug;
  }
};

/** Where an image appears, from the site's naming conventions plus any page that chose it. */
export function usageOf(key: string, chosenBy: Target[] = []): Usage[] {
  const [kind = "", slug = ""] = key.split(":");
  const name = title(kind, slug);
  const uses: Usage[] = [];
  switch (kind) {
    case "destination":
      uses.push({ label: `${name} guide (header)`, href: `/destinations/${slug}` }, { label: `${name} encyclopedia`, href: `/encyclopedia/${slug}` }, { label: "Place cards and Yatri answers", href: "/discover" });
      break;
    case "gallery":
      uses.push({ label: "Gallery", href: "/gallery" }, { label: "Home page gallery", href: "/" });
      break;
    case "state":
      uses.push({ label: `${name} on the map`, href: `/explore/${slug}` }, { label: `${name} encyclopedia`, href: `/encyclopedia/states/${slug}` });
      break;
    case "festival":
      uses.push({ label: `${name} (festival page)`, href: `/culture/festivals/${slug}` });
      break;
    case "food":
      uses.push({ label: `${name} (dish page)`, href: `/culture/food/${slug}` });
      break;
    case "story":
      uses.push({ label: `${name} (story)`, href: `/stories/${slug}` });
      break;
    case "unesco":
      uses.push({ label: "Heritage explorer", href: "/culture/heritage" });
      break;
    case "art":
      uses.push({ label: "Arts pages", href: "/culture/arts" });
      break;
    case "ref": {
      const stem = slug.replace(/-\d+$/, "");
      const state = stem.startsWith("state-") ? stem.slice(6) : null;
      uses.push(state ? { label: `${getState(state)?.name ?? state} encyclopedia (references)`, href: `/encyclopedia/states/${state}` } : { label: `${title("destination", stem)} encyclopedia (references)`, href: `/encyclopedia/${stem}` });
      break;
    }
    case "hero":
      uses.push({ label: "Page headers and the home slider", href: "/" });
      break;
  }
  for (const target of chosenBy) {
    const page = target.type === "place" ? getDestination(target.id)?.name : getState(target.id)?.name;
    uses.push({ label: `Chosen for ${page ?? target.id}`, href: target.type === "place" ? `/destinations/${target.id}` : `/encyclopedia/states/${target.id}` });
  }
  return uses;
}

/** Image choices made in the media manager, keyed by image. */
export async function imageChoices(): Promise<Map<string, Target[]>> {
  const db = await getStore().catch(() => null);
  const choices = new Map<string, Target[]>();
  if (!db) return choices;
  const rows = await db.collection<Doc & { target: string; value: string }>(STORE_COLLECTIONS.overrides).find({ field: IMAGE_FIELD }, { limit: 1000 }).toArray();
  for (const row of rows) {
    const [type, id] = row.target.split(":");
    if (type !== "place" && type !== "state") continue;
    choices.set(row.value, [...(choices.get(row.value) ?? []), { type, id: id! }]);
  }
  return choices;
}

export async function library(options: { kind?: MediaKind; q?: string; page?: number; size?: number }) {
  const choices = await imageChoices();
  const q = (options.q ?? "").trim().toLowerCase();
  const size = options.size ?? 48;
  const rows = allImages().filter(
    (image) => (!options.kind || image.key.startsWith(`${options.kind}:`)) && (!q || image.key.includes(q) || image.alt.toLowerCase().includes(q) || (image.author ?? "").toLowerCase().includes(q)),
  );
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const page = Math.min(Math.max(1, options.page ?? 1), pages);
  return {
    total: rows.length,
    page,
    pages,
    rows: rows.slice((page - 1) * size, page * size).map((image) => ({ ...image, usage: usageOf(image.key, choices.get(image.key)) })),
  };
}

export interface Gap {
  kind: "missing-image" | "missing-alt" | "missing-credit";
  label: string;
  href: string;
  detail: string;
}

/** Pages with no image of their own (they show a fallback), and images without alt text or a credit. */
export function gaps(): Gap[] {
  const found: Gap[] = [];
  const check = (key: ImageKey, label: string, href: string) => {
    if (!getImage(key)) found.push({ kind: "missing-image", label, href, detail: `No image at ${key}; the page shows its fallback.` });
  };
  for (const item of destinations) check(`destination:${item.slug}`, item.name, `/destinations/${item.slug}`);
  for (const item of states) check(`state:${item.slug}`, item.name, `/explore/${item.slug}`);
  for (const item of festivals) check(`festival:${item.slug}`, item.name, `/culture/festivals/${item.slug}`);
  for (const item of foods) check(`food:${item.slug}`, item.name, `/culture/food/${item.slug}`);
  for (const item of stories) check(`story:${item.slug}`, item.title, `/stories/${item.slug}`);
  for (const item of artForms) if (!allImages().some((image) => image.key.startsWith(`art:${item.slug}`))) found.push({ kind: "missing-image", label: item.name, href: `/culture/arts/${item.slug}`, detail: "No image for this art form." });
  for (const image of allImages()) {
    if (!image.alt?.trim()) found.push({ kind: "missing-alt", label: image.key, href: "/admin/media?q=" + encodeURIComponent(image.key), detail: "No alt text." });
    if (!image.author?.trim() || !image.license?.trim()) found.push({ kind: "missing-credit", label: image.key, href: "/admin/media?q=" + encodeURIComponent(image.key), detail: "No author or licence recorded." });
  }
  return found;
}

/** Images that suit a page: its own, its gallery and reference shots, and its state's. */
export function candidatesFor(target: Target): ImageKey[] {
  const keys = allImages().map((image) => image.key as ImageKey);
  if (target.type === "place") {
    const place = getDestination(target.id);
    return keys.filter((key) => key === `destination:${target.id}` || key.startsWith(`gallery:${target.id}-`) || key.startsWith(`ref:${target.id}-`) || (place && key === `state:${place.stateSlug}`));
  }
  return keys.filter((key) => key === `state:${target.id}` || key.startsWith(`ref:state-${target.id}-`));
}

export const defaultImage = (target: Target): ImageKey => (target.type === "place" ? `destination:${target.id}` : `state:${target.id}`);

/** Sets (or clears, with null) the image a page uses. Audited with before and after; refreshes the pages. */
export async function setPageImage(admin: UserDoc, target: Target, key: string | null) {
  if (target.type === "place" ? !getDestination(target.id) : target.type === "state" ? !getState(target.id) : true) throw new MediaError("That page doesn't exist.", 404);
  if (key !== null && !getImage(key as ImageKey)) throw new MediaError("That image isn't in the library.", 422);
  const db = await getStore();
  if (!db) throw new MediaError("The media manager isn't available right now.", 503);
  const overrides = db.collection<Doc & { value?: string }>(STORE_COLLECTIONS.overrides);
  const id = `${target.type}:${target.id}:${IMAGE_FIELD}`;
  const before = (await overrides.findOne({ _id: id }))?.value ?? null;
  if (key === null || key === defaultImage(target)) await overrides.deleteOne({ _id: id });
  else await overrides.updateOne({ _id: id }, { $set: { target: `${target.type}:${target.id}`, field: IMAGE_FIELD, value: key, approvedBy: admin._id, approvedAt: new Date() } }, { upsert: true });
  const after = key === defaultImage(target) ? null : key;
  await audit({ actorId: admin._id, actorEmail: admin.email, action: "media.assign", target: `${target.type}:${target.id}`, before, after, outcome: "ok" }, db);
  for (const path of target.type === "place" ? [`/destinations/${target.id}`, `/encyclopedia/${target.id}`] : [`/encyclopedia/states/${target.id}`]) {
    try {
      revalidatePath(path);
    } catch {
      // Outside a request there is no page cache to clear.
    }
  }
  return { before, after };
}
