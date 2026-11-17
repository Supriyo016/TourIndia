import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";

/**
 * The dashboard is a server component. These tests run the real page with the real
 * session check against the in-memory store; only the request cookie jar and the
 * redirect are stand-ins for what Next.js provides.
 */
const jar = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined) }),
}));

class Redirected extends Error {
  constructor(readonly to: string) {
    super(`redirect ${to}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Redirected(to);
  },
}));

const SECRETS = { GROQ_API_KEY: "gsk_live_do_not_show_123", RESEND_API_KEY: "re_do_not_show_456", AUTH_GOOGLE_SECRET: "google_do_not_show_789", AUTH_GOOGLE_ID: "client-id-do-not-show" };
const saved: Record<string, string | undefined> = {};

let Page: typeof import("@/app/admin/dashboard/page").default;
let metadata: typeof import("@/app/admin/dashboard/page").metadata;
let store: typeof import("@/lib/database/store");
let session: typeof import("@/lib/auth/session");

beforeAll(async () => {
  for (const key of ["ADMIN_EMAILS", ...Object.keys(SECRETS)]) saved[key] = process.env[key];
  process.env.ADMIN_EMAILS = "owner@example.com";
  Object.assign(process.env, SECRETS);
  ({ default: Page, metadata } = await import("@/app/admin/dashboard/page"));
  store = await import("@/lib/database/store");
  session = await import("@/lib/auth/session");
});

afterAll(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

async function signedIn(email: string, role: "user" | "admin", status: "active" | "blocked" = "active") {
  const db = (await store.getStore())!;
  const id = crypto.randomUUID();
  await db.collection(store.STORE_COLLECTIONS.users).insertOne({ _id: id, email, name: "Asha Rao", role, status, interests: [], marketingConsent: false, profileComplete: true, createdAt: new Date(), lastLoginAt: new Date() });
  const { token } = await session.createSession(id, role);
  // Admin pages need MFA completed in the session; tests of the MFA step itself live in admin-mfa.test.ts.
  if (role === "admin") await db.collection(store.STORE_COLLECTIONS.sessions).updateOne({ userId: id }, { $set: { mfaAt: new Date() } });
  jar.set("ti_auth", token);
}

async function outcome(): Promise<{ redirect: string } | { html: string }> {
  try {
    const element = (await Page()) as ReactElement;
    return { html: renderToStaticMarkup(element) };
  } catch (error) {
    if (error instanceof Redirected) return { redirect: error.to };
    throw error;
  }
}

beforeEach(async () => {
  store.resetMemoryStore();
  jar.clear();
  const db = (await store.getStore())!;
  // Data that must never reach anyone but an admin.
  await db.collection(store.STORE_COLLECTIONS.bookings).insertOne({ _id: "b1", reference: "TI-SECRET", name: "Meera Iyer", email: "meera@example.com", phone: "+91 90000 11111", destinationName: "Goa", status: "new", createdAt: new Date() });
});

describe("admin dashboard access", () => {
  it("is not indexed", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("redirects visitors with no session", async () => {
    expect(await outcome()).toEqual({ redirect: "/admin/login" });
  });

  it("redirects an unknown or forged token", async () => {
    jar.set("ti_auth", "not-a-real-token");
    expect(await outcome()).toEqual({ redirect: "/admin/login" });
  });

  it("redirects a signed-in visitor without the admin role", async () => {
    await signedIn("reader@example.com", "user");
    expect(await outcome()).toEqual({ redirect: "/admin/login" });
  });

  it("redirects an admin session whose address is no longer on the admin list", async () => {
    await signedIn("former@example.com", "admin");
    expect(await outcome()).toEqual({ redirect: "/admin/login" });
  });

  it("redirects an admin user session (not from the emailed admin code)", async () => {
    await signedIn("owner@example.com", "user");
    expect(await outcome()).toEqual({ redirect: "/admin/login" });
  });

  it("redirects a blocked admin", async () => {
    await signedIn("owner@example.com", "admin", "blocked");
    expect(await outcome()).toEqual({ redirect: "/admin/login" });
  });

  it("shows the dashboard to an admin, without secrets or personal details", async () => {
    await signedIn("owner@example.com", "admin");
    const result = await outcome();
    expect("html" in result).toBe(true);
    const html = (result as { html: string }).html;
    expect(html).toContain("Dashboard");
    expect(html).toContain("TI-SECRET");
    expect(html).toContain("Meera");
    expect(html).not.toContain("Iyer");
    expect(html).not.toContain("meera@example.com");
    expect(html).not.toContain("90000");
    for (const value of Object.values(SECRETS)) expect(html).not.toContain(value);
    expect(html).toContain("Groq");
  });
});
