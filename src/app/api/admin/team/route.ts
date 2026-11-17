import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { PERMISSIONS } from "@/features/admin/permissions";
import { allRoles } from "@/features/admin/rbac";
import { deleteRole, listTeam, saveRole, setMemberRoles, TeamError } from "@/features/admin/team";
import { readJson, unavailable } from "@/lib/api/json";

export const dynamic = "force-dynamic";

const roleId = z.string().regex(/^[a-z0-9_]{2,40}$/);
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set-roles"), email: z.email().max(254), roles: z.array(roleId).max(10) }).strict(),
  z.object({
    action: z.literal("save-role"),
    id: roleId.optional(),
    name: z.string().trim().min(2).max(40),
    description: z.string().trim().max(200).default(""),
    permissions: z.array(z.string().max(40)).min(1).max(40),
  }).strict(),
  z.object({ action: z.literal("delete-role"), id: roleId }).strict(),
]);

/** The admin team and roles. Reading needs `admins.manage`; every change also needs a fresh MFA code. */
export async function GET(request: NextRequest) {
  const context = await requireAdminApi(request, "admins.manage");
  if (isDenied(context)) return context;
  try {
    const [team, roles] = await Promise.all([listTeam(), allRoles()]);
    return NextResponse.json({ team, roles, permissions: PERMISSIONS, me: context.session.user.email }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return unavailable();
  }
}

export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-team", { max: 60, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, body.action === "set-roles" ? "admins.manage" : "roles.manage", { fresh: true });
  if (isDenied(context)) return context;
  const actor = { user: context.session.user, access: context.access };
  try {
    if (body.action === "set-roles") return NextResponse.json({ team: await setMemberRoles(actor, body.email, body.roles) });
    if (body.action === "save-role") return NextResponse.json({ roles: await saveRole(actor, body) });
    return NextResponse.json({ roles: await deleteRole(actor, body.id) });
  } catch (error) {
    if (error instanceof TeamError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[admin team]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
