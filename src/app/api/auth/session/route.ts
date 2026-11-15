import { NextResponse, type NextRequest } from "next/server";
import { isEmailConfigured } from "@/lib/auth/email";
import { isGoogleConfigured } from "@/lib/auth/google";
import { isAuthConfigured, sessionFromRequest, toPublicUser } from "@/lib/auth/session";
import { isStoreAvailable } from "@/lib/database/store";

export const dynamic = "force-dynamic";

/** Who is signed in, and which sign-in methods are switched on. */
export async function GET(request: NextRequest) {
  const enabled = isStoreAvailable() && isAuthConfigured();
  const session = enabled ? await sessionFromRequest(request).catch(() => null) : null;
  return NextResponse.json(
    {
      user: session ? { ...toPublicUser(session.user), role: session.role } : null,
      methods: { email: enabled && isEmailConfigured(), google: enabled && isGoogleConfigured() },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
