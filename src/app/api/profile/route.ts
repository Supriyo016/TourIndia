import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getProfile, saveIdentity, savePreferences, savePrivacy, usernameAvailable } from "@/features/profile/service";
import { identitySchema, preferencesSchema, privacySchema, usernameProblem } from "@/features/profile/schema";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { sessionFromRequest } from "@/lib/auth/session";
import { getStore } from "@/lib/database/store";

export const dynamic = "force-dynamic";
const PRIVATE = { "Cache-Control": "private, no-store" };

/** The signed-in person's own profile, preferences and privacy choices. */
export async function GET(request: NextRequest) {
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  if (!(await getStore())) return unavailable();
  return NextResponse.json({ profile: await getProfile(session.user._id) }, { headers: PRIVATE });
}

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("identity"), identity: identitySchema }).strict(),
  z.object({ action: z.literal("preferences"), preferences: preferencesSchema }).strict(),
  z.object({ action: z.literal("privacy"), privacy: privacySchema }).strict(),
  z.object({ action: z.literal("check-username"), username: z.string().trim().toLowerCase().max(40) }).strict(),
]);

export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "profile", { max: 60, windowSeconds: 3600 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  if (!(await getStore())) return unavailable();
  const userId = session.user._id;

  if (body.action === "check-username") {
    const problem = usernameProblem(body.username);
    if (problem) return NextResponse.json({ available: false, reason: problem }, { headers: PRIVATE });
    const available = await usernameAvailable(body.username, userId);
    return NextResponse.json({ available, reason: available ? null : "That username is taken." }, { headers: PRIVATE });
  }

  const result =
    body.action === "identity" ? await saveIdentity(userId, body.identity) : body.action === "preferences" ? await savePreferences(userId, body.preferences) : await savePrivacy(userId, body.privacy);
  if (!result.ok) return fail(result.status, result.error);
  return NextResponse.json({ ok: true, profile: await getProfile(userId) }, { headers: PRIVATE });
}
