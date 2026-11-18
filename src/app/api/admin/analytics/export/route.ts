import { NextResponse, type NextRequest } from "next/server";
import { unavailable } from "@/lib/api/json";
import { getStore } from "@/lib/database/store";
import { audit } from "@/lib/security/audit";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { parseRange, rangeDays, readTotals, readVitals, totalsCsv, vitalsAsTotals } from "@/features/analytics/report";

export const dynamic = "force-dynamic";

/**
 * The daily totals for a range as CSV. Needs `analytics.export`, and every export is written to
 * the audit log. Only totals are exported: raw events never leave the database. Web Vitals rows
 * use UTC days; everything else uses India time.
 */
export async function GET(request: NextRequest) {
  const context = await requireAdminApi(request, "analytics.export");
  if (isDenied(context)) return context;
  const range = parseRange(request.nextUrl.searchParams.get("days"));
  const store = await getStore();
  if (!store) return unavailable();
  try {
    const days = rangeDays(range);
    const from = days[0]!;
    const to = days[days.length - 1]!;
    const [totals, vitals] = await Promise.all([readTotals(store, from, to), readVitals(store, range)]);
    const rows = [...totals, ...vitalsAsTotals(vitals)];
    await audit({ action: "analytics.export", outcome: "ok", actorId: context.session.user._id, actorEmail: context.session.user.email, detail: `daily totals ${from} to ${to}, ${rows.length} rows` }, store);
    return new NextResponse(totalsCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tour-india-analytics-${from}-to-${to}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return unavailable();
  }
}
