import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { resetMemoryStore } from "@/lib/database/store";

/**
 * Runs the real auth, account, community and admin routes against the in-memory store.
 * Codes are read from the development log line, as a developer would.
 */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  session: typeof import("@/app/api/auth/session/route").GET;
  logout: typeof import("@/app/api/auth/logout/route").POST;
  account: typeof import("@/app/api/account/route");
  community: typeof import("@/app/api/community/route");
  admin: typeof import("@/app/api/admin/route").POST;
};

let ip = 1;
const ORIGIN = "http://localhost:3000";

function call(path: string, body: unknown, { cookie = "", method = "POST", origin = ORIGIN }: { cookie?: string; method?: string; origin?: string } = {}) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method,
    headers: { "content-type": "application/json", origin, host: "localhost:3000", "x-vercel-forwarded-for": `198.51.100.${ip++ % 250}`, cookie },
    body: JSON.stringify(body),
  });
}

const get = (path: string, cookie = "") => new NextRequest(`${ORIGIN}${path}`, { headers: { host: "localhost:3000", cookie } });

let lastCode = "";
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;

async function signIn(email: string, purpose: "login" | "admin" = "login") {
  const sent = await routes.request(call("/api/auth/otp/request", { email, purpose }));
  expect(sent.status).toBe(200);
  const verified = await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose }));
  expect(verified.status).toBe(200);
  return cookieOf(verified);
}

async function completeProfile(cookie: string, name = "Asha Rao") {
  const response = await routes.account.POST(call("/api/account", { name, country: "India", homeState: "Kerala", interests: ["Food"], marketingConsent: false }, { cookie }));
  expect(response.status).toBe(200);
}

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
    session: (await import("@/app/api/auth/session/route")).GET,
    logout: (await import("@/app/api/auth/logout/route")).POST,
    account: await import("@/app/api/account/route"),
    community: await import("@/app/api/community/route"),
    admin: (await import("@/app/api/admin/route")).POST,
  };
});

beforeEach(() => resetMemoryStore());
afterEach(() => {
  lastCode = "";
});

describe("email code sign-in", () => {
  it("signs in with a 6-digit code and sets a hardened session cookie", async () => {
    const cookie = await signIn("Traveller@Example.com");
    expect(cookie).toMatch(/^ti_auth=/);
    const session = await (await routes.session(get("/api/auth/session", cookie))).json();
    expect(session.user.email).toBe("traveller@example.com");
    expect(session.user.profileComplete).toBe(false);
  });

  it("gives the same answer for any address, and refuses a wrong code", async () => {
    const first = await (await routes.request(call("/api/auth/otp/request", { email: "a@example.com" }))).json();
    const wrong = await routes.verify(call("/api/auth/otp/verify", { email: "a@example.com", code: lastCode === "000000" ? "111111" : "000000" }));
    expect(first.message).toMatch(/If that address/);
    expect(wrong.status).toBe(401);
  });

  it("locks a code after five wrong attempts", async () => {
    await routes.request(call("/api/auth/otp/request", { email: "b@example.com" }));
    const good = lastCode;
    const bad = good === "123456" ? "654321" : "123456";
    for (let attempt = 0; attempt < 5; attempt += 1) await routes.verify(call("/api/auth/otp/verify", { email: "b@example.com", code: bad }));
    const locked = await routes.verify(call("/api/auth/otp/verify", { email: "b@example.com", code: good }));
    expect(locked.status).toBe(410);
  });

  it("doesn't resend within a minute, and a code works only once", async () => {
    await routes.request(call("/api/auth/otp/request", { email: "c@example.com" }));
    const code = lastCode;
    lastCode = "";
    await routes.request(call("/api/auth/otp/request", { email: "c@example.com" }));
    expect(lastCode).toBe("");
    expect((await routes.verify(call("/api/auth/otp/verify", { email: "c@example.com", code }))).status).toBe(200);
    expect((await routes.verify(call("/api/auth/otp/verify", { email: "c@example.com", code }))).status).toBe(401);
  });

  it("refuses cross-site requests and malformed input", async () => {
    expect((await routes.request(call("/api/auth/otp/request", { email: "d@example.com" }, { origin: "https://evil.example" }))).status).toBe(403);
    expect((await routes.request(call("/api/auth/otp/request", { email: "not-an-email" }))).status).toBe(422);
    expect((await routes.verify(call("/api/auth/otp/verify", { email: "d@example.com", code: "12ab56" }))).status).toBe(422);
    expect((await routes.request(call("/api/auth/otp/request", { email: "d@example.com", role: "admin" }))).status).toBe(422);
  });

  it("signs out on the server, not just in the browser", async () => {
    const cookie = await signIn("e@example.com");
    await routes.logout(call("/api/auth/logout", {}, { cookie }));
    const session = await (await routes.session(get("/api/auth/session", cookie))).json();
    expect(session.user).toBeNull();
  });
});

describe("admin access", () => {
  it("sends admin codes only to listed addresses", async () => {
    await routes.request(call("/api/auth/otp/request", { email: "intruder@example.com", purpose: "admin" }));
    expect(lastCode).toBe("");
    const cookie = await signIn("owner@example.com", "admin");
    const session = await (await routes.session(get("/api/auth/session", cookie))).json();
    expect(session.user.role).toBe("admin");
  });

  it("a normal sign-in by the owner is not an admin session", async () => {
    const cookie = await signIn("owner@example.com");
    const response = await routes.admin(call("/api/admin", { action: "user", id: crypto.randomUUID(), status: "blocked" }, { cookie }));
    expect(response.status).toBe(403);
  });
});

