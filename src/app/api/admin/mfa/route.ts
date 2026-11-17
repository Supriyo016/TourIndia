import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { confirmEnrolment, mfaState, recoveryCodesLeft, regenerateRecoveryCodes, startEnrolment, verifyMfa } from "@/features/admin/mfa";
import { accessFor } from "@/features/admin/rbac";
import { hasFreshMfa } from "@/features/admin/guard";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { hmac, markSessionMfa, sessionFromRequest } from "@/lib/auth/session";
import { audit, securityEvent } from "@/lib/security/audit";
import { isAllowed } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const code = z.string().trim().min(6).max(12);
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start") }).strict(),
  z.object({ action: z.literal("enable"), code }).strict(),
  z.object({ action: z.literal("verify"), code }).strict(),
  z.object({ action: z.literal("regenerate") }).strict(),
]);

/**
 * Admin MFA. The only admin endpoint that works before MFA is complete in this session,
 * so it checks the admin session itself rather than through requireAdminApi.
 */
async function adminSession(request: NextRequest) {
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session || session.role !== "admin") return null;
  return (await accessFor(session.user)) ? session : null;
}

export async function GET(request: NextRequest) {
  const session = await adminSession(request);
  if (!session) return fail(401, "Admins only.");
  try {
    const state = await mfaState(session.user._id);
    return NextResponse.json(
      { state, verified: Boolean(session.mfaAt), recoveryLeft: state === "enabled" ? await recoveryCodesLeft(session.user._id) : 0 },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return unavailable();
  }
}

export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-mfa", { max: 60, windowSeconds: 900 });
  if (body instanceof NextResponse) return body;
  const session = await adminSession(request);
  if (!session) return fail(401, "Admins only.");
  const actor = { actorId: session.user._id, actorEmail: session.user.email };

  try {
    if (body.action === "start") {
      const result = await startEnrolment(session.user);
      if (result === "already-enabled") return fail(409, "Your authenticator is already set up.");
      return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    }

    // Code checks are limited per admin as well as per network: 8 tries in 15 minutes.
    if (body.action === "enable" || body.action === "verify") {
      if (!(await isAllowed("admin-mfa-code", hmac(`mfa:${session.user._id}`), { max: 8, windowSeconds: 900 }))) {
        await securityEvent({ ...actor, action: "mfa.locked", outcome: "denied", detail: "too many codes" });
        return fail(429, "Too many attempts. Wait 15 minutes and try again.");
      }
    }

    if (body.action === "enable") {
      const result = await confirmEnrolment(session.user._id, body.code);
      if (result === "no-enrolment") return fail(409, "Start the set-up first.");
      if (result === "invalid") {
        await securityEvent({ ...actor, action: "mfa.enable", outcome: "failed" });
        return fail(401, "That code isn't right. Check the time on your phone and try the newest code.");
      }
      await markSessionMfa(session.sessionId);
      await audit({ ...actor, action: "mfa.enable", outcome: "ok", target: session.user._id });
      return NextResponse.json({ ok: true, recoveryCodes: result }, { headers: { "Cache-Control": "no-store" } });
    }

    if (body.action === "verify") {
      const result = await verifyMfa(session.user._id, body.code);
      if (result === "invalid") {
        await securityEvent({ ...actor, action: "mfa.verify", outcome: "failed" });
        return fail(401, "That code isn't right.");
      }
      await markSessionMfa(session.sessionId);
      await securityEvent({ ...actor, action: result === "recovery" ? "mfa.recovery-used" : "mfa.verify", outcome: "ok" });
      return NextResponse.json({ ok: true, usedRecovery: result === "recovery" });
    }

    // New recovery codes replace the old ones, so they need a recent code.
    if (!hasFreshMfa(session)) return NextResponse.json({ error: "Enter a new authenticator code to confirm this action.", code: "reauth" }, { status: 401 });
    const codes = await regenerateRecoveryCodes(session.user._id);
    if (codes === "no-mfa") return fail(409, "Set up your authenticator first.");
    await audit({ ...actor, action: "mfa.recovery-regenerate", outcome: "ok", target: session.user._id });
    return NextResponse.json({ ok: true, recoveryCodes: codes }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return unavailable();
  }
}
