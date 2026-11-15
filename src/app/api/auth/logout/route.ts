import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin } from "@/lib/api/form-handler";
import { fail } from "@/lib/api/json";
import { clearSessionCookie, endSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return fail(403, "This request was not allowed.");
  await endSession(request).catch(() => undefined);
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response, request);
  return response;
}
