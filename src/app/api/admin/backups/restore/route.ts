import { NextResponse, type NextRequest } from "next/server";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { BackupError, dryRun, restore } from "@/features/backups/service";
import { checkUploadRequest, readUpload } from "@/features/backups/upload";
import { fail } from "@/lib/api/json";
import { reportError } from "@/lib/monitoring/errors";
import { securityEvent } from "@/lib/security/audit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Restores from an uploaded backup. Super Admins only, with `backup.restore` and an authenticator
 * code from the last 15 minutes. `?mode=dry-run` reports what would change and writes nothing;
 * `?mode=restore` also needs the typed confirmation (header `x-restore-confirm`) and a dry run of
 * the same file by the same admin in the last 30 minutes. Both are audited.
 */
export async function POST(request: NextRequest) {
  const refused = checkUploadRequest(request);
  if (refused) return refused;
  const mode = request.nextUrl.searchParams.get("mode");
  if (mode !== "dry-run" && mode !== "restore") return fail(400, "Choose a dry run or a restore.");
  const context = await requireAdminApi(request, "backup.restore", { fresh: true });
  if (isDenied(context)) return context;
  const { session, access } = context;
  if (!access.superAdmin) {
    await securityEvent({ action: "admin.denied", outcome: "denied", actorId: session.user._id, actorEmail: session.user.email, detail: "backup restore needs a Super Admin" });
    return fail(403, "Only a Super Admin can restore a backup.");
  }
  const bytes = await readUpload(request, "admin-backup-restore", { max: 20, windowSeconds: 3600 });
  if (bytes instanceof NextResponse) return bytes;
  try {
    if (mode === "dry-run") return NextResponse.json(await dryRun(session.user, bytes));
    return NextResponse.json(await restore(session.user, bytes, decodeURIComponent(request.headers.get("x-restore-confirm") ?? "")));
  } catch (error) {
    if (error instanceof BackupError) return fail(error.status, error.message);
    void reportError("backup restore", error);
    return fail(503, "The restore stopped part-way. Check the logs, then run it again: records already restored are skipped.");
  }
}
