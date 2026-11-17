import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { currentStep, totpAt } from "@/lib/auth/totp";

/** The personal profile: identity, preferences, privacy, the public page and moderation. */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  account: typeof import("@/app/api/account/route");
  profile: typeof import("@/app/api/profile/route");
  team: typeof import("@/app/api/admin/team/route").POST;
  mfa: typeof import("@/app/api/admin/mfa/route").POST;
  adminProfile: typeof import("@/app/api/admin/profile/route").POST;
};
let lastCode = "";
let ip = 1;
let addresses = 0;
const ORIGIN = "http://localhost:3000";

const call = (path: string, body: unknown, cookie = "", method = "POST") =>
  new NextRequest(`${ORIGIN}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `198.19.2.${ip++ % 250}`, cookie },
    body: JSON.stringify(body),
  });
const get = (path: string, cookie = "") => new NextRequest(`${ORIGIN}${path}`, { headers: { host: "localhost:3000", cookie } });
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;
const fresh = (name: string) => `${name}${++addresses}@example.com`;

async function signIn(email: string, purpose: "login" | "admin" = "login") {
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose }));
  return cookieOf(await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose })));
}
async function member(name = "Meera Iyer") {
  const email = fresh("member");
  const cookie = await signIn(email);
  expect((await routes.account.POST(call("/api/account", { name, country: "India", homeState: "Kerala", interests: ["Food"], marketingConsent: false }, cookie))).status).toBe(200);
  const user = await (await getStore())!.collection(STORE_COLLECTIONS.users).findOne({ email });
  return { email, cookie, id: user!._id as string };
}
async function admin(email: string) {
  const cookie = await signIn(email, "admin");
  const { secret } = (await (await routes.mfa(call("/api/admin/mfa", { action: "start" }, cookie))).json()) as { secret: string };
  expect((await routes.mfa(call("/api/admin/mfa", { action: "enable", code: totpAt(secret, currentStep()) }, cookie))).status).toBe(200);
  return cookie;
}

const identity = (fields: Record<string, unknown> = {}) => ({
  action: "identity",
  identity: { username: `meera_${addresses}`, avatar: "tea-garden", cover: "hero:kerala", tagline: "Slow trains and chai", bio: "I write about Kerala's backwaters.", city: "Kochi", website: "https://example.com", ...fields },
});
const privacy = (fields: Record<string, unknown> = {}) => ({ action: "privacy", privacy: { visibility: "public", show: ["tagline", "bio", "city", "interests", "joined"], linkComments: false, ...fields } });
const post = async (body: unknown, cookie: string) => {
  const response = await routes.profile.POST(call("/api/profile", body, cookie));
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
};

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
    account: await import("@/app/api/account/route"),
    profile: await import("@/app/api/profile/route"),
    team: (await import("@/app/api/admin/team/route")).POST,
    mfa: (await import("@/app/api/admin/mfa/route")).POST,
    adminProfile: (await import("@/app/api/admin/profile/route")).POST,
  };
});

beforeEach(() => resetMemoryStore());

describe("usernames", () => {
  it("accepts plain handles and refuses reserved, staff-like or badly formed ones", async () => {
    const { usernameProblem } = await import("@/features/profile/schema");
    for (const ok of ["meera", "trains_and_chai", "a1b", "x".repeat(20)]) expect(usernameProblem(ok)).toBeNull();
    for (const bad of ["ab", "x".repeat(21), "_meera", "meera_", "Meera", "me__era", "meera.iyer", "admin", "support", "tourindia_help", "official_guide", "yatri"]) {
      expect(usernameProblem(bad), bad).not.toBeNull();
    }
  });
});

describe("the profile API", () => {
  it("needs a signed-in person", async () => {
    expect((await routes.profile.GET(get("/api/profile"))).status).toBe(401);
    expect((await post(identity(), "")).status).toBe(401);
  });

  it("starts private with a stable default avatar, then saves identity, preferences and privacy", async () => {
    const meera = await member();
    const first = (await (await routes.profile.GET(get("/api/profile", meera.cookie))).json()) as { profile: { avatar: string; privacy: { visibility: string }; saved: boolean } };
    expect(first.profile).toMatchObject({ saved: false, privacy: { visibility: "private" } });
    const again = (await (await routes.profile.GET(get("/api/profile", meera.cookie))).json()) as { profile: { avatar: string } };
    expect(again.profile.avatar).toBe(first.profile.avatar);

    expect((await post(identity({ username: "Meera_Writes" }), meera.cookie)).status).toBe(200);
    expect((await post({ action: "preferences", preferences: { regions: ["South"], seasons: ["Monsoon"], tripLength: "Under a week", dietary: ["Vegetarian"], personalise: false } }, meera.cookie)).status).toBe(200);
    const saved = await post(privacy(), meera.cookie);
    expect(saved.status).toBe(200);
    expect(saved.body.profile).toMatchObject({ username: "meera_writes", avatar: "tea-garden", prefs: { regions: ["South"], personalise: false, transport: [] }, privacy: { visibility: "public" } });
  });

  it("refuses contact details, links and slurs in the about fields, and non-https websites", async () => {
    const meera = await member();
    expect((await post(identity({ bio: "Call me on 98765 43210" }), meera.cookie)).status).toBe(422);
    expect((await post(identity({ tagline: "Visit www.spam-tours.example" }), meera.cookie)).status).toBe(422);
    expect((await post(identity({ bio: "Hindus are evil" }), meera.cookie)).status).toBe(422);
    expect((await post(identity({ website: "http://example.com" }), meera.cookie)).status).toBe(422);
    expect((await post(identity({ website: "javascript:alert(1)" }), meera.cookie)).status).toBe(422);
    expect((await post(identity({ avatar: "not-an-avatar" }), meera.cookie)).status).toBe(422);
    expect((await post(identity({ cover: "hero:somewhere-else" }), meera.cookie)).status).toBe(422);
    expect((await post({ ...identity(), extra: true }, meera.cookie)).status).toBe(422);
    const masked = await post(identity({ bio: "This shit is beautiful" }), meera.cookie);
    expect(masked.status).toBe(200);
    expect((masked.body.profile as { bio: string }).bio).toBe("This **** is beautiful");
  });

  it("keeps usernames unique and reports availability", async () => {
    const meera = await member();
    const ravi = await member("Ravi Kumar");
    expect((await post(identity({ username: "chai_trails" }), meera.cookie)).status).toBe(200);
    expect((await post({ action: "check-username", username: "chai_trails" }, ravi.cookie)).body).toMatchObject({ available: false });
    expect((await post({ action: "check-username", username: "chai_trails" }, meera.cookie)).body).toMatchObject({ available: true });
    expect((await post({ action: "check-username", username: "admin" }, ravi.cookie)).body).toMatchObject({ available: false });
    expect((await post(identity({ username: "chai_trails" }), ravi.cookie)).status).toBe(409);
  });

  it("won't make a page visible before it has a username", async () => {
    const meera = await member();
    expect((await post(privacy(), meera.cookie)).status).toBe(422);
    expect((await post(privacy({ visibility: "private" }), meera.cookie)).status).toBe(200);
  });
});

describe("the public page", () => {
  it("shows only the chosen fields, never the email, and hides private or members-only pages from visitors", async () => {
    const { publicProfile } = await import("@/features/profile/service");
    const meera = await member();
    await post(identity({ username: "chai_trails" }), meera.cookie);
    expect(await publicProfile("chai_trails", true)).toBeNull();

    await post(privacy({ show: ["tagline", "interests"] }), meera.cookie);
    const page = await publicProfile("chai_trails", false);
    expect(page).toMatchObject({ name: "Meera Iyer", username: "chai_trails", tagline: "Slow trains and chai", interests: ["Food"] });
    expect(page).not.toHaveProperty("bio");
    expect(page).not.toHaveProperty("city");
    expect(page).not.toHaveProperty("homeState");
    expect(JSON.stringify(page)).not.toContain(meera.email);

    await post(privacy({ visibility: "members" }), meera.cookie);
    expect(await publicProfile("chai_trails", false)).toBeNull();
    expect(await publicProfile("chai_trails", true)).not.toBeNull();
    expect(await publicProfile("no_such_person", true)).toBeNull();
  });

  it("disappears while the account is suspended", async () => {
    const { publicProfile } = await import("@/features/profile/service");
    const meera = await member();
    await post(identity({ username: "chai_trails" }), meera.cookie);
    await post(privacy(), meera.cookie);
    expect(await publicProfile("chai_trails", false)).not.toBeNull();
    await (await getStore())!.collection(STORE_COLLECTIONS.users).updateOne({ _id: meera.id }, { $set: { status: "blocked" } });
    expect(await publicProfile("chai_trails", false)).toBeNull();
  });

  it("links comments only for public pages that opted in", async () => {
    const { commentLinks } = await import("@/features/profile/service");
    const meera = await member();
    await post(identity({ username: "chai_trails" }), meera.cookie);
    await post(privacy({ linkComments: true, visibility: "members" }), meera.cookie);
    expect((await commentLinks([meera.id])).size).toBe(0);
    await post(privacy({ linkComments: true }), meera.cookie);
    expect((await commentLinks([meera.id])).get(meera.id)).toEqual({ username: "chai_trails", avatar: "tea-garden" });
  });
});

describe("deleting and moderating", () => {
  it("deletes the profile with the account, freeing the username", async () => {
    const meera = await member();
    await post(identity({ username: "chai_trails" }), meera.cookie);
    expect((await routes.account.DELETE(call("/api/account", { confirm: "DELETE" }, meera.cookie, "DELETE"))).status).toBe(200);
    expect(await (await getStore())!.collection(STORE_COLLECTIONS.profiles).findOne({ _id: meera.id })).toBeNull();
    const ravi = await member("Ravi Kumar");
    expect((await post(identity({ username: "chai_trails" }), ravi.cookie)).status).toBe(200);
  });

  it("lets moderators clear a profile's text and make it private, audited, and keeps others out", async () => {
    const owner = fresh("owner");
    process.env.ADMIN_EMAILS = `${process.env.ADMIN_EMAILS},${owner}`;
    const boss = await admin(owner);
    const analystEmail = fresh("analyst");
    await signIn(analystEmail);
    expect((await routes.team(call("/api/admin/team", { action: "set-roles", email: analystEmail, roles: ["analyst"] }, boss))).status).toBe(200);
    const analyst = await admin(analystEmail);

    const meera = await member();
    await post(identity({ username: "chai_trails" }), meera.cookie);
    await post(privacy(), meera.cookie);

    expect((await routes.adminProfile(call("/api/admin/profile", { action: "reset", userId: meera.id, note: "Advertising in bio" }, analyst))).status).toBe(403);
    expect((await routes.adminProfile(call("/api/admin/profile", { action: "reset", userId: meera.id, note: "Advertising in bio" }, meera.cookie))).status).toBe(403);
    expect((await routes.adminProfile(call("/api/admin/profile", { action: "reset", userId: meera.id, note: "Advertising in bio" }, boss))).status).toBe(200);

    const db = (await getStore())!;
    expect(await db.collection(STORE_COLLECTIONS.profiles).findOne({ _id: meera.id })).toMatchObject({ username: "chai_trails", bio: "", tagline: "", website: "", privacy: { visibility: "private" } });
    expect(await db.collection(STORE_COLLECTIONS.audit).findOne({ action: "profile.reset", target: meera.id })).toMatchObject({ detail: "Advertising in bio", outcome: "ok" });
  });
});
