import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { listNotifications, markRead, unreadCount } from "@/features/notifications/service";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { sessionFromRequest } from "@/lib/auth/session";
import { isStoreAvailable } from "@/lib/database/store";
import { reportError } from "@/lib/monitoring/errors";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** The signed-in person's unread count and, unless `?count=1`, their latest notifications. */
export async function GET(request: NextRequest) {
  if (!isStoreAvailable()) return unavailable();
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  try {
    const unread = await unreadCount(session.user._id);
    if (request.nextUrl.searchParams.get("count") === "1") return NextResponse.json({ unread }, { headers: NO_STORE });
    const { rows } = await listNotifications(session.user._id, { limit: 10 });
    return NextResponse.json({ unread, items: rows }, { headers: NO_STORE });
  } catch (error) {
    void reportError("notifications", error);
    return unavailable();
  }
}

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("read"), ids: z.array(z.string().uuid()).min(1).max(100) }).strict(),
  z.object({ action: z.literal("read-all") }).strict(),
]);

/** Marks the person's own notifications as read. */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "notifications", { max: 120, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const session = await sessionFromRequest(request).catch(() => null);
  if (!session) return fail(401, "Please sign in.");
  try {
    const changed = await markRead(session.user._id, body.action === "read-all" ? "all" : body.ids);
    return NextResponse.json({ ok: true, changed, unread: await unreadCount(session.user._id) });
  } catch (error) {
    void reportError("notifications", error);
    return unavailable();
  }
}
