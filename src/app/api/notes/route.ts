import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { deleteNote, importNotes, listNotes, NOTE_LIMITS, NoteError, noteSchema, saveNote } from "@/features/notes/service";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { sessionFromRequest } from "@/lib/auth/session";
import { getStore } from "@/lib/database/store";

export const dynamic = "force-dynamic";
const PRIVATE = { "Cache-Control": "private, no-store" };

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), note: noteSchema }).strict(),
  z.object({ action: z.literal("delete"), id: noteSchema.shape.id }).strict(),
  z.object({ action: z.literal("import"), notes: z.array(noteSchema).min(1).max(NOTE_LIMITS.perImport) }).strict(),
]);

/** The signed-in person's notes. */
export async function GET(request: NextRequest) {
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  if (!(await getStore())) return unavailable();
  return NextResponse.json({ notes: await listNotes(session.user._id) }, { headers: PRIVATE });
}

export async function POST(request: NextRequest) {
  // Edits are sent a moment after typing stops, so a busy afternoon of planning stays well inside this.
  // A note can be 5,000 characters, so the request allows a few notes' worth of text.
  const body = await readJson(request, schema, "notes", { max: 600, windowSeconds: 600, maxBytes: 96 * 1024 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  const userId = session.user._id;
  try {
    switch (body.action) {
      case "save":
        return NextResponse.json({ note: await saveNote(userId, body.note) }, { headers: PRIVATE });
      case "delete":
        await deleteNote(userId, body.id);
        return NextResponse.json({ ok: true }, { headers: PRIVATE });
      case "import":
        return NextResponse.json(await importNotes(userId, body.notes), { headers: PRIVATE });
    }
  } catch (error) {
    if (error instanceof NoteError) return fail(error.status, error.message);
    console.error("[notes]", error instanceof Error ? error.name : "");
    return unavailable();
  }
}
