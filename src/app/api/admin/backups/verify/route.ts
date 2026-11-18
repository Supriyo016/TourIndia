import { NextResponse, type NextRequest } from "next/server";
import { isDenied, requireAdminApi } from "@/features/admin/guard";
import { BackupError, verifyUpload } from "@/features/backups/service";
import { checkUploadRequest, readUpload } from "@/features/backups/upload";
import { fail } from "@/lib/api/json";
import { reportError } from "@/lib/monitoring/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Checks an uploaded backup's structure and checksum without writing any data. Needs `backup.create`. */
export async function POST(request: NextRequest) {
  const refused = checkUploadRequest(request);
  if (refused) return refused;
  const context = await requireAdminApi(request, "backup.create");
  if (isDenied(context)) return context;
  const bytes = await readUpload(request, "admin-backup-verify", { max: 20, windowSeconds: 3600 });
  if (bytes instanceof NextResponse) return bytes;
  try {
    return NextResponse.json(await verifyUpload(context.session.user, bytes));
  } catch (error) {
    if (error instanceof BackupError) return fail(error.status, error.message);
    void reportError("backup verify", error);
    return fail(503, "The file couldn't be checked. Please try again.");
  }
}
