import "server-only";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Doc, type Store } from "@/lib/database/store";
import { audit } from "@/lib/security/audit";
import { chosenImage, type ImageKey } from "@/lib/images";
import { contentFor, currentFieldValue } from "@/features/community/content";
import { EDITABLE_FIELDS, fieldToText, targetKey, textToField, type Target, type TargetType } from "@/features/community/targets";
import { canTransition, LIMITS, type ContentAction, type VersionStatus } from "./workflow";

/**
 * The CMS: a versioned layer over the guide data in the repo. The repo stays the baseline; a
 * version holds the full set of fields that differ from it on one page. Publishing a version writes
 * those fields to `content_overrides` (the path public pages already read), removes overrides for
 * fields it no longer changes, archives the version that was live, and refreshes the page.
 */

export type FieldValue = string | string[];

export interface VersionDoc extends Doc {
  target: string;
  number: number;
  status: VersionStatus;
  fields: Record<string, FieldValue>;
  note: string;
  source: "editor" | "community" | "restore";
  /** The version that was live when this one was started, so editors can see if it moved on. */
  basedOn: number | null;
  editId?: string;
  restoredFrom?: number;
  createdBy: string;
  createdByEmail: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  /** Set on an approved version that should go live later. */
  publishAt?: Date;
  publishedAt?: Date;
  publishedBy?: string;
  archivedAt?: Date;
  reviewNote?: string;
}

export interface ItemDoc extends Doc {
  target: string;
  type: TargetType;
  slug: string;
  title: string;
  path: string;
  nextNumber: number;
  publishedVersionId?: string | null;
  publishedNumber?: number | null;
  updatedAt: Date;
}

/** The image a page uses is a content field too, set from the media manager (not through the text workflow). */
export const IMAGE_FIELD = "image";

export class ContentError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export const CMS_TYPES = Object.keys(EDITABLE_FIELDS) as TargetType[];
export const textFieldsFor = (type: TargetType) => EDITABLE_FIELDS[type] ?? {};

async function store(): Promise<Store> {
  const db = await getStore();
  if (!db) throw new ContentError("The content system isn't available right now.", 503);
  return db;
}

export function requirePage(target: Target) {
  if (!CMS_TYPES.includes(target.type)) throw new ContentError("That kind of page can't be edited here.", 400);
  const page = contentFor(target);
  if (!page) throw new ContentError("That page doesn't exist.", 404);
  return page;
}

export const parseTargetKey = (key: string): Target | null => {
  const [type, id] = key.split(":");
  return type && id && CMS_TYPES.includes(type as TargetType) ? { type: type as TargetType, id } : null;
};

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a ?? "") === JSON.stringify(b ?? "");

/**
 * Turns the editor's text boxes into stored fields. Unknown fields are refused, lengths are
 * checked, and fields that match the guide's own text are dropped, so a version only holds changes.
 */
export function normaliseFields(target: Target, input: Record<string, string>): Record<string, FieldValue> {
  const defs = textFieldsFor(target.type);
  const fields: Record<string, FieldValue> = {};
  for (const [field, text] of Object.entries(input)) {
    if (!Object.hasOwn(defs, field)) throw new ContentError(`"${field}" can't be edited on this page.`, 422);
    const kind = defs[field]!.kind;
    if (text.length > LIMITS.textChars * (kind === "text" ? 1 : 6)) throw new ContentError(`${defs[field]!.label} is too long.`, 422);
    const value = textToField(text, kind);
    if (Array.isArray(value) && (value.length > LIMITS.items || value.some((item) => item.length > LIMITS.itemChars))) throw new ContentError(`${defs[field]!.label} has too many or too long items.`, 422);
    if (sameValue(value, currentFieldValue(target, field))) continue;
    fields[field] = value;
  }
  return fields;
}

const versions = (db: Store) => db.collection<VersionDoc>(STORE_COLLECTIONS.contentVersions);
const items = (db: Store) => db.collection<ItemDoc>(STORE_COLLECTIONS.contentItems);
const overrides = (db: Store) => db.collection<Doc & { target: string; field: string; value: unknown }>(STORE_COLLECTIONS.overrides);

