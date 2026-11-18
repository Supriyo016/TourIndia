import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { publishDue } from "@/features/content/cms";

export const dynamic = "force-dynamic";

/** True when the request carries `Authorization: Bearer <CRON_SECRET>` (how Vercel Cron calls routes). */
function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const given = request.headers.get("authorization") ?? "";
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(given), digest(`Bearer ${secret}`));
}

/**
 * Publishes scheduled CMS versions whose time has come and refreshes their pages.
 * Pages also treat a due version as live when they are rebuilt, so a late run only delays the refresh.
 */
export async function GET(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await publishDue()) });
  } catch (error) {
    console.error("[cron content]", error instanceof Error ? error.name : "");
    return NextResponse.json({ error: "Publishing failed." }, { status: 500 });
  }
}
