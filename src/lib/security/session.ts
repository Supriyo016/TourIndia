import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * An anonymous, signed session used only to limit abuse of the assistant.
 * It identifies a browser session, not a person. HttpOnly keeps it from scripts,
 * SameSite=Strict keeps it off cross-site requests, and the __Host- prefix makes
 * browsers refuse any version set without Secure or for another path or domain.
 */
const SESSION_SECONDS = 60 * 60 * 24;
const HOST_NAME = "__Host-ti_sid";
const DEV_NAME = "ti_sid";

const secret = () => process.env.COOKIE_SECRET ?? process.env.RATE_LIMIT_SALT ?? (process.env.NODE_ENV === "production" ? "" : "tour-india-dev-only");

export const isSessionConfigured = () => secret().length >= 16;

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionValue(now = Date.now()): string {
  const id = randomBytes(16).toString("base64url");
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  const payload = `${id}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the session id, or null if the value is missing, forged or expired. */
export function verifySessionValue(value: string | undefined, now = Date.now()): string | null {
  if (!value || !isSessionConfigured()) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [id, expires, signature] = parts as [string, string, string];
  const expected = Buffer.from(sign(`${id}.${expires}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(expires) * 1000 <= now) return null;
  return id;
}

const isSecureRequest = (request: NextRequest) => request.nextUrl.protocol === "https:";

export function readSession(request: NextRequest): string | null {
  return verifySessionValue(request.cookies.get(HOST_NAME)?.value ?? request.cookies.get(DEV_NAME)?.value);
}

export function sessionCookieHeader(request: NextRequest, value: string): string {
  const secure = isSecureRequest(request);
  const name = secure ? HOST_NAME : DEV_NAME;
  return `${name}=${value}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
}