/** The text fields live on a page right now (published versions and older community edits). */
async function liveTextFields(db: Store, key: string, type: TargetType): Promise<Record<string, FieldValue>> {
  const defs = textFieldsFor(type);
  const rows = await overrides(db).find({ target: key }).toArray();
  return Object.fromEntries(rows.filter((row) => Object.hasOwn(defs, row.field)).map((row) => [row.field, row.value as FieldValue]));
}

/**
 * What public pages merge over the guide. A scheduled version whose time has come counts as live
 * even before the publishing job has run, so a page rebuilt in between is already right.
 * Read-only: nothing is written while a page renders.
 */
export async function effectiveOverrides(target: Target, now = new Date()): Promise<Record<string, unknown>> {
  const db = await getStore().catch(() => null);
  if (!db) return {};
  const key = targetKey(target);
  const rows = await overrides(db).find({ target: key }).toArray();
  const live: Record<string, unknown> = Object.fromEntries(rows.map((row) => [row.field, row.value]));
  const [due] = await versions(db)
    .find({ target: key, status: "approved", publishAt: { $exists: true, $lte: now } }, { sort: { publishAt: -1 }, limit: 1 })
    .toArray()
    .catch(() => []);
  if (!due) return live;
  const defs = textFieldsFor(target.type);
  for (const field of Object.keys(live)) if (Object.hasOwn(defs, field)) delete live[field];
  return { ...live, ...due.fields };
}

/** The image a page uses: the media manager's choice if one is set and still exists, else the page's own. */
export async function pageImage(target: Target, fallback: ImageKey): Promise<ImageKey> {
  const db = await getStore().catch(() => null);
  if (!db) return fallback;
  const row = await overrides(db).findOne({ _id: `${targetKey(target)}:${IMAGE_FIELD}` }).catch(() => null);
  return chosenImage(row?.value, fallback);
}

async function ensureItem(db: Store, target: Target): Promise<ItemDoc> {
  const page = requirePage(target);
  const key = targetKey(target);
  const item = await items(db).findOneAndUpdate(
    { _id: key },
    { $setOnInsert: { target: key, type: target.type, slug: target.id, nextNumber: 1, publishedVersionId: null, publishedNumber: null }, $set: { title: page.title, path: page.path, updatedAt: new Date() } },
    { upsert: true, returnDocument: "after" },
  );
  return item!;
}

async function nextNumber(db: Store, key: string): Promise<number> {
  const item = await items(db).findOneAndUpdate({ _id: key }, { $inc: { nextNumber: 1 } }, { returnDocument: "before" });
  return item?.nextNumber ?? 1;
}

function refresh(path: string) {
  try {
    revalidatePath(path.split("#")[0]!);
  } catch {
    // Outside a request (tests and scripts) there is no page cache to clear.
  }
}

export interface Actor {
  user: UserDoc;
}

const log = (db: Store, actor: Actor, action: string, version: Pick<VersionDoc, "_id" | "target" | "number">, extra: { detail?: string; before?: unknown; after?: unknown } = {}) =>
  audit({ actorId: actor.user._id, actorEmail: actor.user.email, action: `content.${action}`, target: version._id, detail: `${version.target} v${version.number}${extra.detail ? ` ${extra.detail}` : ""}`, before: extra.before, after: extra.after, outcome: "ok" }, db);

/** Starts a draft. Without fields, it starts from what's live now. */
export async function createDraft(actor: Actor, target: Target, input: { fields?: Record<string, string>; note?: string }) {
  const db = await store();
  const item = await ensureItem(db, target);
  const open = await versions(db).countDocuments({ target: item._id, status: { $in: ["draft", "review", "approved"] } });
  if (open >= LIMITS.openVersions) throw new ContentError("This page already has 20 versions in progress. Publish or archive some first.", 429);
  const fields = input.fields ? normaliseFields(target, input.fields) : await liveTextFields(db, item._id, target.type);
  const now = new Date();
  const doc: VersionDoc = {
    _id: randomUUID(),
    target: item._id,
    number: await nextNumber(db, item._id),
    status: "draft",
    fields,
    note: (input.note ?? "").trim().slice(0, LIMITS.note),
    source: "editor",
    basedOn: item.publishedNumber ?? null,
    createdBy: actor.user._id,
    createdByEmail: actor.user.email,
    createdAt: now,
    updatedAt: now,
  };
  await versions(db).insertOne(doc);
  await log(db, actor, "create", doc, { after: { fields: Object.keys(fields) } });
  return doc;
}

