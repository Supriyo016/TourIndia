import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { memoryInputSchema } from "@/features/memories/schema";
import { createMemory, deleteMemory, listMemories, MemoryError, shareMemory, updateMemory } from "@/features/memories/service";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { sessionFromRequest } from "@/lib/auth/session";
import { getStore } from "@/lib/database/store";

export const dynamic = "force-dynamic";
const PRIVATE = { "Cache-Control": "private, no-store" };
const id = z.string().uuid();

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), memory: memoryInputSchema }).strict(),
  z.object({ action: z.literal("update"), id, memory: memoryInputSchema }).strict(),
  z.object({ action: z.literal("delete"), id }).strict(),
  z.object({ action: z.literal("share"), id, on: z.boolean() }).strict(),
]);

/** The signed-in person's memories, newest first. */
export async function GET(request: NextRequest) {
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  if (!(await getStore())) return unavailable();
  return NextResponse.json({ memories: await listMemories(session.user._id) }, { headers: PRIVATE });
}

export async function POST(request: NextRequest) {
  // 4,000 characters in Hindi or Tamil run to about 12 KB on their own, so memories allow 32 KB.
  const body = await readJson(request, schema, "memories", { max: 120, windowSeconds: 600, maxBytes: 32 * 1024 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  const userId = session.user._id;
  try {
    switch (body.action) {
      case "create":
        return NextResponse.json({ memory: await createMemory(userId, body.memory) }, { status: 201, headers: PRIVATE });
      case "update":
        return NextResponse.json({ memory: await updateMemory(userId, body.id, body.memory) }, { headers: PRIVATE });
      case "delete":
        await deleteMemory(userId, body.id);
        return NextResponse.json({ ok: true }, { headers: PRIVATE });
      case "share":
        return NextResponse.json({ shareId: await shareMemory(userId, body.id, body.on) }, { headers: PRIVATE });
    }
  } catch (error) {
    if (error instanceof MemoryError) return fail(error.status, error.message);
    console.error("[memories]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
