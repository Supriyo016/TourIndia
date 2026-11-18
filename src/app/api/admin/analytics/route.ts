import { NextResponse, type NextRequest } from "next/server";
import { unavailable } from "@/lib/api/json";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { loadReport, parseRange } from "@/features/analytics/report";

export const dynamic = "force-dynamic";

/** The analytics figures for a range of days (7, 30, 90 or 365). Needs `analytics.view`. */
export async function GET(request: NextRequest) {
  const context = await requireAdminApi(request, "analytics.view");
  if (isDenied(context)) return context;
  try {
    return NextResponse.json({ report: await loadReport(parseRange(request.nextUrl.searchParams.get("days"))) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return unavailable();
  }
}