async function load(db: Store, id: string): Promise<VersionDoc> {
  const version = await versions(db).findOne({ _id: id });
  if (!version) throw new ContentError("That version doesn't exist.", 404);
  return version;
}

/** Moves a version on only if nobody else moved it first. */
async function move(db: Store, version: VersionDoc, action: ContentAction, set: Partial<VersionDoc>, unset: (keyof VersionDoc)[] = []) {
  if (!canTransition(action, version.status)) throw new ContentError(`A version that is ${version.status} can't be changed that way.`, 409);
  const updated = await versions(db).findOneAndUpdate(
    { _id: version._id, status: version.status },
    { $set: { ...set, updatedAt: new Date() }, ...(unset.length ? { $unset: Object.fromEntries(unset.map((key) => [key, ""])) } : {}) },
    { returnDocument: "after" },
  );
  if (!updated) throw new ContentError("Someone else changed this version first. Reload to see it.", 409);
  return updated;
}

export async function saveDraft(actor: Actor, id: string, input: { fields: Record<string, string>; note?: string }) {
  const db = await store();
  const version = await load(db, id);
  const target = parseTargetKey(version.target)!;
  const fields = normaliseFields(target, input.fields);
  const updated = await move(db, version, "save", { fields, note: (input.note ?? version.note).trim().slice(0, LIMITS.note), updatedBy: actor.user._id });
  await log(db, actor, "save", updated, { before: { fields: Object.keys(version.fields) }, after: { fields: Object.keys(fields) } });
  return updated;
}

/** The simple workflow steps: submit, approve, send back, schedule, cancel a schedule. */
export async function transition(actor: Actor, id: string, action: "submit" | "approve" | "reject" | "schedule" | "unschedule", options: { note?: string; at?: Date } = {}) {
  const db = await store();
  const version = await load(db, id);
  let updated: VersionDoc;
  switch (action) {
    case "submit":
      updated = await move(db, version, action, { status: "review", submittedAt: new Date() });
      break;
    case "approve":
      updated = await move(db, version, action, { status: "approved", approvedBy: actor.user._id, approvedAt: new Date() });
      break;
    case "reject":
      updated = await move(db, version, action, { status: "draft", reviewNote: (options.note ?? "").trim().slice(0, LIMITS.note) }, ["publishAt", "approvedAt", "approvedBy"]);
      break;
    case "schedule": {
      const at = options.at;
      if (!at || Number.isNaN(at.getTime()) || at.getTime() < Date.now() + 60_000) throw new ContentError("Pick a time at least a minute from now.", 422);
      if (at.getTime() > Date.now() + 366 * 86_400_000) throw new ContentError("Schedules can be up to a year ahead.", 422);
      updated = await move(db, version, action, { publishAt: at });
      break;
    }
    case "unschedule":
      if (!version.publishAt) throw new ContentError("That version isn't scheduled.", 409);
      updated = await move(db, version, action, {}, ["publishAt"]);
      break;
  }
  await log(db, actor, action, updated, { detail: action === "schedule" ? `for ${updated.publishAt!.toISOString()}` : undefined, before: { status: version.status }, after: { status: updated.status } });
  return updated;
}

/** Writes a version's fields to the overrides public pages read, replacing the text fields that were live. */
async function applyToPage(db: Store, version: VersionDoc, approvedBy: string) {
  const target = parseTargetKey(version.target)!;
  const defs = textFieldsFor(target.type);
  const rows = await overrides(db).find({ target: version.target }).toArray();
  for (const row of rows) if (Object.hasOwn(defs, row.field) && !Object.hasOwn(version.fields, row.field)) await overrides(db).deleteOne({ _id: row._id });
  const now = new Date();
  for (const [field, value] of Object.entries(version.fields)) {
    await overrides(db).updateOne(
      { _id: `${version.target}:${field}` },
      { $set: { target: version.target, field, value, versionId: version._id, ...(version.editId ? { editId: version.editId } : {}), approvedBy, approvedAt: now } },
      { upsert: true },
    );
  }
}

