import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { currentStep, totpAt } from "@/lib/auth/totp";

/** Session management, sign-in history and admin team rules, through the real routes. */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  sessions: typeof import("@/app/api/account/sessions/route");
  team: typeof import("@/app/api/admin/team/route");
  admin: typeof import("@/app/api/admin/route").POST;
  mfa: typeof import("@/app/api/admin/mfa/route").POST;
};
let lastCode = "";
let ip = 1;
let addresses = 0;
const ORIGIN = "http://localhost:3000";

function call(path: string, body: unknown, cookie = "", agent = "Mozilla/5.0 (Windows NT 10.0) Chrome/130.0") {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `192.0.2.${ip++ % 250}`, "x-vercel-ip-country": "IN", "user-agent": agent, cookie },
    body: JSON.stringify(body),
  });
}
const get = (path: string, cookie: string) => new NextRequest(`${ORIGIN}${path}`, { headers: { host: "localhost:3000", cookie } });
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;
/** Sign-in codes are limited per address per hour, so each test uses fresh addresses. */
const fresh = (name: string) => `${name}${++addresses}@example.com`;
function owner() {
  const email = fresh("owner");
  process.env.ADMIN_EMAILS = `${process.env.ADMIN_EMAILS},${email}`;
  return email;
}

async function signIn(email: string, purpose: "login" | "admin" = "login", agent?: string) {
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose }));
  const verified = await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose }, "", agent));
  expect(verified.status).toBe(200);
  return cookieOf(verified);
}

const secrets = new Map<string, string>();
/** Admin sign-in with MFA: set-up the first time, a code (from the next 30-second step, since each step works once) after that. */
async function admin(email: string) {
  const cookie = await signIn(email, "admin");
  const known = secrets.get(email);
  if (known) {
    expect((await routes.mfa(call("/api/admin/mfa", { action: "verify", code: totpAt(known, currentStep() + 1) }, cookie))).status).toBe(200);
    return cookie;
  }
  const { secret } = (await (await routes.mfa(call("/api/admin/mfa", { action: "start" }, cookie))).json()) as { secret: string };
  expect((await routes.mfa(call("/api/admin/mfa", { action: "enable", code: totpAt(secret, currentStep()) }, cookie))).status).toBe(200);
  secrets.set(email, secret);
  return cookie;
}

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
    sessions: await import("@/app/api/account/sessions/route"),
    team: await import("@/app/api/admin/team/route"),
    admin: (await import("@/app/api/admin/route")).POST,
    mfa: (await import("@/app/api/admin/mfa/route")).POST,
  };
});

beforeEach(() => resetMemoryStore());

type SessionsBody = { sessions: { id: string; device: string; country?: string; current: boolean }[]; history: { method: string; outcome: string; device?: string }[] };
const listOf = async (cookie: string) => (await (await routes.sessions.GET(get("/api/account/sessions", cookie))).json()) as SessionsBody;

describe("your own sessions", () => {
  it("lists devices with a readable label and country, and marks this one", async () => {
    const email = fresh("traveller");
    const laptop = await signIn(email);
    await signIn(email, "login", "Mozilla/5.0 (Linux; Android 14) Chrome/130.0 Mobile");
    const { sessions } = await listOf(laptop);
    expect(sessions).toHaveLength(2);
    expect(sessions.map((s) => s.device).sort()).toEqual(["Chrome on Android", "Chrome on Windows"]);
    expect(sessions.every((s) => s.country === "IN")).toBe(true);
    expect(sessions.filter((s) => s.current)).toHaveLength(1);
  });

  it("signs out one other device, or all of them, but never someone else's", async () => {
    const email = fresh("traveller");
    const one = await signIn(email);
    const two = await signIn(email);
    await signIn(email);
    const stranger = await signIn(fresh("stranger"));

    const strangerSession = (await listOf(stranger)).sessions[0]!.id;
    expect((await routes.sessions.POST(call("/api/account/sessions", { action: "end", id: strangerSession }, one))).status).toBe(404);
    expect((await listOf(stranger)).sessions).toHaveLength(1);

    const target = (await listOf(two)).sessions.find((s) => s.current)!.id;
    expect((await routes.sessions.POST(call("/api/account/sessions", { action: "end", id: target }, one))).status).toBe(200);
    expect((await routes.sessions.GET(get("/api/account/sessions", two))).status).toBe(401);

    const ended = await routes.sessions.POST(call("/api/account/sessions", { action: "end-others" }, one));
    expect(((await ended.json()) as { ended: number }).ended).toBe(1);
    expect((await listOf(one)).sessions).toHaveLength(1);
  });

  it("refuses to end the current session (that's what sign out is for)", async () => {
    const cookie = await signIn(fresh("traveller"));
    const current = (await listOf(cookie)).sessions[0]!.id;
    expect((await routes.sessions.POST(call("/api/account/sessions", { action: "end", id: current }, cookie))).status).toBe(400);
  });

  it("shows recent sign-ins, including failed codes, without leaking other people's", async () => {
    const email = fresh("traveller");
    lastCode = "";
    await routes.request(call("/api/auth/otp/request", { email, purpose: "login" }));
    const code = lastCode;
    expect((await routes.verify(call("/api/auth/otp/verify", { email, code: code === "000000" ? "111111" : "000000", purpose: "login" }))).status).toBe(401);
    const verified = await routes.verify(call("/api/auth/otp/verify", { email, code, purpose: "login" }));
    expect(verified.status).toBe(200);
    const cookie = cookieOf(verified);
    await signIn(fresh("someone-else"));
    const { history } = await listOf(cookie);
    expect(history.map((h) => h.outcome).sort()).toEqual(["failed", "ok"]);
    expect(history.find((h) => h.outcome === "ok")!.device).toBe("Chrome on Windows");
  });
});

