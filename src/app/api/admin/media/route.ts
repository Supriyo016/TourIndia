import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { MediaError, setPageImage } from "@/features/media/library";
import { readJson, unavailable } from "@/lib/api/json";

export const dynamic = "force-dynamic";

const schema = z
  .object({
    action: z.literal("assign"),
    target: z.object({ type: z.enum(["place", "state"]), id: z.string().regex(/^[a-z0-9-]{1,80}$/) }).strict(),
    key: z.string().max(140).nullable(),
  })
  .strict();

/** Chooses which licensed image a page uses (or goes back to its own). Needs media.manage; audited. */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-media", { max: 120, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, "media.manage");
  if (isDenied(context)) return context;
  try {
    return NextResponse.json({ ok: true, ...(await setPageImage(context.session.user, body.target, body.key)) });
  } catch (error) {
    if (error instanceof MediaError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[admin media]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
