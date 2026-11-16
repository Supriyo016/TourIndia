import { randomInt, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getDestination } from "@/data";
import { bookingSchema } from "@/features/bookings/schema";
import { moderate } from "@/features/community/moderation";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { sessionFromRequest } from "@/lib/auth/session";
import { getStore, isStoreAvailable, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";

export const dynamic = "force-dynamic";

interface BookingDoc extends Doc {
  reference: string;
  userId: string;
  email: string;
  name: string;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
  destinationName: string;
  [key: string]: unknown;
}

// No 0/O or 1/I, so references read cleanly over the phone.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const reference = () => `TI-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

/** Your own requests, newest first. */
export async function GET(request: NextRequest) {
  if (!isStoreAvailable()) return unavailable();
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  const store = await getStore();
  if (!store) return unavailable();
  const rows = await store.collection<BookingDoc>(STORE_COLLECTIONS.bookings).find({ userId: session.user._id }, { sort: { createdAt: -1 }, limit: 50 }).toArray();
  return NextResponse.json(
    { requests: rows.map(({ reference: ref, kind, destinationName, checkIn, checkOut, status, createdAt }) => ({ reference: ref, kind, destinationName, checkIn, checkOut, status, createdAt })) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (!isStoreAvailable()) return unavailable();
  const body = await readJson(request, bookingSchema, "booking", { max: 10, windowSeconds: 3600 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in to send a request.");
  const destination = getDestination(body.destination);
  if (!destination) return fail(422, "Choose a destination from the list.");
  if (body.checkIn < new Date().toISOString().slice(0, 10)) return fail(422, "The start date has passed.");
  if (body.notes) {
    const checked = moderate(body.notes);
    if (checked.action === "reject" && !/phone numbers/.test(checked.reason)) return fail(422, checked.reason);
  }
  const store = await getStore();
  if (!store) return unavailable();
  const doc: BookingDoc = {
    _id: randomUUID(),
    ...body,
    reference: reference(),
    userId: session.user._id,
    email: session.user.email,
    name: session.user.name,
    destinationName: destination.name,
    status: "new",
    createdAt: new Date(),
  };
  await store.collection<BookingDoc>(STORE_COLLECTIONS.bookings).insertOne(doc);
  return NextResponse.json({ ok: true, reference: doc.reference }, { status: 201 });
}
