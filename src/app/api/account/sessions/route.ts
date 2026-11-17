import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { endOtherSessions, endOwnSession, listSessions, signInHistory } from "@/features/auth/sessions";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { sessionFromRequest } from "@/lib/auth/session";
import { securityEvent } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("end"), id: z.string().regex(/^[\w-]{6,20}$/) }).strict(),
  z.object({ action: z.literal("end-others") }).strict(),
]);

/** The signed-in person's own sessions and recent sign-ins. Nothing here can touch anyone else's. */
export async function GET(request: NextRequest) {
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  try {
    const [sessions, history] = await Promise.all([listSessions(session.user._id, session.sessionId), signInHistory(session.user)]);
    return NextResponse.json({ sessions, history }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return unavailable();
  }
}

export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "account-sessions", { max: 30, windowSeconds: 3600 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  try {
    if (body.action === "end") {
      if (body.id === session.publicId) return fail(400, "To end this session, sign out instead.");
      if (!(await endOwnSession(session.user._id, body.id))) return fail(404, "That session has already ended.");
      await securityEvent({ action: "session.end", outcome: "ok", actorId: session.user._id, detail: "one device" });
      return NextResponse.json({ ok: true });
    }
    const ended = await endOtherSessions(session.user._id, session.sessionId);
    await securityEvent({ action: "session.end-others", outcome: "ok", actorId: session.user._id, detail: `${ended} sessions` });
    return NextResponse.json({ ok: true, ended });
  } catch {
    return unavailable();
  }
}