async function goLive(db: Store, version: VersionDoc, by: string): Promise<VersionDoc> {
  const target = parseTargetKey(version.target)!;
  const page = requirePage(target);
  const now = new Date();
  const published = await versions(db).findOneAndUpdate(
    { _id: version._id, status: version.status },
    { $set: { status: "published", publishedAt: now, publishedBy: by, updatedAt: now }, $unset: { publishAt: "" } },
    { returnDocument: "after" },
  );
  if (!published) throw new ContentError("Someone else changed this version first. Reload to see it.", 409);
  const previous = await versions(db).find({ target: version.target, status: "published", _id: { $ne: version._id } }).toArray();
  for (const old of previous) await versions(db).updateOne({ _id: old._id, status: "published" }, { $set: { status: "archived", archivedAt: now, updatedAt: now } });
  await applyToPage(db, published, by);
  await items(db).updateOne({ _id: version.target }, { $set: { publishedVersionId: published._id, publishedNumber: published.number, title: page.title, path: page.path, updatedAt: now } });
  refresh(page.path);
  return published;
}

export async function publishNow(actor: Actor, id: string) {
  const db = await store();
  const version = await load(db, id);
  if (!canTransition("publish", version.status)) throw new ContentError("Only an approved version can be published.", 409);
  const published = await goLive(db, version, actor.user._id);
  await log(db, actor, "publish", published, { before: { status: version.status }, after: { status: "published" } });
  return published;
}

/** Publishes every scheduled version whose time has come. Run by the cron route and when admins open the CMS. */
export async function publishDue(now = new Date()): Promise<{ published: number }> {
  const db = await getStore();
  if (!db) return { published: 0 };
  const due = await versions(db).find({ status: "approved", publishAt: { $exists: true, $lte: now } }, { sort: { publishAt: 1 }, limit: 100 }).toArray();
  let published = 0;
  for (const version of due) {
    try {
      const live = await goLive(db, version, "schedule");
      published += 1;
      await audit({ action: "content.publish", target: live._id, detail: `${live.target} v${live.number} on schedule`, outcome: "ok" }, db);
    } catch (error) {
      if (!(error instanceof ContentError)) throw error;
    }
  }
  return { published };
}

export async function archive(actor: Actor, id: string) {
  const db = await store();
  const version = await load(db, id);
  const wasLive = version.status === "published";
  const updated = await move(db, version, "archive", { status: "archived", archivedAt: new Date() }, ["publishAt"]);
  if (wasLive) {
    // Unpublishing: the page goes back to the guide's own text (the image choice is kept).
    const target = parseTargetKey(version.target)!;
    const page = requirePage(target);
    await applyToPage(db, { ...updated, fields: {} }, actor.user._id);
    await items(db).updateOne({ _id: version.target }, { $set: { publishedVersionId: null, publishedNumber: null, updatedAt: new Date() } });
    refresh(page.path);
  }
  await log(db, actor, wasLive ? "unpublish" : "archive", updated, { before: { status: version.status }, after: { status: "archived" } });
  return updated;
}

/** Starts a new draft with an older version's fields. It goes through review like any other. */
export async function restore(actor: Actor, id: string) {
  const db = await store();
  const old = await load(db, id);
  const target = parseTargetKey(old.target)!;
  const item = await ensureItem(db, target);
  const open = await versions(db).countDocuments({ target: item._id, status: { $in: ["draft", "review", "approved"] } });
  if (open >= LIMITS.openVersions) throw new ContentError("This page already has 20 versions in progress. Publish or archive some first.", 429);
  const now = new Date();
  const doc: VersionDoc = {
    _id: randomUUID(),
    target: old.target,
    number: await nextNumber(db, old.target),
    status: "draft",
    fields: structuredClone(old.fields),
    note: `Restored from version ${old.number}`,
    source: "restore",
    restoredFrom: old.number,
    basedOn: item.publishedNumber ?? null,
    createdBy: actor.user._id,
    createdByEmail: actor.user.email,
    createdAt: now,
    updatedAt: now,
  };
  await versions(db).insertOne(doc);
  await log(db, actor, "restore", doc, { detail: `from v${old.number}` });
  return doc;
}

