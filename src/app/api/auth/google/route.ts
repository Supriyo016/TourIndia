import { NextResponse, type NextRequest } from "next/server";
import { GOOGLE_STATE_COOKIE, isGoogleConfigured, safeReturnPath, startGoogleSignIn } from "@/lib/auth/google";
import { isAuthConfigured } from "@/lib/auth/session";
import { isStoreAvailable } from "@/lib/database/store";

export async function GET(request: NextRequest) {
  const back = safeReturnPath(request.nextUrl.searchParams.get("next"));
  if (!isGoogleConfigured() || !isAuthConfigured() || !isStoreAvailable()) {
    return NextResponse.redirect(new URL(`${back}${back.includes("?") ? "&" : "?"}signin=unavailable`, request.nextUrl.origin));
  }
  const { url, cookie, maxAge } = startGoogleSignIn(request.nextUrl.origin, back);
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
