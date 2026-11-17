import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { currentStep, totpAt } from "@/lib/auth/totp";

/** Suspensions, bans, expiry, appeals and the user directory, through the real routes. */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  users: typeof import("@/app/api/admin/users/route").POST;
  team: typeof import("@/app/api/admin/team/route").POST;
  mfa: typeof import("@/app/api/admin/mfa/route").POST;
  appeal: typeof import("@/app/api/appeal/route").POST;
};
let lastCode = "";
let ip = 1;
let addresses = 0;
const ORIGIN = "http://localhost:3000";

const call = (path: string, body: unknown, cookie = "") =>
  new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `198.18.0.${ip++ % 250}`, cookie },
    body: JSON.stringify(body),
  });
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;
const fresh = (name: string) => `${name}${++addresses}@example.com`;
function owner() {
  const email = fresh("owner");
  process.env.ADMIN_EMAILS = `${process.env.ADMIN_EMAILS},${email}`;
  return email;
}

/** Signs in; returns the verify status and cookie. */
async function signIn(email: string, purpose: "login" | "admin" = "login") {
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose }));
  const verified = await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose }));
  return { status: verified.status, cookie: cookieOf(verified), body: (await verified.json()) as { error?: string } };
}

async function admin(email: string) {
  const { cookie } = await signIn(email, "admin");
  const { secret } = (await (await routes.mfa(call("/api/admin/mfa", { action: "start" }, cookie))).json()) as { secret: string };
  expect((await routes.mfa(call("/api/admin/mfa", { action: "enable", code: totpAt(secret, currentStep()) }, cookie))).status).toBe(200);
  return cookie;
}

async function idOf(email: string) {
  const db = (await getStore())!;
  return (await db.collection(STORE_COLLECTIONS.users).findOne({ email }))!._id;
}

const suspend = (cookie: string, userId: string, days: number | null = 7, kind: "suspension" | "ban" = "suspension") =>
  routes.users(call("/api/admin/users", { action: "restrict", userId, kind, days, reason: "spam", note: "Posted the same advert on 12 pages." }, cookie));

beforeAll(async () => {
  process.env.VERCEL = "1";
  process.env.ADMIN_EMAILS = "nobody@example.com";
  vi.spyOn(console, "info").mockImplementation((message: unknown) => {
    const match = /code for \S+ is (\d{6})/.exec(String(message));
    if (match) lastCode = match[1]!;
  });
  routes = {
    request: (await import("@/app/api/auth/otp/request/route")).POST,
    verify: (await import("@/app/api/auth/otp/verify/route")).POST,
    users: (await import("@/app/api/admin/users/route")).POST,
    team: (await import("@/app/api/admin/team/route")).POST,
    mfa: (await import("@/app/api/admin/mfa/route")).POST,
    appeal: (await import("@/app/api/appeal/route")).POST,
  };
});

beforeEach(() => resetMemoryStore());

describe("restrictions", () => {
  it("suspends an account: signs it out everywhere and refuses sign-in with a pointer to appeals", async () => {
    const boss = await admin(owner());
    const email = fresh("spammer");
    const { cookie } = await signIn(email);
    expect((await suspend(boss, await idOf(email))).status).toBe(200);
    const db = (await getStore())!;
    expect(await db.collection(STORE_COLLECTIONS.sessions).countDocuments({ userId: await idOf(email) })).toBe(0);
    expect(cookie).toBeTruthy();
    const again = await signIn(email);
    expect(again.status).toBe(403);
    expect(again.body.error).toMatch(/appeal/);
    const user = await db.collection(STORE_COLLECTIONS.users).findOne({ email });
    expect(user).toMatchObject({ status: "blocked" });
    expect(user!.restrictedUntil).toBeInstanceOf(Date);
  });

  it("restores a timed restriction on the next sign-in after it ends, and records why", async () => {
    const boss = await admin(owner());
    const email = fresh("spammer");
    await signIn(email);
    const userId = await idOf(email);
    await suspend(boss, userId, 1);
    const db = (await getStore())!;
    const past = new Date(Date.now() - 60_000);
    await db.collection(STORE_COLLECTIONS.users).updateOne({ _id: userId }, { $set: { restrictedUntil: past } });
    const [row] = await db.collection(STORE_COLLECTIONS.restrictions).find({ userId }).toArray();
    await db.collection(STORE_COLLECTIONS.restrictions).updateOne({ _id: row!._id }, { $set: { endsAt: past } });
    expect((await signIn(email)).status).toBe(200);
    expect(await db.collection(STORE_COLLECTIONS.restrictions).findOne({ _id: row!._id })).toMatchObject({ liftedBy: "expiry" });
  });

  it("keeps permanent bans until an admin lifts them", async () => {
    const boss = await admin(owner());
    const email = fresh("troll");
    await signIn(email);
    const userId = await idOf(email);
    expect((await suspend(boss, userId, null, "ban")).status).toBe(200);
    expect((await signIn(email)).status).toBe(403);
    const db = (await getStore())!;
    const [row] = await db.collection(STORE_COLLECTIONS.restrictions).find({ userId }).toArray();
    expect(row).toMatchObject({ permanent: true });
    expect((await routes.users(call("/api/admin/users", { action: "lift", restrictionId: row!._id, note: "Spoke to them by email." }, boss))).status).toBe(200);
    expect((await signIn(email)).status).toBe(200);
  });

  it("refuses to restrict yourself, an owner, an already-restricted account, or another admin without Super Admin", async () => {
    const ownerEmail = owner();
    const boss = await admin(ownerEmail);
    expect((await suspend(boss, await idOf(ownerEmail))).status).toBe(403);

    const otherOwner = owner();
    await signIn(otherOwner);
    expect((await suspend(boss, await idOf(otherOwner))).status).toBe(403);

    const email = fresh("spammer");
    await signIn(email);
    await suspend(boss, await idOf(email));
    expect((await suspend(boss, await idOf(email))).status).toBe(409);

    const modEmail = fresh("mod");
    const editorEmail = fresh("editor");
    await signIn(modEmail);
    await signIn(editorEmail);
    await routes.team(call("/api/admin/team", { action: "set-roles", email: modEmail, roles: ["moderator"] }, boss));
    await routes.team(call("/api/admin/team", { action: "set-roles", email: editorEmail, roles: ["editor"] }, boss));
    const mod = await admin(modEmail);
    expect((await suspend(mod, await idOf(editorEmail))).status).toBe(403);
  });

  it("needs a note and a valid length", async () => {
    const boss = await admin(owner());
    const email = fresh("spammer");
    await signIn(email);
    const userId = await idOf(email);
    expect((await routes.users(call("/api/admin/users", { action: "restrict", userId, kind: "suspension", days: 7, reason: "spam", note: "" }, boss))).status).toBe(422);
    expect((await suspend(boss, userId, null, "suspension")).status).toBe(400);
    expect((await suspend(boss, userId, 120, "suspension")).status).toBe(400);
  });
});

