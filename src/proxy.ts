import { NextResponse, type NextRequest } from "next/server";
import { sessionFromRequest } from "@/lib/auth/session";
import { getSettings } from "@/features/settings/settings";

/**
 * Maintenance mode. While it's on, visitors get a friendly page (503) and public APIs refuse
 * changes; admins can still sign in and use /admin, and a signed-in admin sees the site as normal.
 * When it's off this costs one cached read every 30 seconds per server, and a slow or missing
 * database never takes the site down (it fails open).
 */
const ALWAYS_OPEN = [/^\/admin(\/|$)/, /^\/api\/admin(\/|$)/, /^\/api\/auth(\/|$)/, /^\/api\/cron(\/|$)/, /^\/maintenance$/];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (ALWAYS_OPEN.some((pattern) => pattern.test(pathname))) return NextResponse.next();
  const settings = await getSettings({ timeoutMs: 500 });
  if (!settings.maintenance.on) return NextResponse.next();
  // Only checked during maintenance, so normal visits never wait on a session lookup.
  if (request.cookies.size) {
    const session = await sessionFromRequest(request).catch(() => null);
    if (session?.role === "admin") return NextResponse.next();
  }
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: settings.maintenance.message, code: "maintenance" }, { status: 503, headers: { "Retry-After": "600", "Cache-Control": "no-store" } });
  }
  const response = NextResponse.rewrite(new URL("/maintenance", request.url), { status: 503 });
  response.headers.set("Retry-After", "600");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  // Pages and APIs only: never build assets, images or files with an extension.
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
