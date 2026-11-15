import { NextResponse, type NextRequest } from "next/server";
import { verifyCodeSchema } from "@/features/auth/schemas";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { verifyCode } from "@/lib/auth/otp";
import { adminEmails, createSession, isAuthConfigured, setSessionCookie, toPublicUser } from "@/lib/auth/session";
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

  try {
    const result = await verifyCode(body.email, body.purpose, body.code);
    if (result !== "ok") return fail(result === "invalid" ? 401 : 410, MESSAGES[result]);
    if (body.purpose === "admin" && !adminEmails().has(body.email)) return fail(401, MESSAGES.invalid);

    const user = await signInUser(body.email);
    if (!user) return fail(403, "This account can't sign in. Contact us if you think that's a mistake.");
    const session = await createSession(user._id, body.purpose === "admin" ? "admin" : "user");
    const response = NextResponse.json({ ok: true, user: toPublicUser(user) });
    setSessionCookie(response, request, session);
    return response;
  } catch {
    return unavailable();
  }
}
