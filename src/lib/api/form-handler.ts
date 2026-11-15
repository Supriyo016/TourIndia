import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { site } from "@/config/site";
import { getDatabase, isDatabaseConfigured } from "@/lib/database/mongo";
import { isAllowed, isSaltConfigured } from "@/lib/security/rate-limit";
import type { Db } from "mongodb";

const MAX_BODY_BYTES = 16 * 1024;

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/** Groups an IPv6 address by its first four blocks, so one network can't rotate through addresses. */
function normaliseAddress(address: string): string {
  return address.includes(":") ? address.split(":").slice(0, 4).join(":") : address;
}

/**
 * Forwarding headers can be forged by the client unless a trusted proxy sets them.
 * On Vercel the platform overwrites x-vercel-forwarded-for. Elsewhere, set
 * TRUSTED_PROXY_HOPS to the number of proxies in front of the app and the address
 * is read from the right of x-forwarded-for, which clients can't influence. With
 * neither, all visitors share one bucket: stricter, but it can't be bypassed.
 */
export function clientAddress(request: NextRequest): string {
  if (process.env.VERCEL) {
    const address = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
    if (address) return normaliseAddress(address);
  }
  const hops = Number(process.env.TRUSTED_PROXY_HOPS ?? 0);
  if (Number.isInteger(hops) && hops > 0) {
    const chain = (request.headers.get("x-forwarded-for") ?? "").split(",").map((part) => part.trim()).filter(Boolean);
    const address = chain[chain.length - hops];
    if (address) return normaliseAddress(address);
  }
  if (process.env.NODE_ENV === "production" && !warnedNoAddress) {
    warnedNoAddress = true;
    console.error("[security] No trusted client address: set TRUSTED_PROXY_HOPS when not on Vercel, or every visitor shares one rate limit.");
  }
  return "unknown";
}
let warnedNoAddress = false;

/** Stops reading as soon as the limit is passed, so a huge body is never held in memory. */
async function readBody(request: NextRequest): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return text + decoder.decode();
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
}

/** Browsers send Origin on cross-site POSTs, so this blocks cross-site form abuse. */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set([request.headers.get("host"), new URL(site.url).host].filter(Boolean));
  return allowed.has(originHost);
}

/**
 * The checks every public POST goes through before its body is trusted:
 * same origin, JSON, salt configured, rate limit, size limit.
 */
export async function guardJsonPost(
  request: NextRequest,
  bucket: string,
  limit: { max: number; windowSeconds: number },
): Promise<{ raw: string } | NextResponse> {
  if (!isSameOrigin(request)) return fail(403, "This request was not allowed.");
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return fail(415, "Send the form as JSON.");
  }
  if (!isSaltConfigured()) {
    console.error("[forms] RATE_LIMIT_SALT must be at least 32 characters in production");
    return fail(503, "This form isn't available right now. Please try again later.");
  }
  if (!(await isAllowed(bucket, clientAddress(request), limit))) {
    return fail(429, "Too many attempts. Please wait a while and try again.");
  }
  const raw = await readBody(request);
  if (raw === null) return fail(413, "That submission is too long.");
  return { raw };
}

/** The shared path every public form takes: guard, limit, validate, store. */
export function createFormHandler<S extends z.ZodType>({
  schema,
  bucket,
  limit,
  save,
}: {
  schema: S;
  bucket: string;
  limit: { max: number; windowSeconds: number };
  save: (db: Db, data: z.output<S>) => Promise<void>;
}) {
  return async function POST(request: NextRequest) {
    const guarded = await guardJsonPost(request, bucket, limit);
    if (guarded instanceof NextResponse) return guarded;

    let body: unknown;
    try {
      body = JSON.parse(guarded.raw);
    } catch {
      return fail(400, "That submission could not be read.");
    }

    // Filled only by bots. Report success so they learn nothing, but store nothing.
    if (typeof body === "object" && body !== null && (body as { company?: unknown }).company) {
      return NextResponse.json({ ok: true });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail(422, parsed.error.issues[0]?.message ?? "Please check the form and try again.");

    if (!isDatabaseConfigured()) {
      return fail(503, "This form isn't available right now. Please try again later.");
    }
    try {
      await save(await getDatabase(), parsed.data);
    } catch {
      console.error(`[forms] ${bucket}: failed to save submission`);
      return fail(503, "We couldn't save that just now. Please try again later.");
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  };
}
