import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { giveFeedback, YatriError } from "@/features/assistant/insights";
import { readJson, unavailable } from "@/lib/api/json";

export const dynamic = "force-dynamic";

const schema = z.object({ id: z.string().uuid(), token: z.string().regex(/^[A-Za-z0-9_-]{20,40}$/), vote: z.enum(["up", "down"]) }).strict();

/** Thumbs up or down on one Yatri answer, from the browser that received it (it holds the token). */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "assistant-feedback", { max: 60, windowSeconds: 3600 });
  if (body instanceof NextResponse) return body;
  try {
    return NextResponse.json({ ok: true, ...(await giveFeedback(body.id, body.token, body.vote)) });
  } catch (error) {
    if (error instanceof YatriError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[assistant feedback]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
