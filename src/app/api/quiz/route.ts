import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { deleteAttempt, deleteAttempts, listAttempts, saveAttempt } from "@/features/quiz/history";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { sessionFromRequest } from "@/lib/auth/session";
import { getStore } from "@/lib/database/store";

export const dynamic = "force-dynamic";
const PRIVATE = { "Cache-Control": "private, no-store" };

const schema = z.discriminatedUnion("action", [
  // The quiz's own query string; anything that isn't a real choice is dropped when it's read.
  z.object({ action: z.literal("save"), answers: z.string().max(400) }).strict(),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }).strict(),
  z.object({ action: z.literal("clear") }).strict(),
]);

/** The signed-in person's quiz results, newest first. */
export async function GET(request: NextRequest) {
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  if (!(await getStore())) return unavailable();
  return NextResponse.json({ attempts: await listAttempts(session.user._id) }, { headers: PRIVATE });
}

export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "quiz", { max: 40, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  const userId = session.user._id;
  if (!(await getStore())) return unavailable();
  switch (body.action) {
    case "save": {
      const result = await saveAttempt(userId, body.answers);
      return result ? NextResponse.json(result, { headers: PRIVATE }) : unavailable();
    }
    case "delete":
      return (await deleteAttempt(userId, body.id)) ? NextResponse.json({ ok: true }, { headers: PRIVATE }) : fail(404, "That result doesn't exist.");
    case "clear":
      await deleteAttempts(userId);
      return NextResponse.json({ ok: true }, { headers: PRIVATE });
  }
}