export async function deleteVersion(actor: Actor, id: string) {
  const db = await store();
  const version = await load(db, id);
  if (!canTransition("delete", version.status)) throw new ContentError("The published version can't be deleted. Archive it first.", 409);
  const result = await versions(db).deleteOne({ _id: id, status: version.status });
  if (!result.deletedCount) throw new ContentError("Someone else changed this version first. Reload to see it.", 409);
  await log(db, actor, "delete", version, { before: { status: version.status, fields: Object.keys(version.fields) } });
}

/**
 * An approved community suggestion becomes a published version: what's live now plus the one
 * changed field. It replaces the old direct write to the overrides.
 */
export async function publishCommunityEdit(db: Store, admin: UserDoc, edit: { _id: string; target: string; field: string; proposed: FieldValue }) {
  const target = parseTargetKey(edit.target);
  if (!target) throw new ContentError("That page can't be edited.", 400);
  const item = await ensureItem(db, target);
  const fields = await liveTextFields(db, item._id, target.type);
  if (sameValue(edit.proposed, currentFieldValue(target, edit.field))) delete fields[edit.field];
  else fields[edit.field] = edit.proposed;
  const now = new Date();
  const doc: VersionDoc = {
    _id: randomUUID(),
    target: item._id,
    number: await nextNumber(db, item._id),
    status: "approved",
    fields,
    note: "Community suggestion",
    source: "community",
    editId: edit._id,
    basedOn: item.publishedNumber ?? null,
    createdBy: admin._id,
    createdByEmail: admin.email,
    createdAt: now,
    updatedAt: now,
    approvedBy: admin._id,
    approvedAt: now,
  };
  await versions(db).insertOne(doc);
  return goLive(db, doc, admin._id);
}

// ---- Reading, for the admin screens -------------------------------------------

export interface PageSummary {
  key: string;
  type: TargetType;
  slug: string;
  title: string;
  path: string;
  publishedNumber: number | null;
  open: number;
  scheduled: number;
}

export async function versionsFor(target: Target): Promise<VersionDoc[]> {
  const db = await store();
  return versions(db).find({ target: targetKey(target) }, { sort: { number: -1 }, limit: 100 }).toArray();
}

export async function getVersion(id: string): Promise<VersionDoc | null> {
  const db = await store();
  return versions(db).findOne({ _id: id });
}

export async function pageState(target: Target) {
  const db = await store();
  const key = targetKey(target);
  const [item, live, rows] = await Promise.all([items(db).findOne({ _id: key }), liveTextFields(db, key, target.type), overrides(db).find({ target: key, field: IMAGE_FIELD }).toArray()]);
  return { item, live, image: (rows[0]?.value as string | undefined) ?? null };
}

/** Text shown in an editor box for each field: the version's value, else the guide's own. */
export function editorText(target: Target, fields: Record<string, FieldValue>) {
  const defs = textFieldsFor(target.type);
  return Object.fromEntries(Object.entries(defs).map(([field, { kind }]) => [field, fieldToText(Object.hasOwn(fields, field) ? fields[field] : currentFieldValue(target, field), kind)]));
}

/** Per-page counts of open and scheduled versions, for the content list. */
export async function pageCounts(): Promise<Map<string, { open: number; scheduled: number; publishedNumber: number | null }>> {
  const db = await store();
  const [open, published] = await Promise.all([
    versions(db).find({ status: { $in: ["draft", "review", "approved"] } }, { limit: 2000 }).toArray(),
    items(db).find({ publishedNumber: { $gt: 0 } }, { limit: 2000 }).toArray(),
  ]);
  const counts = new Map<string, { open: number; scheduled: number; publishedNumber: number | null }>();
  const entry = (key: string) => counts.get(key) ?? counts.set(key, { open: 0, scheduled: 0, publishedNumber: null }).get(key)!;
  for (const version of open) {
    const row = entry(version.target);
    row.open += 1;
    if (version.publishAt) row.scheduled += 1;
  }
  for (const item of published) entry(item._id).publishedNumber = item.publishedNumber ?? null;
  return counts;
}

/** Versions waiting for someone, across the site. */
export async function waiting(now = new Date()) {
  const db = await store();
  const queue = await versions(db).find({ status: { $in: ["review", "approved"] } }, { sort: { updatedAt: -1 }, limit: 50 }).toArray();
  return { queue, due: queue.filter((version) => version.publishAt && version.publishAt <= now).length };
}
