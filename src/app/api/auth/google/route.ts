import { NextResponse, type NextRequest } from "next/server";
import { site } from "@/config/site";

import { GOOGLE_STATE_COOKIE, isGoogleConfigured, safeReturnPath, startGoogleSignIn } from "@/lib/auth/google";
import { isAuthConfigured } from "@/lib/auth/session";
import { isStoreAvailable } from "@/lib/database/store";

// Google must send people back to the registered public address, not an internal proxy origin.
const publicOrigin = (request: NextRequest) => (process.env.NODE_ENV === "production" ? new URL(site.url).origin : request.nextUrl.origin);

export async function GET(request: NextRequest) {
  const back = safeReturnPath(request.nextUrl.searchParams.get("next"));
  if (!isGoogleConfigured() || !isAuthConfigured() || !isStoreAvailable()) {
    return NextResponse.redirect(new URL(`${back}${back.includes("?") ? "&" : "?"}signin=unavailable`, publicOrigin(request)));
  }
  const { url, cookie, maxAge } = startGoogleSignIn(publicOrigin(request), back);
  const response = NextResponse.redirect(url);
  response.cookies.set(GOOGLE_STATE_COOKIE, cookie, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge,
  });
  return response;
}
