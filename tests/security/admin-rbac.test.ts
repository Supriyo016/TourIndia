import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { currentStep, totpAt } from "@/lib/auth/totp";

/**
 * Admin roles, MFA and the tamper-evident logs, through the real routes and the in-memory store.
 * Sign-in codes are read from the development log line.
 */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  admin: typeof import("@/app/api/admin/route").POST;
  mfa: typeof import("@/app/api/admin/mfa/route");
};
let lastCode = "";
let ip = 1;
const ORIGIN = "http://localhost:3000";

function call(path: string, body: unknown, cookie = "") {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `203.0.113.${ip++ % 250}`, cookie },
    body: JSON.stringify(body),
  });
}
const get = (path: string, cookie: string) => new NextRequest(`${ORIGIN}${path}`, { headers: { host: "localhost:3000", cookie } });
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;
const someId = () => crypto.randomUUID();

async function signIn(email: string, purpose: "login" | "admin") {
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose }));
  const verified = await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose }));
  return { status: verified.status, cookie: cookieOf(verified) };
}

/** Signs in as an admin and sets up the authenticator. Returns the cookie, secret and recovery codes. */
async function enrolledAdmin(email: string) {
  const { cookie } = await signIn(email, "admin");
  const { secret } = (await (await routes.mfa.POST(call("/api/admin/mfa", { action: "start" }, cookie))).json()) as { secret: string };
  const enabled = await routes.mfa.POST(call("/api/admin/mfa", { action: "enable", code: totpAt(secret, currentStep()) }, cookie));
  expect(enabled.status).toBe(200);
  const { recoveryCodes } = (await enabled.json()) as { recoveryCodes: string[] };
  return { cookie, secret, recoveryCodes };
}

async function addMember(email: string, roles: string[]) {
  const db = (await getStore())!;
  const id = someId();
  await db.collection(STORE_COLLECTIONS.users).insertOne({ _id: id, email, name: "", role: "user", status: "active", interests: [], marketingConsent: false, profileComplete: true, createdAt: new Date(), lastLoginAt: new Date() });
  await db.collection(STORE_COLLECTIONS.adminMembers).insertOne({ _id: id, email, roles, createdAt: new Date() });
}

/**
 * A fresh bootstrap (Super Admin) address for each test: sign-in codes are limited per address
 * per hour, and that limit isn't cleared with the store.
 */
let owners = 0;
function newOwner() {
  const email = `owner${++owners}@example.com`;
  process.env.ADMIN_EMAILS = `${process.env.ADMIN_EMAILS},${email}`;
  return email;
}

/** The moderation API answers 404 or 409 for unknown ids once the permission check has passed. */
const passedChecks = (status: number) => ![401, 403].includes(status);

beforeAll(async () => {
  process.env.VERCEL = "1";
  process.env.ADMIN_EMAILS = "owner@example.com";
  vi.spyOn(console, "info").mockImplementation((message: unknown) => {
    const match = /code for \S+ is (\d{6})/.exec(String(message));
    if (match) lastCode = match[1]!;
  });
  routes = {
    request: (await import("@/app/api/auth/otp/request/route")).POST,
    verify: (await import("@/app/api/auth/otp/verify/route")).POST,
    admin: (await import("@/app/api/admin/route")).POST,
    mfa: await import("@/app/api/admin/mfa/route"),
  };
});

beforeEach(() => resetMemoryStore());

describe("admin MFA", () => {
  it("blocks admin actions until the authenticator step is done", async () => {
    const { cookie } = await signIn(newOwner(), "admin");
    const response = await routes.admin(call("/api/admin", { action: "edit", id: someId(), approve: true, note: "" }, cookie));
    expect(response.status).toBe(401);
    expect(((await response.json()) as { code: string }).code).toBe("mfa");
    const status = (await (await routes.mfa.GET(get("/api/admin/mfa", cookie))).json()) as { state: string; verified: boolean };
    expect(status).toMatchObject({ state: "none", verified: false });
  });

  it("refuses a wrong code, then turns on with a right one and allows admin actions", async () => {
    const { cookie } = await signIn(newOwner(), "admin");
    const { secret } = (await (await routes.mfa.POST(call("/api/admin/mfa", { action: "start" }, cookie))).json()) as { secret: string };
    const wrong = totpAt(secret, currentStep()) === "000000" ? "111111" : "000000";
    expect((await routes.mfa.POST(call("/api/admin/mfa", { action: "enable", code: wrong }, cookie))).status).toBe(401);
    expect((await routes.mfa.POST(call("/api/admin/mfa", { action: "enable", code: totpAt(secret, currentStep()) }, cookie))).status).toBe(200);
    expect(passedChecks((await routes.admin(call("/api/admin", { action: "edit", id: someId(), approve: true, note: "" }, cookie))).status)).toBe(true);
    // Set-up can't be restarted once it's on, so a stolen session can't replace the authenticator.
    expect((await routes.mfa.POST(call("/api/admin/mfa", { action: "start" }, cookie))).status).toBe(409);
  });

  it("never accepts the same authenticator code twice, and each recovery code only once", async () => {
    const owner = newOwner();
    const { secret, recoveryCodes } = await enrolledAdmin(owner);
    const { cookie } = await signIn(owner, "admin");
    const code = totpAt(secret, currentStep());
    // The code used to turn MFA on was this step's; it can't be replayed.
    expect((await routes.mfa.POST(call("/api/admin/mfa", { action: "verify", code }, cookie))).status).toBe(401);
    expect((await routes.mfa.POST(call("/api/admin/mfa", { action: "verify", code: recoveryCodes[0]! }, cookie))).status).toBe(200);
    const again = await signIn(owner, "admin");
    expect((await routes.mfa.POST(call("/api/admin/mfa", { action: "verify", code: recoveryCodes[0]! }, again.cookie))).status).toBe(401);
    const left = (await (await routes.mfa.GET(get("/api/admin/mfa", cookie))).json()) as { recoveryLeft: number };
    expect(left.recoveryLeft).toBe(9);
  });

  it("asks for a fresh code before blocking an account when the last check is old", async () => {
    const { cookie } = await enrolledAdmin(newOwner());
    const db = (await getStore())!;
    await db.collection(STORE_COLLECTIONS.sessions).updateOne({ role: "admin" }, { $set: { mfaAt: new Date(Date.now() - 20 * 60_000) } });
    const stale = await routes.admin(call("/api/admin", { action: "user", id: someId(), status: "blocked" }, cookie));
    expect(stale.status).toBe(401);
    expect(((await stale.json()) as { code: string }).code).toBe("reauth");
    // Moderation that isn't destructive still works on the older check.
    expect(passedChecks((await routes.admin(call("/api/admin", { action: "edit", id: someId(), approve: false, note: "" }, cookie))).status)).toBe(true);
  });

  it("refuses the MFA endpoint to anyone who isn't an admin", async () => {
    const { cookie } = await signIn("visitor@example.com", "login");
    expect((await routes.mfa.POST(call("/api/admin/mfa", { action: "start" }, cookie))).status).toBe(401);
    expect((await routes.mfa.GET(get("/api/admin/mfa", cookie))).status).toBe(401);
  });
});

