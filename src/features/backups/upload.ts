import "server-only";
import type { NextRequest } from "next/server";
import { fail } from "@/lib/api/json";
import { clientAddress, isSameOrigin } from "@/lib/api/form-handler";
import { isAllowed } from "@/lib/security/rate-limit";

/** Vercel refuses request bodies over 4.5 MB, so uploads stop a little below that. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Same-origin and content-type checks for a backup upload, before anything else is read. */
export function checkUploadRequest(request: NextRequest) {
  if (!isSameOrigin(request)) return fail(403, "This request was not allowed.");
  const type = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!type.startsWith("application/gzip") && !type.startsWith("application/octet-stream") && !type.startsWith("application/json")) return fail(415, "Upload the backup file itself.");
  return null;
}

/** Rate limit, then the body as bytes, refusing anything over the limit without reading it all. */
export async function readUpload(request: NextRequest, bucket: string, limit: { max: number; windowSeconds: number }) {
  if (!(await isAllowed(bucket, clientAddress(request), limit))) return fail(429, "Too many attempts. Please wait a while and try again.");
  if (Number(request.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES) return fail(413, "That file is over 4 MB, the most this page can take.");
  if (!request.body) return fail(400, "Choose a backup file first.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_UPLOAD_BYTES) {
      await reader.cancel();
      return fail(413, "That file is over 4 MB, the most this page can take.");
    }
    chunks.push(value);
  }
  if (total === 0) return fail(400, "Choose a backup file first.");
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
