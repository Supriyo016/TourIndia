import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  createCollection,
  deleteCollection,
  getSaved,
  LIMITS,
  listCollections,
  mergeItems,
  mergePassport,
  SavedError,
  setPassport,
  setItem,
  shareCollection,
  updateCollection,
} from "@/features/saved/service";
import { MONTH_PATTERN, PASSPORT_STATUSES } from "@/features/saved/passport";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { sessionFromRequest } from "@/lib/auth/session";
import { getStore } from "@/lib/database/store";

export const dynamic = "force-dynamic";
const PRIVATE = { "Cache-Control": "private, no-store" };

const slug = z.string().regex(/^[a-z0-9-]{1,80}$/);
const kind = z.enum(["places", "stamps"]);
const id = z.string().uuid();
const name = z.string().trim().min(1, "Give it a name.").max(60, "Keep the name under 60 characters.");
const note = z.string().trim().max(300, "Keep the note under 300 characters.");
const status = z.enum(PASSPORT_STATUSES);
const month = z.string().regex(MONTH_PATTERN, "Choose a month and a year.");
const places = z.array(slug).max(LIMITS.perCollection, `A collection can hold up to ${LIMITS.perCollection} places.`);

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set"), kind, slug, on: z.boolean() }).strict(),
  z.object({ action: z.literal("merge"), kind, slugs: z.array(slug).max(LIMITS.places) }).strict(),
  z.object({ action: z.literal("passport-set"), state: slug, status: status.nullable(), month: month.nullable().default(null) }).strict(),
  z
    .object({ action: z.literal("passport-merge"), entries: z.array(z.object({ state: slug, status, month: month.optional() }).strict()).max(LIMITS.stamps) })
    .strict(),
  z.object({ action: z.literal("collection-create"), name, note: note.default(""), places: places.default([]) }).strict(),
  z.object({ action: z.literal("collection-update"), id, name: name.optional(), note: note.optional(), places: places.optional() }).strict(),
  z.object({ action: z.literal("collection-delete"), id }).strict(),
  z.object({ action: z.literal("collection-share"), id, on: z.boolean() }).strict(),
]);

/** Everything the signed-in person has saved to their account. */
export async function GET(request: NextRequest) {
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  if (!(await getStore())) return unavailable();
  const [saved, collections] = await Promise.all([getSaved(session.user._id), listCollections(session.user._id)]);
  return NextResponse.json({ ...saved, collections }, { headers: PRIVATE });
}

export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "saved", { max: 300, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  const userId = session.user._id;
  try {
    switch (body.action) {
      case "set":
        return NextResponse.json({ [body.kind]: await setItem(userId, body.kind, body.slug, body.on) }, { headers: PRIVATE });
      case "merge":
        return NextResponse.json({ [body.kind]: await mergeItems(userId, body.kind, body.slugs) }, { headers: PRIVATE });
      case "passport-set":
        return NextResponse.json({ passport: await setPassport(userId, body.state, body.status, body.month) }, { headers: PRIVATE });
      case "passport-merge":
        return NextResponse.json({ passport: await mergePassport(userId, body.entries) }, { headers: PRIVATE });
      case "collection-create":
        return NextResponse.json({ collection: await createCollection(userId, body) }, { status: 201, headers: PRIVATE });
      case "collection-update":
        return NextResponse.json({ collection: await updateCollection(userId, body.id, body) }, { headers: PRIVATE });
      case "collection-delete":
        await deleteCollection(userId, body.id);
        return NextResponse.json({ ok: true }, { headers: PRIVATE });
      case "collection-share":
        return NextResponse.json({ collection: await shareCollection(userId, body.id, body.on) }, { headers: PRIVATE });
    }
  } catch (error) {
    if (error instanceof SavedError) return fail(error.status, error.message);
    console.error("[saved]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
