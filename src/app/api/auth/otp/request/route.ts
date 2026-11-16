import { after, NextResponse, type NextRequest } from "next/server";
import { requestCodeSchema } from "@/features/auth/schemas";
import { fail, readJson, unavailable } from "@/lib/api/json";
import { isEmailConfigured, sendCodeEmail } from "@/lib/auth/email";
import { issueCode } from "@/lib/auth/otp";
import { adminEmails, hmac, isAuthConfigured } from "@/lib/auth/session";
import { isStoreAvailable } from "@/lib/database/store";
import { isAllowed } from "@/lib/security/rate-limit";

// The same reply whether or not the address has an account, so the form can't be used to find out.
const SENT = { ok: true, message: "If that address can receive email, a 6-digit code is on its way. It expires in 10 minutes." };

function runAfterResponse(task: () => Promise<unknown>) {
  const logged = () => task().then((ok) => ok || console.error("[auth] a sign-in email could not be sent"));
  try {
    after(logged);
  } catch {
    // Outside a request (tests), run now.
    void logged();
  }
}

export async function POST(request: NextRequest) {
  if (!isStoreAvailable() || !isAuthConfigured() || !isEmailConfigured()) return unavailable();
  const body = await readJson(request, requestCodeSchema, "otp-request", { max: 10, windowSeconds: 3600 });
  if (body instanceof NextResponse) return body;

  // Per address as well as per network, so one inbox can't be flooded from many addresses.
  if (!(await isAllowed("otp-email", hmac(`email:${body.email}`), { max: 5, windowSeconds: 3600 }))) {
    return fail(429, "Too many codes for this address. Please wait an hour and try again.");
  }
  if (body.purpose === "admin" && !adminEmails().has(body.email)) return NextResponse.json(SENT);

  try {
    const code = await issueCode(body.email, body.purpose);
    // Sent after the reply, so response time doesn't reveal which addresses get a code.
    if (code) runAfterResponse(() => sendCodeEmail(body.email, code, body.purpose));
  } catch {
    return unavailable();
  }
  return NextResponse.json(SENT);
}
