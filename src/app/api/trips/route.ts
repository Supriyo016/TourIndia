import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  createTrip,
  deleteTrip,
  duplicateTrip,
  expensesSchema,
  listTrips,
  renameTrip,
  setExpenses,
  setStatus,
  shareTrip,
  TRIP_LIMIT,
  TripError,
  tripNameSchema,
  updatePlan,
} from "@/features/trips/service";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { sessionFromRequest } from "@/lib/auth/session";
import { getStore } from "@/lib/database/store";
import { reportError } from "@/lib/monitoring/errors";

export const dynamic = "force-dynamic";
const PRIVATE = { "Cache-Control": "private, no-store" };
const id = z.string().uuid();
// Settings and layout are checked in full by the service, which rebuilds the trip from the guide.
const plan = { input: z.unknown(), layout: z.unknown() };

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), name: tripNameSchema, ...plan }).strict(),
  z.object({ action: z.literal("import"), trips: z.array(z.object({ name: tripNameSchema, ...plan }).strict()).max(TRIP_LIMIT) }).strict(),
  z.object({ action: z.literal("update-plan"), id, ...plan }).strict(),
  z.object({ action: z.literal("rename"), id, name: tripNameSchema }).strict(),
  z.object({ action: z.literal("archive"), id, archived: z.boolean() }).strict(),
  z.object({ action: z.literal("duplicate"), id }).strict(),
  z.object({ action: z.literal("delete"), id }).strict(),
  z.object({ action: z.literal("share"), id, on: z.boolean() }).strict(),
  z.object({ action: z.literal("expenses"), id, expenses: expensesSchema }).strict(),
]);

/** The signed-in person's trips, newest first. */
export async function GET(request: NextRequest) {
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  if (!(await getStore())) return unavailable();
  return NextResponse.json({ trips: await listTrips(session.user._id) }, { headers: PRIVATE });
}

export async function POST(request: NextRequest) {
  // A 45-day trip, or a guest's trips moving over, can pass the usual 16 KB, so trips allow 64 KB.
  const body = await readJson(request, schema, "trips", { max: 200, windowSeconds: 600, maxBytes: 64 * 1024 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  const userId = session.user._id;
  try {
    switch (body.action) {
      case "create":
        return NextResponse.json({ trip: await createTrip(userId, body) }, { status: 201, headers: PRIVATE });
      case "import": {
        // A guest's trips from this browser. Ones that can't be rebuilt are skipped, not fatal.
        let added = 0;
        for (const trip of body.trips) {
          try {
            await createTrip(userId, trip);
            added += 1;
          } catch (error) {
            if (!(error instanceof TripError) || error.status !== 422) throw error;
          }
        }
        return NextResponse.json({ added }, { headers: PRIVATE });
      }
      case "update-plan":
        await updatePlan(userId, body.id, body);
        break;
      case "rename":
        await renameTrip(userId, body.id, body.name);
        break;
      case "archive":
        await setStatus(userId, body.id, body.archived ? "archived" : "active");
        break;
      case "duplicate":
        return NextResponse.json({ trip: await duplicateTrip(userId, body.id) }, { status: 201, headers: PRIVATE });
      case "delete":
        await deleteTrip(userId, body.id);
        break;
      case "share":
        return NextResponse.json({ shareId: await shareTrip(userId, body.id, body.on) }, { headers: PRIVATE });
      case "expenses":
        await setExpenses(userId, body.id, body.expenses);
        break;
    }
    return NextResponse.json({ ok: true }, { headers: PRIVATE });
  } catch (error) {
    if (error instanceof TripError) return fail(error.status, error.message);
    void reportError("trips", error);
    return unavailable();
  }
}
