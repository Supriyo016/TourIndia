import "server-only";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { currentSession, sessionFromRequest, type ResolvedSession } from "@/lib/auth/session";
import { securityEvent } from "@/lib/security/audit";
import type { Permission } from "./permissions";
import { accessFor, type AdminAccess } from "./rbac";

/**
 * The one way into admin pages and admin APIs. Each call checks, on the server:
 * a signed-in admin session → MFA completed in this session → the named permission.
 * The UI may hide buttons, but only these checks grant anything.
 */

/** How recently MFA must have been checked for destructive actions. */
export const FRESH_MFA_MS = 15 * 60_000;

export interface AdminContext {
  session: ResolvedSession;
  access: AdminAccess;
}

export const hasFreshMfa = (session: ResolvedSession, now = Date.now()) => Boolean(session.mfaAt && now - session.mfaAt.getTime() < FRESH_MFA_MS);

/** For admin pages (server components). Redirects instead of returning when access is missing. */
export async function requireAdminPage(permission?: Permission): Promise<AdminContext> {
  const session = await currentSession().catch(() => null);
  if (!session || session.role !== "admin") redirect("/admin/login");
  const access = await accessFor(session.user);
  if (!access) redirect("/admin/login");
  if (!session.mfaAt) redirect("/admin/mfa");
  if (permission && !access.permissions.has(permission)) {
    await securityEvent({ action: "admin.denied", outcome: "denied", actorId: session.user._id, actorEmail: session.user.email, detail: `page needs ${permission}` });
    redirect("/admin?denied=1");
  }
  return { session, access };
}

type Denied = NextResponse;

/**
 * For admin route handlers. Returns the context, or a response to send back.
 * `fresh` actions (bans, deletions, role changes, restores) need MFA within the last 15 minutes;
 * the client then asks for a new authenticator code and retries.
 */
export async function requireAdminApi(request: NextRequest, permission: Permission, options: { fresh?: boolean } = {}): Promise<AdminContext | Denied> {
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return NextResponse.json({ error: "Please sign in as an admin." }, { status: 401 });
  const access = session.role === "admin" ? await accessFor(session.user) : null;
  if (!access) return NextResponse.json({ error: "Admins only." }, { status: 403 });
  if (!session.mfaAt) return NextResponse.json({ error: "Confirm your authenticator code first.", code: "mfa" }, { status: 401 });
  if (!access.permissions.has(permission)) {
    await securityEvent({ action: "admin.denied", outcome: "denied", actorId: session.user._id, actorEmail: session.user.email, detail: `${request.method} ${request.nextUrl.pathname} needs ${permission}` });
    return NextResponse.json({ error: "Your role doesn't allow that." }, { status: 403 });
  }
  if (options.fresh && !hasFreshMfa(session)) return NextResponse.json({ error: "Enter a new authenticator code to confirm this action.", code: "reauth" }, { status: 401 });
  return { session, access };
}

export const isDenied = (value: AdminContext | Denied): value is Denied => value instanceof NextResponse;
