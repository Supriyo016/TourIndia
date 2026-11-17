import { NextResponse, type NextRequest } from "next/server";
import { verifyCodeSchema } from "@/features/auth/schemas";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { verifyCode } from "@/lib/auth/otp";
import { mayRequestAdminCode } from "@/features/admin/rbac";
import { createSession, hmac, isAuthConfigured, metaFrom, setSessionCookie, toPublicUser } from "@/lib/auth/session";
import { securityEvent } from "@/lib/security/audit";
import { isAllowed } from "@/lib/security/rate-limit";
import { signInUser } from "@/lib/auth/users";
import { isStoreAvailable } from "@/lib/database/store";

const MESSAGES = {
  invalid: "That code isn't right. Check the latest email and try again.",
  expired: "That code has expired. Ask for a new one.",
  locked: "Too many wrong attempts. Ask for a new code.",
} as const;

export async function POST(request: NextRequest) {
  if (!isStoreAvailable() || !isAuthConfigured()) return unavailable();
  const body = await readJson(request, verifyCodeSchema, "otp-verify", { max: 30, windowSeconds: 3600 });
  if (body instanceof NextResponse) return body;

  // Survives new codes, so many networks can't keep resetting the five-try limit on one address.
  const daily = body.purpose === "admin" ? 10 : 20;
  if (!(await isAllowed("otp-verify-email", hmac(`email:${body.email}:${body.purpose}`), { max: daily, windowSeconds: 86_400 }))) {
    return fail(429, "Too many attempts for this address today. Please try again tomorrow.");
  }

  try {
    const result = await verifyCode(body.email, body.purpose, body.code);
    const meta = metaFrom(request);
    // Failed sign-ins are logged by a keyed hash of the address, never the address itself.
    const who = { target: hmac(`email:${body.email}`).slice(0, 16), country: meta.country };
    if (result !== "ok") {
      await securityEvent({ ...who, action: `login.${body.purpose}`, outcome: "failed", detail: result });
      return fail(result === "invalid" ? 401 : 410, MESSAGES[result]);
    }
    if (body.purpose === "admin" && !(await mayRequestAdminCode(body.email))) {
      await securityEvent({ ...who, action: "login.admin", outcome: "denied", detail: "not an admin" });
      return fail(401, MESSAGES.invalid);
    }

    const user = await signInUser(body.email);
    if (!user) return fail(403, "This account can't sign in. Contact us if you think that's a mistake.");
    const session = await createSession(user._id, body.purpose === "admin" ? "admin" : "user", meta);
    await securityEvent({ action: `login.${body.purpose}`, outcome: "ok", actorId: user._id, country: meta.country, detail: meta.device });
    const response = NextResponse.json({ ok: true, user: toPublicUser(user) });
    setSessionCookie(response, request, session);
    return response;
  } catch {
    return unavailable();
  }
}
