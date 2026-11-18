import { expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { currentStep, totpAt } from "@/lib/auth/totp";

/**
 * Signs people in through the real OTP routes (the emailed code is read from the console.info
 * stand-in) and sets up admins with real TOTP, like the other admin security tests.
 * Call `setup()` in beforeAll.
 */
export const ORIGIN = "http://localhost:3000";
let lastCode = "";
let ip = 1;
let count = 0;
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  team: typeof import("@/app/api/admin/team/route").POST;
  mfa: typeof import("@/app/api/admin/mfa/route").POST;
};

export async function setup() {
  process.env.VERCEL = "1";
  process.env.ADMIN_EMAILS = "nobody@example.com";
  vi.spyOn(console, "info").mockImplementation((message: unknown) => {
    const match = /code for \S+ is (\d{6})/.exec(String(message));
    if (match) lastCode = match[1]!;
  });
  routes = {
    request: (await import("@/app/api/auth/otp/request/route")).POST,
    verify: (await import("@/app/api/auth/otp/verify/route")).POST,
    team: (await import("@/app/api/admin/team/route")).POST,
    mfa: (await import("@/app/api/admin/mfa/route")).POST,
  };
}

export const call = (path: string, body: unknown, cookie = "", headers: Record<string, string> = {}) =>
  new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `198.19.2.${ip++ % 250}`, cookie, ...headers },
    body: JSON.stringify(body),
  });

export const get = (path: string, cookie = "", headers: Record<string, string> = {}) =>
  new NextRequest(`${ORIGIN}${path}`, { method: "GET", headers: { origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `198.19.3.${ip++ % 250}`, cookie, ...headers } });

const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;
export const fresh = (name: string) => `${name}${++count}-${Date.now() % 100000}@example.com`;

export function owner() {
  const email = fresh("owner");
  process.env.ADMIN_EMAILS = `${process.env.ADMIN_EMAILS},${email}`;
  return email;
}

export async function signIn(email: string, purpose: "login" | "admin" = "login") {
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose }));
  return cookieOf(await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose })));
}

/** A signed-in admin who has set up and passed MFA in this session. */
export async function admin(email: string) {
  const cookie = await signIn(email, "admin");
  const { secret } = (await (await routes.mfa(call("/api/admin/mfa", { action: "start" }, cookie))).json()) as { secret: string };
  expect((await routes.mfa(call("/api/admin/mfa", { action: "enable", code: totpAt(secret, currentStep()) }, cookie))).status).toBe(200);
  return cookie;
}

/** A new admin with one built-in role, granted by `boss`. */
export async function withRole(boss: string, role: string) {
  const email = fresh(role);
  await signIn(email);
  expect((await routes.team(call("/api/admin/team", { action: "set-roles", email, roles: [role] }, boss))).status).toBe(200);
  const db = (await getStore())!;
  const user = await db.collection(STORE_COLLECTIONS.users).findOne({ email });
  return { email, id: user!._id, cookie: await admin(email) };
}

/** Makes the admin's MFA check older than 15 minutes, so fresh actions ask again. */
export async function staleMfa(userId: string) {
  const db = (await getStore())!;
  const sessions = await db.collection(STORE_COLLECTIONS.sessions).find({ userId }).toArray();
  for (const session of sessions) await db.collection(STORE_COLLECTIONS.sessions).updateOne({ _id: session._id }, { $set: { mfaAt: new Date(Date.now() - 20 * 60_000) } });
}

/** The session token from a cookie header, for page tests that mock next/headers. */
export const tokenOf = (cookie: string) => cookie.split("=").slice(1).join("=");
