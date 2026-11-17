import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { submitAppeal } from "@/features/admin/restrictions";
import { readJson, unavailable } from "@/lib/api/json";
import { hmac } from "@/lib/auth/session";
import { isStoreAvailable } from "@/lib/database/store";
import { isAllowed } from "@/lib/security/rate-limit";

const schema = z.object({ email: z.email().max(254), message: z.string().trim().min(20, "Tell us a little more (at least 20 characters).").max(2000) }).strict();

// The same answer whatever the address, so the form can't reveal who has an account or a restriction.
const RECEIVED = { ok: true, message: "Thanks. If that address has a restricted account, your appeal has been passed to an admin who didn't make the original decision." };

/** A restricted person asks for a review. One appeal per restriction; a decided appeal is final. */
export async function POST(request: NextRequest) {
  if (!isStoreAvailable()) return unavailable();
  const body = await readJson(request, schema, "appeal", { max: 5, windowSeconds: 3600 });
  if (body instanceof NextResponse) return body;
  if (!(await isAllowed("appeal-email", hmac(`email:${body.email.toLowerCase()}`), { max: 3, windowSeconds: 86_400 }))) return NextResponse.json(RECEIVED);
  try {
    await submitAppeal(body.email, body.message);
    return NextResponse.json(RECEIVED);
  } catch {
    return unavailable();
  }
}
