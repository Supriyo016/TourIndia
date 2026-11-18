import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";

/**
 * Phase 10: checks that cut across modules built in different phases. Every admin route refuses
 * people who aren't admins, the passport feeds achievements, and deleting an account leaves no
 * personal record behind in any collection.
 */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  account: typeof import("@/app/api/account/route");
};
let lastCode = "";
let ip = 1;
let addresses = 0;
const ORIGIN = "http://localhost:3000";

const call = (path: string, body: unknown, cookie = "", method = "POST") =>
  new NextRequest(`${ORIGIN}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `198.19.9.${ip++ % 250}`, cookie },
    ...(method === "GET" ? {} : { body: JSON.stringify(body) }),
  });
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;

async function member() {
  const email = `whole${++addresses}@example.com`;
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose: "login" }));
  const cookie = cookieOf(await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose: "login" })));
  await routes.account.POST(call("/api/account", { name: "Meera Iyer", country: "India", interests: [], marketingConsent: false }, cookie));
  const user = await (await getStore())!.collection(STORE_COLLECTIONS.users).findOne({ email });
  return { email, cookie, id: user!._id as string };
}
const post = async (path: string, body: unknown, cookie: string) => {
  const routeModule = (await import(`@/app${path}/route`)) as { POST: (request: NextRequest) => Promise<Response> };
  const response = await routeModule.POST(call(path, body, cookie));
  return { status: response.status, body: (await response.json().catch(() => ({}))) as Record<string, unknown> };
};

/** Every route file under a folder, as its URL path. */
function routeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return routeFiles(full);
    return name === "route.ts" ? [full.replace(/\\/g, "/")] : [];
  });
}

beforeAll(async () => {
  process.env.VERCEL = "1";
  process.env.ADMIN_EMAILS = "nobody@example.com";
  vi.spyOn(console, "info").mockImplementation((message: unknown) => {
    const match = /code for \S+ is (\d{6})/.exec(String(message));
    if (match) lastCode = match[1]!;
  });
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  routes = {
    request: (await import("@/app/api/auth/otp/request/route")).POST,
    verify: (await import("@/app/api/auth/otp/verify/route")).POST,
    account: await import("@/app/api/account/route"),
  };
});

beforeEach(() => resetMemoryStore());

describe("the permissions matrix", () => {
  const files = [...routeFiles("src/app/api/admin"), ...routeFiles("src/app/api/cron")];

  it("finds the admin and cron routes", () => {
    expect(files.length).toBeGreaterThan(15);
  });

  it("refuses every admin and cron route to signed-out visitors and to ordinary members", async () => {
    const meera = await member();
    for (const file of files) {
      const path = file.replace(/^src\/app/, "").replace(/\/route\.ts$/, "");
      const routeModule = (await import(`@/app${path}/route`)) as Record<string, ((request: NextRequest) => Promise<Response>) | undefined>;
      for (const method of ["GET", "POST"] as const) {
        const handler = routeModule[method];
        if (!handler) continue;
        for (const [who, cookie] of [["signed out", ""], ["member", meera.cookie]] as const) {
          const response = await handler(call(path, { action: "list" }, cookie, method));
          // Refused one way or another (not signed in, not allowed, or a body that never reached the work). Never a success.
          expect(response.status, `${method} ${path} for a ${who}`).toBeGreaterThanOrEqual(400);
          expect(response.status, `${method} ${path} for a ${who}`).toBeLessThan(500);
        }
      }
    }
  });
});

describe("the passport and achievements", () => {
  it("count only states marked visited", async () => {
    const meera = await member();
    expect((await post("/api/saved", { action: "passport-set", state: "kerala", status: "want", month: null }, meera.cookie)).status).toBe(200);
    expect((await post("/api/saved", { action: "passport-set", state: "goa", status: "exploring", month: null }, meera.cookie)).status).toBe(200);
    const { activityOf } = await import("@/features/achievements/service");
    expect((await activityOf(meera.id))!.stamps).toEqual([]);
    await post("/api/saved", { action: "passport-set", state: "kerala", status: "visited", month: "2024-12" }, meera.cookie);
    expect((await activityOf(meera.id))!.stamps).toEqual(["kerala"]);
  });
});

describe("deleting an account", () => {
  it("leaves no personal record behind in any collection", async () => {
    const meera = await member();
    // Something from each phase that keeps personal data.
    await post("/api/profile", { action: "identity", identity: { username: "whole_trail", avatar: "tea-garden", cover: "hero:kerala", tagline: "", bio: "", city: "", website: "" } }, meera.cookie);
    await post("/api/saved", { action: "set", kind: "places", slug: "munnar", on: true }, meera.cookie);
    await post("/api/saved", { action: "passport-set", state: "kerala", status: "visited", month: null }, meera.cookie);
    await post("/api/saved", { action: "collection-create", name: "Hills", places: ["munnar"] }, meera.cookie);
    const db = (await getStore())!;
    const now = new Date();
    for (const [collection, extra] of [
      [STORE_COLLECTIONS.trips, { name: "T", input: {}, layout: [], expenses: { people: [], items: [] }, status: "active" }],
      [STORE_COLLECTIONS.notes, { title: "Packing", body: "Torch", date: null }],
      [STORE_COLLECTIONS.memories, { title: "Rain", body: "Munnar in the rain", date: "2024-07-01", place: "", tags: [], photos: [] }],
      [STORE_COLLECTIONS.quizAttempts, { answers: "a", matches: [] }],
      [STORE_COLLECTIONS.notifications, { kind: "ticket", text: "Updated", read: false }],
    ] as const) {
      await db.collection(collection).insertOne({ _id: crypto.randomUUID(), userId: meera.id, createdAt: now, updatedAt: now, ...extra });
    }

    expect((await routes.account.DELETE(call("/api/account", { confirm: "DELETE" }, meera.cookie, "DELETE"))).status).toBe(200);

    // Kept on purpose: the append-only logs, and restriction history (with the address removed).
    const kept = new Set<string>([STORE_COLLECTIONS.audit, STORE_COLLECTIONS.securityEvents, STORE_COLLECTIONS.restrictions]);
    for (const collection of Object.values(STORE_COLLECTIONS)) {
      if (kept.has(collection)) continue;
      const rows = await db.collection(collection).find({}, { limit: 10_000 }).toArray();
      const left = rows.filter((row) => row._id === meera.id || row.userId === meera.id || row.email === meera.email);
      expect(left, `${collection} still holds the deleted account`).toEqual([]);
    }
  });
});
