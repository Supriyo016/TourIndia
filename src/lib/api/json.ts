import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { guardJsonPost } from "./form-handler";

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export const unavailable = () => fail(503, "This feature isn't available right now. Please try again later.");

/**
 * Same-origin check, JSON only, rate limit, size limit, then schema validation.
 * Used by every route that changes data. Returns the parsed body or an error response.
 */
export async function readJson<S extends z.ZodType>(
  request: NextRequest,
  schema: S,
  bucket: string,
  limit: { max: number; windowSeconds: number },
): Promise<z.output<S> | NextResponse> {
  const guarded = await guardJsonPost(request, bucket, limit);
  if (guarded instanceof NextResponse) return guarded;
  let body: unknown;
  try {
    body = JSON.parse(guarded.raw || "{}");
  } catch {
    return fail(400, "That request could not be read.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(422, parsed.error.issues[0]?.message ?? "Please check the details and try again.");
  return parsed.data;
}