describe("appeals", () => {
  it("answers the same for unknown addresses, takes one appeal per restriction, and lets another admin overturn it", async () => {
    const ownerEmail = owner();
    const boss = await admin(ownerEmail);
    const email = fresh("spammer");
    await signIn(email);
    const userId = await idOf(email);
    await suspend(boss, userId);

    const unknown = await routes.appeal(call("/api/appeal", { email: fresh("ghost"), message: "Please look at my account again, I think it was a mistake." }));
    const real = await routes.appeal(call("/api/appeal", { email, message: "I posted the link once to help someone; it wasn't an advert." }));
    expect(unknown.status).toBe(200);
    expect(await unknown.json()).toEqual(await real.json());
    await routes.appeal(call("/api/appeal", { email, message: "Second appeal that should be ignored entirely by the system." }));

    const db = (await getStore())!;
    const [row] = await db.collection(STORE_COLLECTIONS.restrictions).find({ userId }).toArray();
    expect(row!.appeal).toMatchObject({ status: "open", message: "I posted the link once to help someone; it wasn't an advert." });

    // The Super Admin who set it may decide (owners have no one above them); others who set a restriction may not.
    expect((await routes.users(call("/api/admin/users", { action: "appeal", restrictionId: row!._id, decision: "overturned", note: "Fair point; one link isn't spam." }, boss))).status).toBe(200);
    expect((await signIn(email)).status).toBe(200);
    expect(await db.collection(STORE_COLLECTIONS.restrictions).findOne({ _id: row!._id })).toMatchObject({ appeal: { status: "overturned" } });
  });

  it("doesn't let the admin who set a restriction decide its appeal unless they're a Super Admin", async () => {
    const boss = await admin(owner());
    const modEmail = fresh("mod");
    await signIn(modEmail);
    await routes.team(call("/api/admin/team", { action: "set-roles", email: modEmail, roles: ["moderator"] }, boss));
    const mod = await admin(modEmail);
    const email = fresh("spammer");
    await signIn(email);
    const userId = await idOf(email);
    await suspend(mod, userId);
    await routes.appeal(call("/api/appeal", { email, message: "This was a misunderstanding about a shared link, honestly." }));
    const db = (await getStore())!;
    const [row] = await db.collection(STORE_COLLECTIONS.restrictions).find({ userId }).toArray();
    expect((await routes.users(call("/api/admin/users", { action: "appeal", restrictionId: row!._id, decision: "overturned", note: "My own call." }, mod))).status).toBe(403);
    expect((await routes.users(call("/api/admin/users", { action: "appeal", restrictionId: row!._id, decision: "upheld", note: "Checked: it was spam." }, boss))).status).toBe(200);
    expect((await signIn(email)).status).toBe(403);
  });
});

describe("user directory", () => {
  it("searches by email prefix or name, filters by status, escapes patterns and pages", async () => {
    const { searchUsers } = await import("@/features/admin/users");
    const db = (await getStore())!;
    for (let i = 0; i < 30; i++) {
      await db.collection(STORE_COLLECTIONS.users).insertOne({ _id: crypto.randomUUID(), email: `person${i}@example.com`, name: i === 7 ? "Asha Rao" : `Person ${i}`, role: "user", status: i < 3 ? "blocked" : "active", interests: [], marketingConsent: false, profileComplete: true, createdAt: new Date(Date.now() - i * 1000), lastLoginAt: new Date() });
    }
    expect((await searchUsers({})).rows).toHaveLength(25);
    expect((await searchUsers({ page: 2 })).rows).toHaveLength(5);
    expect((await searchUsers({ q: "person1" })).total).toBe(1 + 10);
    expect((await searchUsers({ q: "asha" })).rows[0]?.name).toBe("Asha Rao");
    expect((await searchUsers({ status: "restricted" })).total).toBe(3);
    expect((await searchUsers({ q: "(.*" })).total).toBe(0);
  });

  it("notes every view of a person's record in the audit log", async () => {
    const { userRecord } = await import("@/features/admin/users");
    const email = fresh("traveller");
    await signIn(email);
    const userId = await idOf(email);
    const record = await userRecord(userId, { _id: "admin-1", email: "admin@example.com" });
    expect(record?.user.email).toBe(email);
    const db = (await getStore())!;
    expect(await db.collection(STORE_COLLECTIONS.audit).countDocuments({ action: "user.view", target: userId })).toBe(1);
  });
});
