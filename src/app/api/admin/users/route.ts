import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { decideAppeal, lift, REASONS, restrict, RestrictionError, type Reason } from "@/features/admin/restrictions";
import { readJson, unavailable } from "@/lib/api/json";

export const dynamic = "force-dynamic";

const id = z.string().uuid();
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("restrict"),
    userId: id,
    kind: z.enum(["suspension", "ban"]),
    days: z.number().int().min(1).max(3650).nullable(),
    reason: z.enum(Object.keys(REASONS) as [Reason, ...Reason[]]),
    note: z.string().trim().min(3, "Add a short note so other admins know why.").max(500),
    evidence: z.string().trim().max(200).optional(),
  }).strict(),
  z.object({ action: z.literal("lift"), restrictionId: id, note: z.string().trim().min(3, "Say why it's being lifted.").max(300) }).strict(),
  z.object({ action: z.literal("appeal"), restrictionId: id, decision: z.enum(["upheld", "overturned"]), note: z.string().trim().min(3, "Explain the decision.").max(500) }).strict(),
]);

/** Account restrictions and appeals. Needs `users.ban` and a fresh authenticator code. */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-users", { max: 120, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, "users.ban", { fresh: true });
  if (isDenied(context)) return context;
  const actor = { user: context.session.user, access: context.access };
  try {
    if (body.action === "restrict") {
      await restrict(actor, body.userId, { kind: body.kind, days: body.days, reason: body.reason, note: body.note, evidence: body.evidence });
    } else if (body.action === "lift") await lift(actor, body.restrictionId, body.note);
    else await decideAppeal(actor, body.restrictionId, body.decision, body.note);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RestrictionError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[admin users]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
