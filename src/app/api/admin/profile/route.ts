import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { resetProfile } from "@/features/profile/service";
import { fail, readJson } from "@/lib/api/json";
import { audit } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

const schema = z.object({ action: z.literal("reset"), userId: z.string().uuid(), note: z.string().trim().min(3, "Say why, so other admins know.").max(300) }).strict();

/** Clears a person's tagline, bio, city and website and makes their page private. Needs `moderation.manage`. */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-profile", { max: 60, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, "moderation.manage");
  if (isDenied(context)) return context;
  if (!(await resetProfile(body.userId))) return fail(404, "That person hasn't written a profile.");
  const actor = context.session.user;
  await audit({ actorId: actor._id, actorEmail: actor.email, action: "profile.reset", target: body.userId, outcome: "ok", detail: body.note });
  return NextResponse.json({ ok: true });
}