describe("admin roles", () => {
  it("lets members with roles ask for admin codes, but not other people", async () => {
    await addMember("mod@example.com", ["moderator"]);
    expect((await signIn("mod@example.com", "admin")).status).toBe(200);
    expect((await signIn("stranger@example.com", "admin")).status).not.toBe(200);
  });

  it("gives each role only its own permissions", async () => {
    await addMember("mod@example.com", ["moderator"]);
    await addMember("analyst@example.com", ["analyst"]);
    const moderator = await enrolledAdmin("mod@example.com");
    const analyst = await enrolledAdmin("analyst@example.com");

    expect(passedChecks((await routes.admin(call("/api/admin", { action: "edit", id: someId(), approve: true, note: "" }, moderator.cookie))).status)).toBe(true);
    expect(passedChecks((await routes.admin(call("/api/admin", { action: "user", id: someId(), status: "blocked" }, moderator.cookie))).status)).toBe(true);

    const denied = await routes.admin(call("/api/admin", { action: "edit", id: someId(), approve: true, note: "" }, analyst.cookie));
    expect(denied.status).toBe(403);
    const db = (await getStore())!;
    const logged = await db.collection(STORE_COLLECTIONS.securityEvents).find({ action: "admin.denied" }).toArray();
    expect(logged.some((event) => event.actorEmail === "analyst@example.com")).toBe(true);
  });

  it("takes admin rights away as soon as a member's roles are removed", async () => {
    await addMember("mod@example.com", ["moderator"]);
    const { cookie } = await enrolledAdmin("mod@example.com");
    const db = (await getStore())!;
    await db.collection(STORE_COLLECTIONS.adminMembers).updateOne({ email: "mod@example.com" }, { $set: { roles: [] } });
    expect((await routes.admin(call("/api/admin", { action: "edit", id: someId(), approve: true, note: "" }, cookie))).status).toBe(403);
  });
});

describe("tamper-evident logs", () => {
  it("chains admin and security records and spots an edited one", async () => {
    await enrolledAdmin(newOwner());
    await signIn("visitor2@example.com", "login");
    const { verifyChain } = await import("@/lib/security/audit");
    const before = await verifyChain("security");
    expect(before.checked).toBe(2);
    expect(before.problems).toEqual([]);

    const db = (await getStore())!;
    const [first] = await db.collection(STORE_COLLECTIONS.securityEvents).find({}, { sort: { seq: 1 }, limit: 1 }).toArray();
    await db.collection(STORE_COLLECTIONS.securityEvents).updateOne({ _id: first!._id }, { $set: { outcome: "denied" } });
    const after = await verifyChain("security");
    expect(after.problems).toContainEqual(expect.objectContaining({ id: first!._id, problem: "edited" }));
  });

  it("never writes codes, addresses of failed sign-ins or secrets into the logs", async () => {
    const { secret, recoveryCodes } = await enrolledAdmin(newOwner());
    lastCode = "";
    await routes.request(call("/api/auth/otp/request", { email: "someone@example.com", purpose: "login" }));
    await routes.verify(call("/api/auth/otp/verify", { email: "someone@example.com", code: "000000", purpose: "login" }));
    const db = (await getStore())!;
    const all = JSON.stringify([...(await db.collection(STORE_COLLECTIONS.securityEvents).find({}).toArray()), ...(await db.collection(STORE_COLLECTIONS.audit).find({}).toArray())]);
    expect(all).not.toContain(secret);
    expect(all).not.toContain(recoveryCodes[0]);
    expect(all).not.toContain("someone@example.com");
    expect(all).toContain("login.login");
  });
});
