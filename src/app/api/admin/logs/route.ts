import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { exportLogs, parseLogQuery, VERIFY_LIMIT } from "@/features/monitoring/logs";
import { readJson, unavailable } from "@/lib/api/json";
import { audit, verifyChain } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

/** CSV export of the audit or security log with the page's filters. Needs `logs.view`; each export is audited. */
export async function GET(request: NextRequest) {
  const context = await requireAdminApi(request, "logs.view");
  if (isDenied(context)) return context;
  const query = parseLogQuery(Object.fromEntries(request.nextUrl.searchParams));
  const result = await exportLogs(query);
  if (!result) return unavailable();
  const { session } = context;
  await audit({ actorId: session.user._id, actorEmail: session.user.email, action: "logs.export", target: query.kind, outcome: "ok", detail: `${result.rows} rows`, after: { action: query.action, actor: query.actor ? "set" : undefined, outcome: query.outcome, from: query.from, to: query.to } });
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(result.csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tour-india-${query.kind}-log-${day}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}

const schema = z.object({ action: z.literal("verify"), kind: z.enum(["audit", "security"]) }).strict();

/** Checks the hash chain of the most recent records and reports edited records and gaps. */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-logs", { max: 30, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, "logs.view");
  if (isDenied(context)) return context;
  const result = await verifyChain(body.kind, VERIFY_LIMIT);
  const { session } = context;
  await audit({ actorId: session.user._id, actorEmail: session.user.email, action: "logs.verify", target: body.kind, outcome: "ok", detail: `${result.checked} checked, ${result.problems.length} problems` });
  return NextResponse.json({ checked: result.checked, limit: VERIFY_LIMIT, problems: result.problems.slice(0, 100) });
}
