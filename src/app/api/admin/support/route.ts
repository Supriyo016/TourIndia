import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { addNote, TicketError, updateTicket } from "@/features/support/tickets";
import { CATEGORY_IDS, PRIORITY_IDS, STATUS_IDS } from "@/features/support/types";
import { readJson, unavailable } from "@/lib/api/json";
import { reportError } from "@/lib/monitoring/errors";

export const dynamic = "force-dynamic";

const reference = z.string().regex(/^S-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update"),
    reference,
    status: z.enum(STATUS_IDS).optional(),
    priority: z.enum(PRIORITY_IDS).optional(),
    category: z.enum(CATEGORY_IDS).optional(),
    assignTo: z.string().uuid().nullable().optional(),
  }).strict(),
  z.object({ action: z.literal("note"), reference, text: z.string().trim().min(1).max(2000) }).strict(),
]);

/** Ticket changes and internal notes. Needs `support.manage`; every change is audited. */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-support", { max: 300, windowSeconds: 600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, "support.manage");
  if (isDenied(context)) return context;
  const actor = { user: context.session.user, access: context.access };
  try {
    if (body.action === "note") await addNote(actor, body.reference, body.text);
    else await updateTicket(actor, body.reference, { status: body.status, priority: body.priority, category: body.category, assignTo: body.assignTo });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof TicketError) return NextResponse.json({ error: error.message }, { status: error.status });
    void reportError("admin support", error);
    return unavailable();
  }
}
