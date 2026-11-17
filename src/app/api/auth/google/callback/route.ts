import { NextResponse, type NextRequest } from "next/server";
import { site } from "@/config/site";

import { checkIdTokenClaims, exchangeCode, GOOGLE_STATE_COOKIE, isGoogleConfigured, readStateCookie } from "@/lib/auth/google";
import { createSession, metaFrom, setSessionCookie } from "@/lib/auth/session";
import { securityEvent } from "@/lib/security/audit";
import { signInUser } from "@/lib/auth/users";

// Google must send people back to the registered public address, not an internal proxy origin.
const publicOrigin = (request: NextRequest) => (process.env.NODE_ENV === "production" ? new URL(site.url).origin : request.nextUrl.origin);

export async function GET(request: NextRequest) {
  const origin = publicOrigin(request);
  const params = request.nextUrl.searchParams;
  const saved = readStateCookie(request.cookies.get(GOOGLE_STATE_COOKIE)?.value, params.get("state"));
  const code = params.get("code");
  const done = (path: string) => {
    const response = NextResponse.redirect(new URL(path, origin));
    response.cookies.set(GOOGLE_STATE_COOKIE, "", { path: "/api/auth/google", maxAge: 0 });
    return response;
  };
  if (!isGoogleConfigured() || !saved || !code || code.length > 2000) return done("/?signin=failed");

  const idToken = await exchangeCode(code, saved.verifier, origin);
  const profile = idToken ? checkIdTokenClaims(idToken, saved.nonce) : null;
  if (!profile) return done("/?signin=failed");

  try {
    const user = await signInUser(profile.email, { name: profile.name, googleSub: profile.sub });
    // Suspended or banned accounts land on the appeal page instead of failing silently.
    if (!user) return done("/appeal");
    // Google sign-in always gives a normal session; admin access needs an emailed code.
    const meta = metaFrom(request);
    const session = await createSession(user._id, "user", meta);
    await securityEvent({ action: "login.google", outcome: "ok", actorId: user._id, country: meta.country, detail: meta.device });
    const target = user.profileComplete ? saved.returnTo : `/profile/details?welcome=1&next=${encodeURIComponent(saved.returnTo)}`;
    const response = done(target);
    setSessionCookie(response, request, session);
    return response;
  } catch {
    return done("/?signin=failed");
  }
}
