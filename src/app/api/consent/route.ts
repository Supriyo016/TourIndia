import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { guardJsonPost } from "@/lib/api/form-handler";
import { CONSENT_COOKIE, CONSENT_MAX_AGE, encodeConsent } from "@/lib/consent";

const schema = z.object({ preferences: z.boolean() }).strict();

export async function POST(request: NextRequest) {
  const guarded = await guardJsonPost(request, "consent", { max: 60, windowSeconds: 3600 });
  if (guarded instanceof NextResponse) return guarded;

  let body: unknown;
  try {
    body = JSON.parse(guarded.raw);
  } catch {
    return NextResponse.json({ error: "That request could not be read." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "That request was not valid." }, { status: 422 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: CONSENT_COOKIE,
    value: encodeConsent(parsed.data.preferences),
    maxAge: CONSENT_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    httpOnly: false,
  });
  return response;
}
