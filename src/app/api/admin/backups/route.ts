import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { backupStream, BackupError } from "@/features/backups/service";
import { fail, readJson } from "@/lib/api/json";
import { reportError } from "@/lib/monitoring/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.discriminatedUnion("action", [z.object({ action: z.literal("check") }).strict(), z.object({ action: z.literal("export") }).strict()]);

/**
 * Creates a backup and streams it as a download. It holds everyone's personal data, so it needs
 * `backup.create` and an authenticator code from the last 15 minutes. "check" lets the page ask for
 * that code before starting the download.
 */
export async function POST(request: NextRequest) {
  const body = await readJson(request, schema, "admin-backup", { max: 10, windowSeconds: 3600 });
  if (body instanceof NextResponse) return body;
  const context = await requireAdminApi(request, "backup.create", { fresh: true });
  if (isDenied(context)) return context;
  if (body.action === "check") return NextResponse.json({ ok: true });
  try {
    const { stream, filename } = await backupStream(context.session.user);
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof BackupError) return fail(error.status, error.message);
    void reportError("backup create", error);
    return fail(503, "The backup couldn't be made. Please try again.");
  }
}
