import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { destinations } from "@/data";
import { startCities } from "@/data/start-cities";
import { generateItinerary } from "@/features/itinerary/generate";
import { storedInput } from "@/features/itinerary/share";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";

/** Trips saved to an account, through the real routes. */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  account: typeof import("@/app/api/account/route");
  trips: typeof import("@/app/api/trips/route");
};
let lastCode = "";
let ip = 1;
let addresses = 0;
const ORIGIN = "http://localhost:3000";

const call = (path: string, body: unknown, cookie = "", method = "POST") =>
  new NextRequest(`${ORIGIN}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `198.19.4.${ip++ % 250}`, cookie },
    body: JSON.stringify(body),
  });
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;

async function member() {
  const email = `tripper${++addresses}@example.com`;
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose: "login" }));
  const cookie = cookieOf(await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose: "login" })));
  const user = await (await getStore())!.collection(STORE_COLLECTIONS.users).findOne({ email });
  return { cookie, id: user!._id as string };
}
const post = async (body: unknown, cookie: string) => {
  const response = await routes.trips.POST(call("/api/trips", body, cookie));
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
};
const list = async (cookie: string) =>
  ((await (await routes.trips.GET(new NextRequest(`${ORIGIN}/api/trips`, { headers: { host: "localhost:3000", cookie } }))).json()) as { trips: { id: string; name: string; status: string; shared: boolean; places: string[] }[] }).trips;

/** A real plan from the planner: Delhi to Jaipur and Agra, five days. */
function plan(days = 5, slugs = ["jaipur", "agra"]) {
  const city = startCities.find((c) => c.name === "Delhi") ?? startCities[0]!;
  const trip = generateItinerary(
    { startName: city.name, start: city.point, destinationSlugs: slugs, startDate: "2027-01-10", travellers: 2, days, budget: null, transport: "mixed", interests: [] },
    destinations,
  );
  return { input: storedInput(trip.input), layout: trip.days.map((day) => day.items.map((item) => item.id)) };
}
const create = async (cookie: string, name = "Golden triangle", extra: Record<string, unknown> = {}) =>
  ((await post({ action: "create", name, ...plan(), ...extra }, cookie)).body.trip as { id: string }).id;

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
    trips: await import("@/app/api/trips/route"),
  };
});

beforeEach(() => resetMemoryStore());

describe("saving trips", () => {
  it("needs a signed-in person", async () => {
    expect((await routes.trips.GET(new NextRequest(`${ORIGIN}/api/trips`, { headers: { host: "localhost:3000" } }))).status).toBe(401);
    expect((await post({ action: "create", name: "Trip", ...plan() }, "")).status).toBe(401);
  });

  it("saves a planner trip and rebuilds it the same from the guide", async () => {
    const meera = await member();
    const id = await create(meera.cookie);
    expect(await list(meera.cookie)).toMatchObject([{ id, name: "Golden triangle", status: "active", places: ["Jaipur", "Agra"], shared: false }]);
    const { tripForOwner } = await import("@/features/trips/service");
    const view = await tripForOwner(meera.id, id);
    const original = plan();
    expect(view!.days.map((day) => day.items.map((item) => item.id))).toEqual(original.layout);
    expect(view!.trip.totals.group).toBeGreaterThan(0);
  });

  it("saves a 45-day trip, and a long expense list past the usual 16 KB request size", async () => {
    const meera = await member();
    const long = plan(45, ["jaipur", "agra", "varanasi", "goa", "hampi", "munnar"]);
    const id = ((await post({ action: "create", name: "Six weeks", ...long }, meera.cookie)).body.trip as { id: string }).id;
    const items = Array.from({ length: 250 }, (_, i) => ({ id: `e${i}`, label: `Autorickshaw to the station, day ${i}`.padEnd(70, "."), amount: 150 + i, paidBy: "Meera" }));
    const expenses = { people: ["Meera", "Ravi"], items };
    expect(JSON.stringify(expenses).length).toBeGreaterThan(16 * 1024);
    expect((await post({ action: "expenses", id, expenses }, meera.cookie)).status).toBe(200);
  });

  it("refuses plans that can't be rebuilt, and ignores words slipped into the layout", async () => {
    const meera = await member();
    const good = plan();
    expect((await post({ action: "create", name: "Nowhere", ...good, input: { ...good.input, destinationSlugs: ["atlantis"] } }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "create", name: "Moon", ...good, input: { ...good.input, startName: "The Moon" } }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "create", name: "Forever", ...good, input: { ...good.input, days: 400 } }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "create", name: "", ...good }, meera.cookie)).status).toBe(422);

    const id = await create(meera.cookie, "Crafted", { layout: [["<script>alert(1)</script>", good.layout[0]![0]!], ...good.layout.slice(1)] });
    const { tripForOwner } = await import("@/features/trips/service");
    const text = JSON.stringify((await tripForOwner(meera.id, id))!.days);
    expect(text).not.toContain("<script>");
  });

  it("renames, archives, restores, duplicates and deletes", async () => {
    const meera = await member();
    const id = await create(meera.cookie);
    await post({ action: "expenses", id, expenses: { people: ["Meera", "Ravi"], items: [{ id: "1", label: "Train", amount: 2400, paidBy: "Meera" }] } }, meera.cookie);
    await post({ action: "share", id, on: true }, meera.cookie);
    expect((await post({ action: "rename", id, name: "Winter in Rajasthan" }, meera.cookie)).status).toBe(200);
    expect((await post({ action: "archive", id, archived: true }, meera.cookie)).status).toBe(200);
    expect((await list(meera.cookie))[0]).toMatchObject({ name: "Winter in Rajasthan", status: "archived" });
    await post({ action: "archive", id, archived: false }, meera.cookie);

    const copy = ((await post({ action: "duplicate", id }, meera.cookie)).body.trip as { id: string; name: string; shared: boolean });
    expect(copy).toMatchObject({ name: "Winter in Rajasthan (copy)", shared: false });
    const { tripForOwner } = await import("@/features/trips/service");
    expect((await tripForOwner(meera.id, copy.id))!.expenses).toEqual({ people: [], items: [] });

    expect((await post({ action: "delete", id }, meera.cookie)).status).toBe(200);
    expect((await list(meera.cookie)).map((t) => t.id)).toEqual([copy.id]);
  });

  it("updates the plan from the planner", async () => {
    const meera = await member();
    const id = await create(meera.cookie);
    const changed = plan(7, ["jaipur", "udaipur"]);
    expect((await post({ action: "update-plan", id, ...changed }, meera.cookie)).status).toBe(200);
    expect((await list(meera.cookie))[0]!.places).toEqual(["Jaipur", "Udaipur"]);
  });

  it("checks expenses", async () => {
    const meera = await member();
    const id = await create(meera.cookie);
    const bad = [
      { people: ["Meera"], items: [{ id: "1", label: "Train", amount: -5, paidBy: "Meera" }] },
      { people: ["Meera"], items: [{ id: "1", label: "", amount: 5, paidBy: "Meera" }] },
      { people: ["x".repeat(41)], items: [] },
    ];
    for (const expenses of bad) expect((await post({ action: "expenses", id, expenses }, meera.cookie)).status).toBe(422);
  });

  it("caps how many trips one person keeps", async () => {
    const meera = await member();
    const { TRIP_LIMIT } = await import("@/features/trips/service");
    const db = (await getStore())!;
    const now = new Date();
    for (let i = 0; i < TRIP_LIMIT; i += 1) {
      await db.collection(STORE_COLLECTIONS.trips).insertOne({ _id: crypto.randomUUID(), userId: meera.id, name: `T${i}`, ...plan(), expenses: { people: [], items: [] }, status: "active", createdAt: now, updatedAt: now });
    }
    expect((await post({ action: "create", name: "One too many", ...plan() }, meera.cookie)).status).toBe(422);
  });

  it("moves a guest's trips over, skipping any that can't be rebuilt", async () => {
    const meera = await member();
    const good = plan();
    const result = await post({ action: "import", trips: [{ name: "From the browser", ...good }, { name: "Broken", ...good, input: { ...good.input, destinationSlugs: ["atlantis"] } }] }, meera.cookie);
    expect(result).toMatchObject({ status: 200, body: { added: 1 } });
    expect((await list(meera.cookie)).map((t) => t.name)).toEqual(["From the browser"]);
  });
});

describe("other people's trips", () => {
  it("are invisible and untouchable", async () => {
    const meera = await member();
    const ravi = await member();
    const id = await create(meera.cookie);
    for (const body of [
      { action: "rename", id, name: "Mine" },
      { action: "archive", id, archived: true },
      { action: "duplicate", id },
      { action: "delete", id },
      { action: "share", id, on: true },
      { action: "expenses", id, expenses: { people: [], items: [] } },
      { action: "update-plan", id, ...plan() },
    ]) {
      expect((await post(body, ravi.cookie)).status, body.action).toBe(404);
    }
    expect(await list(ravi.cookie)).toEqual([]);
    const { tripForOwner } = await import("@/features/trips/service");
    expect(await tripForOwner(ravi.id, id)).toBeNull();
    expect((await list(meera.cookie))[0]).toMatchObject({ name: "Golden triangle", status: "active", shared: false });
  });
});

describe("share links", () => {
  it("show the plan but never the expenses, and stop when turned off or the owner is restricted", async () => {
    const { sharedTrip } = await import("@/features/trips/service");
    const meera = await member();
    const id = await create(meera.cookie);
    await post({ action: "expenses", id, expenses: { people: ["Meera Iyer", "Ravi"], items: [{ id: "1", label: "Secret spa", amount: 9000, paidBy: "Meera Iyer" }] } }, meera.cookie);
    const first = (await post({ action: "share", id, on: true }, meera.cookie)).body.shareId as string;
    const shared = await sharedTrip(first);
    expect(shared!.name).toBe("Golden triangle");
    expect(JSON.stringify(shared)).not.toMatch(/Secret spa|Meera Iyer|9000/);

    const users = (await getStore())!.collection(STORE_COLLECTIONS.users);
    await users.updateOne({ _id: meera.id }, { $set: { status: "blocked" } });
    expect(await sharedTrip(first)).toBeNull();
    await users.updateOne({ _id: meera.id }, { $set: { status: "active" } });

    await post({ action: "share", id, on: false }, meera.cookie);
    expect(await sharedTrip(first)).toBeNull();
    const second = (await post({ action: "share", id, on: true }, meera.cookie)).body.shareId as string;
    expect(second).not.toBe(first);
    expect(await sharedTrip(second)).not.toBeNull();
  });

  it("go with the account", async () => {
    const { sharedTrip } = await import("@/features/trips/service");
    const meera = await member();
    const id = await create(meera.cookie);
    const shareId = (await post({ action: "share", id, on: true }, meera.cookie)).body.shareId as string;
    expect((await routes.account.DELETE(call("/api/account", { confirm: "DELETE" }, meera.cookie, "DELETE"))).status).toBe(200);
    expect(await sharedTrip(shareId)).toBeNull();
    expect(await (await getStore())!.collection(STORE_COLLECTIONS.trips).countDocuments({ userId: meera.id })).toBe(0);
  });
});
