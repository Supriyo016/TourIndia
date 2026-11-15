import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { profileSchema } from "@/features/auth/schemas";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { clearSessionCookie, endAllSessions, sessionFromRequest, toPublicUser, type UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  return NextResponse.json({ user: toPublicUser(session.user) }, { headers: { "Cache-Control": "private, no-store" } });
}

/** Saves the profile. POST rather than PATCH so the shared same-origin guard applies. */
export async function POST(request: NextRequest) {
  const body = await readJson(request, profileSchema, "account", { max: 30, windowSeconds: 3600 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  const store = await getStore();
  if (!store) return unavailable();
  const { homeState, ...rest } = body;
  const user = await store.collection<UserDoc>(STORE_COLLECTIONS.users).findOneAndUpdate(
    { _id: session.user._id },
    { $set: { ...rest, profileComplete: true, ...(homeState ? { homeState } : {}) }, ...(homeState ? {} : { $unset: { homeState: "" as const } }) },
    { returnDocument: "after" },
  );
  return user ? NextResponse.json({ ok: true, user: toPublicUser(user) }) : unavailable();
}

/**
 * Deletes the account. Published comments stay but lose their author, so threads still read;
 * reactions, ratings and sessions go with the account.
 */
export async function DELETE(request: NextRequest) {
  const body = await readJson(request, z.object({ confirm: z.literal("DELETE") }).strict(), "account-delete", { max: 5, windowSeconds: 3600 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  const store = await getStore();
  if (!store) return unavailable();
  const id = session.user._id;
  const comments = store.collection(STORE_COLLECTIONS.comments);
  await comments.deleteMany({ userId: id, status: { $ne: "visible" } });
  for (const comment of await comments.find({ userId: id }).toArray()) {
    await comments.updateOne({ _id: comment._id }, { $set: { userId: null, authorName: "Former member" } });
  }
  // Take loves and ratings back out of the published totals before deleting them.
  const stats = store.collection(STORE_COLLECTIONS.stats);
  for (const reaction of await store.collection<Doc & { target: string; kind: string }>(STORE_COLLECTIONS.reactions).find({ userId: id }).toArray()) {
    if (reaction.kind === "love") await stats.updateOne({ _id: reaction.target }, { $inc: { loves: -1 } });
  }
  for (const rating of await store.collection<Doc & { target: string; stars: number }>(STORE_COLLECTIONS.ratings).find({ userId: id }).toArray()) {
    await stats.updateOne({ _id: rating.target }, { $inc: { ratingCount: -1, ratingSum: -rating.stars } });
  }
  await store.collection(STORE_COLLECTIONS.reactions).deleteMany({ userId: id });
  await store.collection(STORE_COLLECTIONS.ratings).deleteMany({ userId: id });
  await store.collection(STORE_COLLECTIONS.reports).deleteMany({ userId: id });
  await store.collection(STORE_COLLECTIONS.bookings).deleteMany({ userId: id });
  const edits = store.collection(STORE_COLLECTIONS.edits);
  for (const edit of await edits.find({ userId: id }).toArray()) {
    await edits.updateOne({ _id: edit._id }, { $set: { userId: "deleted", authorName: "Former member" } });
  }
  await store.collection(STORE_COLLECTIONS.users).deleteOne({ _id: id });
  await endAllSessions(id);
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response, request);
  return response;
}