describe("admin team", () => {
  it("adds an admin only once they have an account, and they can then sign in as one", async () => {
    const boss = await admin(owner());
    const newcomer = fresh("editor");
    const missing = await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: newcomer, roles: ["editor"] }, boss));
    expect(missing.status).toBe(404);
    await signIn(newcomer);
    expect((await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: newcomer, roles: ["editor"] }, boss))).status).toBe(200);
    await signIn(newcomer, "admin");
    const team = (await (await routes.team.GET(get("/api/admin/team", boss))).json()) as { team: { email: string; roles: string[] }[] };
    expect(team.team.find((m) => m.email === newcomer)?.roles).toEqual(["editor"]);
  });

  it("stops non-Super Admins granting Super Admin, and anyone changing their own roles or an owner's", async () => {
    const ownerEmail = owner();
    const boss = await admin(ownerEmail);
    const deputyEmail = fresh("deputy");
    await signIn(deputyEmail);
    await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: deputyEmail, roles: ["admin"] }, boss));
    // The built-in Admin role can't manage the team at all.
    const deputy = await admin(deputyEmail);
    expect((await routes.team.GET(get("/api/admin/team", deputy))).status).toBe(403);

    // A custom role with team management, held by a non-Super Admin.
    expect((await routes.team.POST(call("/api/admin/team", { action: "save-role", name: "People lead", description: "", permissions: ["admins.manage", "users.view"] }, boss))).status).toBe(200);
    await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: deputyEmail, roles: ["custom_people_lead"] }, boss));
    const lead = await admin(deputyEmail);
    const target = fresh("helper");
    await signIn(target);
    expect((await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: target, roles: ["super_admin"] }, lead))).status).toBe(403);
    expect((await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: deputyEmail, roles: ["admin"] }, lead))).status).toBe(403);
    expect((await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: ownerEmail, roles: [] }, lead))).status).toBe(403);
    expect((await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: target, roles: ["moderator"] }, lead))).status).toBe(200);
  });

  it("ends a removed admin's admin sessions straight away", async () => {
    const boss = await admin(owner());
    const modEmail = fresh("mod");
    await signIn(modEmail);
    await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: modEmail, roles: ["moderator"] }, boss));
    const mod = await admin(modEmail);
    await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: modEmail, roles: [] }, boss));
    expect((await routes.admin(call("/api/admin", { action: "edit", id: crypto.randomUUID(), approve: true, note: "" }, mod))).status).toBe(401);
    const db = (await getStore())!;
    const audit = await db.collection(STORE_COLLECTIONS.audit).find({ action: "admin.remove" }).toArray();
    expect(audit[0]).toMatchObject({ before: ["moderator"], after: [] });
  });

  it("keeps team powers out of custom roles made by non-Super Admins, and won't delete a role in use", async () => {
    const boss = await admin(owner());
    expect((await routes.team.POST(call("/api/admin/team", { action: "save-role", name: "Desk", description: "", permissions: ["support.manage"] }, boss))).status).toBe(200);
    const helperEmail = fresh("helper");
    await signIn(helperEmail);
    await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: helperEmail, roles: ["custom_desk"] }, boss));
    expect((await routes.team.POST(call("/api/admin/team", { action: "delete-role", id: "custom_desk" }, boss))).status).toBe(409);
    expect((await routes.team.POST(call("/api/admin/team", { action: "delete-role", id: "moderator" }, boss))).status).toBe(403);
  });

  it("asks for a fresh authenticator code before team changes", async () => {
    const boss = await admin(owner());
    const db = (await getStore())!;
    for (const row of await db.collection(STORE_COLLECTIONS.sessions).find({ role: "admin" }).toArray()) {
      await db.collection(STORE_COLLECTIONS.sessions).updateOne({ _id: row._id }, { $set: { mfaAt: new Date(Date.now() - 20 * 60_000) } });
    }
    const target = fresh("helper");
    await signIn(target);
    const stale = await routes.team.POST(call("/api/admin/team", { action: "set-roles", email: target, roles: ["editor"] }, boss));
    expect(stale.status).toBe(401);
    expect(((await stale.json()) as { code: string }).code).toBe("reauth");
  });

  it("lets an admin with users.sessions sign a user out everywhere", async () => {
    const boss = await admin(owner());
    const userEmail = fresh("traveller");
    const user = await signIn(userEmail);
    const db = (await getStore())!;
    const record = await db.collection(STORE_COLLECTIONS.users).findOne({ email: userEmail });
    expect((await routes.admin(call("/api/admin", { action: "sessions", id: record!._id }, boss))).status).toBe(200);
    expect((await routes.sessions.GET(get("/api/account/sessions", user))).status).toBe(401);
  });
});
