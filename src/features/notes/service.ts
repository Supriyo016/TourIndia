import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";

/**
 * Plan notes (the calendar, the planner and Yatri's "note" command) for signed-in people.
 * Notes are private: there is no way to share one, so they are never shown to anyone else.
 * Guests keep notes in their browser; on sign-in the browser offers to add them here.
 */

export const NOTE_LIMITS = { count: 100, title: 120, body: 5000, perImport: 5 } as const;

const isRealDay = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const noteSchema = z
  .object({
    // The browser makes the id, so a note can be edited before the server has answered.
    id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/, "That note can't be saved."),
    title: z.string().max(NOTE_LIMITS.title, `Keep the title under ${NOTE_LIMITS.title} characters.`),
    body: z.string().max(NOTE_LIMITS.body, `Keep the note under ${NOTE_LIMITS.body.toLocaleString("en-GB")} characters.`),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(isRealDay, "That isn't a real date.")
      .nullable(),
  })
  .strict();
export type NoteInput = z.infer<typeof noteSchema>;

export interface NoteDoc extends Doc {
  userId: string;
  noteId: string;
  title: string;
  body: string;
  date: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteView {
  id: string;
  title: string;
  body: string;
  date: string | null;
  updatedAt: string;
}

export class NoteError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

async function notes() {
  const store = await getStore();
  if (!store) throw new NoteError("Saving notes to your account isn't available right now.", 503);
  return store.collection<NoteDoc>(STORE_COLLECTIONS.notes);
}

const view = (note: NoteDoc): NoteView => ({ id: note.noteId, title: note.title, body: note.body, date: note.date, updatedAt: note.updatedAt.toISOString() });

/** Newest first, the order the notes list shows them in. */
export async function listNotes(userId: string): Promise<NoteView[]> {
  const rows = await (await notes()).find({ userId }, { sort: { createdAt: -1 }, limit: NOTE_LIMITS.count }).toArray();
  return rows.map(view);
}

/** Creates the note, or updates it if this person already has a note with that id. */
export async function saveNote(userId: string, input: NoteInput): Promise<NoteView> {
  const collection = await notes();
  const now = new Date();
  const fields = { title: input.title.trim(), body: input.body, date: input.date, updatedAt: now };
  // Every lookup includes the owner, so another person's note with the same id is never touched.
  const existing = await collection.findOne({ userId, noteId: input.id });
  if (existing) {
    await collection.updateOne({ _id: existing._id, userId }, { $set: fields });
    return view({ ...existing, ...fields });
  }
  if ((await collection.countDocuments({ userId })) >= NOTE_LIMITS.count) throw new NoteError(`You can keep up to ${NOTE_LIMITS.count} notes. Delete one to add another.`, 422);
  const doc: NoteDoc = { _id: randomUUID(), userId, noteId: input.id, ...fields, createdAt: now };
  try {
    await collection.insertOne(doc);
  } catch (error) {
    // Two saves of a brand-new note crossed; the other one created it, so this one updates it.
    if ((error as { code?: number }).code !== 11000) throw error;
    await collection.updateOne({ userId, noteId: input.id }, { $set: fields });
  }
  return view(doc);
}

export async function deleteNote(userId: string, id: string) {
  const { deletedCount } = await (await notes()).deleteOne({ userId, noteId: id });
  // Someone else's note looks the same as one that doesn't exist.
  if (!deletedCount) throw new NoteError("That note doesn't exist.", 404);
}

/** Adds notes from a guest's browser. Ones the account already has are left alone; past the cap the rest are skipped. */
export async function importNotes(userId: string, input: NoteInput[]) {
  const collection = await notes();
  let count = await collection.countDocuments({ userId });
  let added = 0;
  // Start after the account's newest note, so a note saved in the same millisecond never ties.
  const [newest] = await collection.find({ userId }, { sort: { createdAt: -1 }, limit: 1 }).toArray();
  const start = Math.max(Date.now(), (newest?.createdAt?.getTime() ?? 0) + 1);
  // Oldest first, a millisecond apart, so the newest note ends up at the top like it was in the browser.
  for (const note of [...input].reverse()) {
    if (count >= NOTE_LIMITS.count) break;
    if (await collection.findOne({ userId, noteId: note.id })) continue;
    const now = new Date(start + added);
    await collection.insertOne({ _id: randomUUID(), userId, noteId: note.id, title: note.title.trim(), body: note.body, date: note.date, createdAt: now, updatedAt: now });
    count += 1;
    added += 1;
  }
  return { added, skipped: input.length - added };
}

export async function noteCount(userId: string) {
  return (await getStore())?.collection(STORE_COLLECTIONS.notes).countDocuments({ userId }) ?? null;
}

export async function deleteNotes(userId: string) {
  await (await getStore())?.collection(STORE_COLLECTIONS.notes).deleteMany({ userId });
}
