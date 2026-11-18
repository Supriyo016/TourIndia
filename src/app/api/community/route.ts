import { featureOff } from "@/features/settings/gate";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { sessionFromRequest } from "@/lib/auth/session";
import { isStoreAvailable } from "@/lib/database/store";
import { isAllowed } from "@/lib/security/rate-limit";
import {
  addComment,
  CommunityError,
  deleteOwnComment,
  getThread,
  markHelpful,
  proposeEdit,
  rate,
  report,
  toggleLove,
} from "@/features/community/service";
import { COMMENT_KINDS, TARGET_TYPES } from "@/features/community/targets";

export const dynamic = "force-dynamic";

const target = z.object({ type: z.enum(TARGET_TYPES), id: z.string().regex(/^[a-z0-9-]{1,80}$/) }).strict();
const id = z.string().uuid();

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("love"), target }).strict(),
  z.object({ action: z.literal("rate"), target, stars: z.number().int().min(1).max(5) }).strict(),
  z
    .object({
      action: z.literal("comment"),
      target,
      kind: z.enum(Object.keys(COMMENT_KINDS) as [keyof typeof COMMENT_KINDS]),
      body: z.string().trim().min(3, "Write at least a few words.").max(2000, "Keep it under 2,000 characters."),
      parentId: id.optional(),
    })
    .strict(),
  z.object({ action: z.literal("helpful"), commentId: id }).strict(),
  z.object({ action: z.literal("report"), commentId: id, reason: z.enum(["disrespectful", "hateful", "spam", "wrong", "personal"]) }).strict(),
  z.object({ action: z.literal("delete"), commentId: id }).strict(),
  z
    .object({
      action: z.literal("edit"),
      target,
      field: z.string().max(40),
      text: z.string().trim().min(3, "Write the corrected text.").max(6000, "Keep it under 6,000 characters."),
      reason: z.string().trim().min(10, "Say briefly why it should change, ideally with a source.").max(600),
    })
    .strict(),
]);

const errorResponse = (error: unknown) =>
  error instanceof CommunityError ? fail(error.status, error.message) : (console.error("[community]", error), unavailable());

/** Public: counts, visible comments and, when signed in, your own love and rating. */
export async function GET(request: NextRequest) {
  if (!isStoreAvailable()) return unavailable();
  const parsed = target.safeParse({ type: request.nextUrl.searchParams.get("type"), id: request.nextUrl.searchParams.get("id") });
  if (!parsed.success) return fail(400, "Unknown page.");
  try {
    const session = await sessionFromRequest(request).catch(() => null);
    const thread = await getThread(parsed.data, session?.user ?? null);
    return NextResponse.json(thread, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Everything that writes needs a signed-in account. */
export async function POST(request: NextRequest) {
  if (!isStoreAvailable()) return unavailable();
  const paused = await featureOff("comments");
  if (paused) return paused;
  const body = await readJson(request, actionSchema, "community", { max: 120, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in first.");
  const user = session.user;

  // Per account as well as per network: posting is limited more tightly than reacting.
  const posting = body.action === "comment" || body.action === "edit";
  if (posting && !(await isAllowed("community-post", user._id, { max: 10, windowSeconds: 600 }))) {
    return fail(429, "You're posting quickly. Please wait a few minutes.");
  }

  try {
    switch (body.action) {
      case "love":
        return NextResponse.json(await toggleLove(body.target, user));
      case "rate":
        return NextResponse.json(await rate(body.target, user, body.stars));
      case "comment":
        return NextResponse.json(await addComment(body.target, user, body), { status: 201 });
      case "helpful":
        return NextResponse.json(await markHelpful(body.commentId, user));
      case "report":
        await report(body.commentId, user, body.reason);
        return NextResponse.json({ ok: true, message: "Thanks. An admin will look at it." });
      case "delete":
        await deleteOwnComment(body.commentId, user);
        return NextResponse.json({ ok: true });
      case "edit":
        return NextResponse.json({ ...(await proposeEdit(body.target, user, body)), message: "Thanks. Your suggestion will appear once an admin approves it." }, { status: 201 });
    }
  } catch (error) {
    return errorResponse(error);
  }
}
