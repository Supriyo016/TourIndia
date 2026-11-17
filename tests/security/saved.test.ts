import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";

/** Saved places, passport stamps, collections and share links, through the real routes. */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  account: typeof import("@/app/api/account/route");
  saved: typeof import("@/app/api/saved/route");
};
let lastCode = "";
let ip = 1;
let addresses = 0;
const ORIGIN = "http://localhost:3000";

const call = (path: string, body: unknown, cookie = "", method = "POST") =>
  new NextRequest(`${ORIGIN}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `198.19.3.${ip++ % 250}`, cookie },
    body: JSON.stringify(body),
  });
const get = (cookie = "") => new NextRequest(`${ORIGIN}/api/saved`, { headers: { host: "localhost:3000", cookie } });
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;

async function member() {
  const email = `saver${++addresses}@example.com`;
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose: "login" }));
  const cookie = cookieOf(await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose: "login" })));
  const user = await (await getStore())!.collection(STORE_COLLECTIONS.users).findOne({ email });
  return { cookie, id: user!._id as string };
}
const post = async (body: unknown, cookie: string) => {
  const response = await routes.saved.POST(call("/api/saved", body, cookie));
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
};
const read = async (cookie: string) => (await (await routes.saved.GET(get(cookie))).json()) as { places: string[]; stamps: string[]; collections: { id: string; shareId: string | null; places: string[] }[] };

beforeAll(async () => {
  process.env.VERCEL = "1";
  vi.spyOn(console, "info").mockImplementation((message: unknown) => {
    const match = /code for \S+ is (\d{6})/.exec(String(message));
    if (match) lastCode = match[1]!;
  });
  routes = {
    request: (await import("@/app/api/auth/otp/request/route")).POST,
    verify: (await import("@/app/api/auth/otp/verify/route")).POST,
    account: await import("@/app/api/account/route"),
    saved: await import("@/app/api/saved/route"),
  };
});

beforeEach(() => resetMemoryStore());

describe("saved places and stamps", () => {
  it("needs a signed-in person", async () => {
    expect((await routes.saved.GET(get())).status).toBe(401);
    expect((await post({ action: "set", kind: "places", slug: "munnar", on: true }, "")).status).toBe(401);
  });

  it("adds newest places first, removes them, and keeps stamps in order", async () => {
    const meera = await member();
    await post({ action: "set", kind: "places", slug: "munnar", on: true }, meera.cookie);
    await post({ action: "set", kind: "places", slug: "hampi", on: true }, meera.cookie);
    await post({ action: "set", kind: "places", slug: "hampi", on: true }, meera.cookie);
    await post({ action: "set", kind: "stamps", slug: "kerala", on: true }, meera.cookie);
    await post({ action: "set", kind: "stamps", slug: "goa", on: true }, meera.cookie);
    expect(await read(meera.cookie)).toMatchObject({ places: ["hampi", "munnar"], stamps: ["kerala", "goa"] });
    await post({ action: "set", kind: "places", slug: "munnar", on: false }, meera.cookie);
    expect((await read(meera.cookie)).places).toEqual(["hampi"]);
  });

  it("refuses places and states that aren't in the guide", async () => {
    const meera = await member();
    expect((await post({ action: "set", kind: "places", slug: "atlantis", on: true }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "set", kind: "stamps", slug: "munnar", on: true }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "set", kind: "places", slug: "../etc", on: true }, meera.cookie)).status).toBe(422);
  });

  it("merges a guest's list without duplicates and ignores unknown places", async () => {
    const meera = await member();
    await post({ action: "set", kind: "places", slug: "munnar", on: true }, meera.cookie);
    const merged = await post({ action: "merge", kind: "places", slugs: ["hampi", "munnar", "atlantis", "hampi", "goa"] }, meera.cookie);
    expect(merged.status).toBe(200);
    expect(merged.body.places).toEqual(["hampi", "goa", "munnar"]);
  });

  it("keeps each person's lists apart", async () => {
    const meera = await member();
    const ravi = await member();
    await post({ action: "set", kind: "places", slug: "munnar", on: true }, meera.cookie);
    expect((await read(ravi.cookie)).places).toEqual([]);
  });
});

describe("collections", () => {
  it("creates, edits and deletes a collection, keeping only real places", async () => {
    const meera = await member();
    const created = await post({ action: "collection-create", name: "Monsoon weekend", note: "Rain and chai", places: ["munnar", "atlantis"] }, meera.cookie);
    expect(created.status).toBe(201);
    const id = (created.body.collection as { id: string }).id;
    expect(created.body.collection).toMatchObject({ name: "Monsoon weekend", places: ["munnar"], shareId: null });
    expect((await post({ action: "collection-update", id, name: "Monsoon in Kerala", places: ["munnar", "alappuzha"] }, meera.cookie)).body.collection).toMatchObject({ name: "Monsoon in Kerala", places: ["munnar", "alappuzha"], note: "Rain and chai" });
    expect((await post({ action: "collection-delete", id }, meera.cookie)).status).toBe(200);
    expect((await read(meera.cookie)).collections).toEqual([]);
  });

  it("filters names and notes like comments", async () => {
    const meera = await member();
    expect((await post({ action: "collection-create", name: "Call 98765 43210", note: "" }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "collection-create", name: "Trip", note: "Book at www.spam-tours.example" }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "collection-create", name: "", note: "" }, meera.cookie)).status).toBe(422);
  });

  it("won't let anyone else read, change, share or delete it", async () => {
    const meera = await member();
    const ravi = await member();
    const id = ((await post({ action: "collection-create", name: "Ours", places: ["goa"] }, meera.cookie)).body.collection as { id: string }).id;
    for (const body of [
      { action: "collection-update", id, name: "Mine now" },
      { action: "collection-share", id, on: true },
      { action: "collection-delete", id },
    ]) {
      expect((await post(body, ravi.cookie)).status).toBe(404);
    }
    expect((await read(ravi.cookie)).collections).toEqual([]);
    expect((await read(meera.cookie)).collections[0]).toMatchObject({ places: ["goa"], shareId: null });
  });

  it("caps how many collections one person can make", async () => {
    const meera = await member();
    const { LIMITS } = await import("@/features/saved/service");
    for (let i = 0; i < LIMITS.collections; i += 1) expect((await post({ action: "collection-create", name: `List ${i}` }, meera.cookie)).status).toBe(201);
    expect((await post({ action: "collection-create", name: "One too many" }, meera.cookie)).status).toBe(422);
  });
});

describe("share links", () => {
  it("shows only the name, note and places, makes a new address each time, and stops when turned off", async () => {
    const { sharedCollection } = await import("@/features/saved/service");
    const meera = await member();
    const id = ((await post({ action: "collection-create", name: "Goa with friends", note: "December", places: ["goa"] }, meera.cookie)).body.collection as { id: string }).id;
    const first = ((await post({ action: "collection-share", id, on: true }, meera.cookie)).body.collection as { shareId: string }).shareId;
    expect(first).toMatch(/^[A-Za-z0-9_-]{16}$/);
    const shared = await sharedCollection(first);
    expect(shared).toEqual({ name: "Goa with friends", note: "December", places: ["goa"] });

    await post({ action: "collection-share", id, on: false }, meera.cookie);
    expect(await sharedCollection(first)).toBeNull();
    const second = ((await post({ action: "collection-share", id, on: true }, meera.cookie)).body.collection as { shareId: string }).shareId;
    expect(second).not.toBe(first);
    expect(await sharedCollection(first)).toBeNull();
    expect(await sharedCollection(second)).not.toBeNull();
    expect(await sharedCollection("not a real id")).toBeNull();
  });

  it("stop working while the owner is suspended, and go with the account", async () => {
    const { sharedCollection } = await import("@/features/saved/service");
    const meera = await member();
    await post({ action: "set", kind: "places", slug: "goa", on: true }, meera.cookie);
    const id = ((await post({ action: "collection-create", name: "Goa", places: ["goa"] }, meera.cookie)).body.collection as { id: string }).id;
    const shareId = ((await post({ action: "collection-share", id, on: true }, meera.cookie)).body.collection as { shareId: string }).shareId;
    const users = (await getStore())!.collection(STORE_COLLECTIONS.users);

    await users.updateOne({ _id: meera.id }, { $set: { status: "blocked" } });
    expect(await sharedCollection(shareId)).toBeNull();
    await users.updateOne({ _id: meera.id }, { $set: { status: "active" } });
    expect(await sharedCollection(shareId)).not.toBeNull();

    expect((await routes.account.DELETE(call("/api/account", { confirm: "DELETE" }, meera.cookie, "DELETE"))).status).toBe(200);
    expect(await sharedCollection(shareId)).toBeNull();
    const db = (await getStore())!;
    expect(await db.collection(STORE_COLLECTIONS.saved).findOne({ _id: meera.id })).toBeNull();
    expect(await db.collection(STORE_COLLECTIONS.collections).countDocuments({ userId: meera.id })).toBe(0);
  });
});
