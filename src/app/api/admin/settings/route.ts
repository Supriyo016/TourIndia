import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { FLAG_IDS, type Flag } from "@/features/settings/flags";
import { setMaintenance, updateFlags } from "@/features/settings/settings";
import { readJson, unavailable } from "@/lib/api/json";

export const dynamic = "force-dynamic";

const flags = z.object(Object.fromEntries(FLAG_IDS.map((flag) => [flag, z.boolean().optional()])) as Record<Flag, z.ZodOptional<z.ZodBoolean>>).strict();
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("flags"), flags }).strict(),
  z.object({ action: z.literal("maintenance"), on: z.boolean(), message: z.string().trim().max(300).optional() }).strict(),
]);

/**
 * Feature flags and maintenance mode. Needs settings.manage; maintenance also needs an authenticator
 * code from the last 15 minutes. Every change is audited with before and after values.
 */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-settings", { max: 60, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, "settings.manage", { fresh: body.action === "maintenance" });
  if (isDenied(context)) return context;
  try {
    if (body.action === "flags") return NextResponse.json({ ok: true, flags: await updateFlags(context.session.user, body.flags) });
    await setMaintenance(context.session.user, body.on, body.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin settings]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
