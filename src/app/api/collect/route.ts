import { NextResponse, type NextRequest } from "next/server";
import { clientAddress, isSameOrigin, readBody } from "@/lib/api/form-handler";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import { getStore } from "@/lib/database/store";
import { isAllowed, isSaltConfigured } from "@/lib/security/rate-limit";
import { describeVisitor, record } from "@/features/analytics/collect";
import { beaconSchema } from "@/features/analytics/schema";

export const dynamic = "force-dynamic";

/** Beacons are small: at most 20 events. */
const MAX_BYTES = 4 * 1024;

const done = () => new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
const fail = (status: number, error: string) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

/**
 * The analytics beacon's endpoint. Same origin only, rate limited, 4 KB, checked against a
 * fixed schema. It records nothing unless the visitor's cookie choice allows analytics, and
 * nothing for bots or prefetches; those still get a quiet 204 so they learn nothing.
 * `navigator.sendBeacon` sends text/plain, so that is accepted alongside JSON.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return fail(403, "This request was not allowed.");
  const type = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!type.startsWith("application/json") && !type.startsWith("text/plain")) return fail(415, "Send the events as JSON.");
  if (!isSaltConfigured()) return fail(503, "Analytics isn't available right now.");

  const raw = await readBody(request, MAX_BYTES);
  if (raw === null) return fail(413, "That is too much at once.");

  if (parseConsent(request.cookies.get(CONSENT_COOKIE)?.value)?.analytics !== true) return done();
  const visitor = describeVisitor(request.headers);
  if (!visitor) return done();

  const address = clientAddress(request);
  if (!(await isAllowed("collect", address, { max: 240, windowSeconds: 3600 }))) return fail(429, "Too many events. Please slow down.");

  let body: unknown;
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    return fail(400, "Those events could not be read.");
  }
  const parsed = beaconSchema.safeParse(body);
  if (!parsed.success) return fail(422, "Those events weren't in the expected form.");

  const store = await getStore();
  if (!store) return done();
  try {
    await record(store, parsed.data.events, visitor, { address, userAgent: request.headers.get("user-agent") ?? "" }, new Date(), request.nextUrl.hostname);
  } catch (error) {
    console.error("[analytics] could not record events", error instanceof Error ? error.name : "");
  }
  return done();
}
