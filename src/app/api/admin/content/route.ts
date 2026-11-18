import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { archive, ContentError, createDraft, deleteVersion, getVersion, publishDue, publishNow, restore, saveDraft, transition } from "@/features/content/cms";
import { permissionFor, RULES } from "@/features/content/workflow";
import { TARGET_TYPES } from "@/features/community/targets";
import { readJson, unavailable } from "@/lib/api/json";

export const dynamic = "force-dynamic";

const id = z.string().uuid();
const fields = z.record(z.string().max(40), z.string().max(12_000)).refine((value) => Object.keys(value).length <= 20, "Too many fields.");
const note = z.string().trim().max(300).optional();
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("publish-due") }).strict(),
  z.object({ action: z.literal("create"), target: z.object({ type: z.enum(TARGET_TYPES), id: z.string().regex(/^[a-z0-9-]{1,80}$/) }).strict(), fields: fields.optional(), note }).strict(),
  z.object({ action: z.literal("save"), id, fields, note }).strict(),
  z.object({ action: z.enum(["submit", "approve", "publish", "unschedule", "archive", "restore", "delete"]), id }).strict(),
  z.object({ action: z.literal("reject"), id, note }).strict(),
  z.object({ action: z.literal("schedule"), id, at: z.iso.datetime({ offset: true }) }).strict(),
]);

/**
 * CMS versions: drafts, the review workflow, publishing and scheduling, history and restore.
 * Each step checks its own permission (content.edit, content.publish or content.delete).
 */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-content", { max: 300, windowSeconds: 600, maxBytes: 64 * 1024 });
  if (body instanceof NextResponse) return body;
  try {
    if (body.action === "publish-due") {
      const context = await requireAdminApi(request, "content.publish");
      if (isDenied(context)) return context;
      return NextResponse.json({ ok: true, ...(await publishDue()) });
    }
    // The permission depends on the action, and for archiving on whether the version is live.
    const existing = body.action === "create" ? null : await getVersion(body.id);
    if (body.action !== "create" && !existing) {
      const context = await requireAdminApi(request, "content.edit");
      return isDenied(context) ? context : NextResponse.json({ error: "That version doesn't exist." }, { status: 404 });
    }
    const context = await requireAdminApi(request, permissionFor(body.action, existing?.status), { fresh: RULES[body.action].fresh });
    if (isDenied(context)) return context;
    const actor = { user: context.session.user };
    switch (body.action) {
      case "create": {
        const version = await createDraft(actor, body.target, { fields: body.fields, note: body.note });
        return NextResponse.json({ ok: true, id: version._id, number: version.number });
      }
      case "save":
        await saveDraft(actor, body.id, { fields: body.fields, note: body.note });
        break;
      case "submit":
      case "approve":
      case "unschedule":
        await transition(actor, body.id, body.action);
        break;
      case "reject":
        await transition(actor, body.id, "reject", { note: body.note });
        break;
      case "schedule":
        await transition(actor, body.id, "schedule", { at: new Date(body.at) });
        break;
      case "publish":
        await publishNow(actor, body.id);
        break;
      case "archive":
        await archive(actor, body.id);
        break;
      case "restore": {
        const version = await restore(actor, body.id);
        return NextResponse.json({ ok: true, id: version._id, number: version.number });
      }
      case "delete":
        await deleteVersion(actor, body.id);
        break;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ContentError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[admin content]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