describe("community", () => {
  const place = { type: "place", id: "hampi" } as const;

  it("lets anyone read, but only signed-in people react", async () => {
    expect((await routes.community.GET(get("/api/community?type=place&id=hampi"))).status).toBe(200);
    expect((await routes.community.POST(call("/api/community", { action: "love", target: place }))).status).toBe(401);
    expect((await routes.community.GET(get("/api/community?type=place&id=not-a-place"))).status).toBe(404);
  });

  it("counts loves once per person and averages ratings", async () => {
    const a = await signIn("f@example.com");
    const b = await signIn("g@example.com");
    expect(await (await routes.community.POST(call("/api/community", { action: "love", target: place }, { cookie: a }))).json()).toEqual({ loved: true, loves: 1 });
    expect(await (await routes.community.POST(call("/api/community", { action: "love", target: place }, { cookie: a }))).json()).toEqual({ loved: false, loves: 0 });
    await routes.community.POST(call("/api/community", { action: "rate", target: place, stars: 5 }, { cookie: a }));
    await routes.community.POST(call("/api/community", { action: "rate", target: place, stars: 2 }, { cookie: a }));
    const rated = await (await routes.community.POST(call("/api/community", { action: "rate", target: place, stars: 4 }, { cookie: b }))).json();
    expect(rated).toMatchObject({ ratingCount: 2, ratingAverage: 3 });
  });

  it("needs a profile name before posting, then publishes clean comments and holds hostile ones", async () => {
    const cookie = await signIn("h@example.com");
    const early = await routes.community.POST(call("/api/community", { action: "comment", target: place, kind: "tip", body: "Hire a bicycle near the bazaar." }, { cookie }));
    expect(early.status).toBe(403);
    await completeProfile(cookie);
    const ok = await (await routes.community.POST(call("/api/community", { action: "comment", target: place, kind: "tip", body: "Hire a bicycle near the bazaar." }, { cookie }))).json();
    expect(ok.status).toBe("visible");
    const held = await (await routes.community.POST(call("/api/community", { action: "comment", target: place, kind: "viewpoint", body: "Jains are backward people" }, { cookie }))).json();
    expect(held.status).toBe("pending");
    const refused = await routes.community.POST(call("/api/community", { action: "comment", target: place, kind: "viewpoint", body: "you katua" }, { cookie }));
    expect(refused.status).toBe(422);
    const thread = await (await routes.community.GET(get("/api/community?type=place&id=hampi", cookie))).json();
    expect(thread.comments).toHaveLength(1);
    expect(thread.comments[0]).toMatchObject({ authorName: "Asha Rao", mine: true });
    expect(JSON.stringify(thread)).not.toMatch(/h@example\.com|userId/);
  });

  it("hides a comment after three reports", async () => {
    const author = await signIn("i@example.com");
    await completeProfile(author);
    const { id } = await (await routes.community.POST(call("/api/community", { action: "comment", target: place, kind: "viewpoint", body: "Lovely in winter." }, { cookie: author }))).json();
    for (const email of ["j@example.com", "k@example.com", "l@example.com"]) {
      const cookie = await signIn(email);
      await routes.community.POST(call("/api/community", { action: "report", commentId: id, reason: "spam" }, { cookie }));
    }
    const thread = await (await routes.community.GET(get("/api/community?type=place&id=hampi"))).json();
    expect(thread.comments).toHaveLength(0);
  });

  it("suggested edits wait for an admin, and approval changes the page", async () => {
    const editor = await signIn("m@example.com");
    await completeProfile(editor);
    const suggestion = await routes.community.POST(
      call("/api/community", { action: "edit", target: place, field: "bestTimeNote", text: "October to February is cooler and clear.", reason: "Matches the state tourism calendar." }, { cookie: editor }),
    );
    expect(suggestion.status).toBe(201);
    const bad = await routes.community.POST(call("/api/community", { action: "edit", target: place, field: "lastReviewed", text: "2030-01-01", reason: "Trying an unlisted field." }, { cookie: editor }));
    expect(bad.status).toBe(400);

    const { overridesFor, listEdits } = await import("@/features/community/service");
    expect(await overridesFor(place)).toEqual({});
    const [pending] = await listEdits("pending");
    expect(pending?.field).toBe("bestTimeNote");

    const admin = await signIn("owner@example.com", "admin");
    expect((await routes.admin(call("/api/admin", { action: "edit", id: pending!._id, approve: true, note: "" }, { cookie: editor }))).status).toBe(403);
    expect((await routes.admin(call("/api/admin", { action: "edit", id: pending!._id, approve: true, note: "Checked" }, { cookie: admin }))).status).toBe(200);
    expect(await overridesFor(place)).toEqual({ bestTimeNote: "October to February is cooler and clear." });
    expect((await routes.admin(call("/api/admin", { action: "edit", id: pending!._id, approve: false, note: "" }, { cookie: admin }))).status).toBe(409);
  });

  it("deleting an account removes reactions and anonymises comments", async () => {
    const cookie = await signIn("n@example.com");
    await completeProfile(cookie, "Dev Patel");
    await routes.community.POST(call("/api/community", { action: "comment", target: place, kind: "tip", body: "Carry water for the walk." }, { cookie }));
    await routes.community.POST(call("/api/community", { action: "love", target: place }, { cookie }));
    expect((await routes.account.DELETE(call("/api/account", { confirm: "DELETE" }, { cookie, method: "DELETE" }))).status).toBe(200);
    const thread = await (await routes.community.GET(get("/api/community?type=place&id=hampi"))).json();
    expect(thread.comments[0].authorName).toBe("Former member");
    expect(thread.stats.loves).toBe(1);
    expect((await routes.account.GET(get("/api/account", cookie))).status).toBe(401);
  });
});
