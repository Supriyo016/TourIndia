import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { decide, RecError, REC_STATES } from "@/features/improve/engine";
import { readJson, unavailable } from "@/lib/api/json";

export const dynamic = "force-dynamic";

const schema = z.object({ id: z.string().min(3).max(200), state: z.enum(REC_STATES), note: z.string().trim().max(300).optional() }).strict();

/** Records a decision on a recommendation (accepted, dismissed, done or back to new). Needs content.edit; audited. */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-improve", { max: 300, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, "content.edit");
  if (isDenied(context)) return context;
  try {
    await decide(context.session.user, body.id, body.state, body.note);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RecError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[admin improve]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
