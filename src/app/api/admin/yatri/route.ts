import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { setHandled, YatriError } from "@/features/assistant/insights";
import { readJson, unavailable } from "@/lib/api/json";

export const dynamic = "force-dynamic";

const schema = z.object({ action: z.enum(["handle", "reopen"]), id: z.string().uuid(), note: z.string().trim().max(300).optional() }).strict();

/** Marks a Yatri question handled or reopens it. Needs yatri.manage; audited. */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-yatri", { max: 300, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, "yatri.manage");
  if (isDenied(context)) return context;
  try {
    await setHandled(context.session.user, body.id, body.action === "handle", body.note);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof YatriError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[admin yatri]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
