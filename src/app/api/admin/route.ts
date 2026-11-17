import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { endUserSessions, TeamError } from "@/features/admin/team";
import { CommunityError, decideEdit, moderateComment, setUserStatus } from "@/features/community/service";

const id = z.string().uuid();
const note = z.string().trim().max(300).default("");

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("edit"), id, approve: z.boolean(), note }).strict(),
  z.object({ action: z.literal("comment"), id, status: z.enum(["visible", "removed"]), note }).strict(),
  z.object({ action: z.literal("user"), id, status: z.enum(["active", "blocked"]) }).strict(),
  z.object({ action: z.literal("sessions"), id }).strict(),
]);

const PERMISSION_FOR = { edit: "moderation.manage", comment: "moderation.manage", user: "users.ban", sessions: "users.sessions" } as const;

/**
 * Moderation decisions. Each needs an admin session with MFA and the matching permission;
 * blocking or restoring an account also needs a recent authenticator code.
 */
export async function POST(request: NextRequest) {
  const body = await readJson(request, actionSchema, "admin", { max: 300, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, PERMISSION_FOR[body.action], { fresh: body.action === "user" || body.action === "sessions" });
  if (isDenied(context)) return context;
  const { session } = context;
  try {
    if (body.action === "edit") await decideEdit(body.id, session.user, body.approve, body.note);
    if (body.action === "comment") await moderateComment(body.id, session.user, body.status, body.note);
    if (body.action === "user") await setUserStatus(body.id, session.user, body.status);
    if (body.action === "sessions") await endUserSessions({ user: session.user, access: context.access }, body.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof CommunityError || error instanceof TeamError) return fail(error.status, error.message);
    console.error("[admin]", error);
    return unavailable();
  }
}
