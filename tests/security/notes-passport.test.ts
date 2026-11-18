import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";

/** Plan notes and the travel passport in the account, through the real routes. */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  account: typeof import("@/app/api/account/route");
  saved: typeof import("@/app/api/saved/route");
  notes: typeof import("@/app/api/notes/route");
};
let lastCode = "";
let ip = 1;
let addresses = 0;
const ORIGIN = "http://localhost:3000";

const call = (path: string, body: unknown, cookie = "", method = "POST") =>
  new NextRequest(`${ORIGIN}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `198.19.7.${ip++ % 250}`, cookie },
    body: JSON.stringify(body),
  });
const get = (path: string, cookie = "") => new NextRequest(`${ORIGIN}${path}`, { headers: { host: "localhost:3000", cookie } });
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;

async function member() {
  const email = `planner${++addresses}@example.com`;
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose: "login" }));
  const cookie = cookieOf(await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose: "login" })));
  const user = await (await getStore())!.collection(STORE_COLLECTIONS.users).findOne({ email });
  return { cookie, id: user!._id as string };
}

type Note = { id: string; title: string; body: string; date: string | null };
type Entry = { state: string; status: string; month?: string };

const notesPost = async (body: unknown, cookie: string) => {
  const response = await routes.notes.POST(call("/api/notes", body, cookie));
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
};
const notesRead = async (cookie: string) => ((await (await routes.notes.GET(get("/api/notes", cookie))).json()) as { notes: Note[] }).notes;
const savedPost = async (body: unknown, cookie: string) => {
  const response = await routes.saved.POST(call("/api/saved", body, cookie));
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
};
const savedRead = async (cookie: string) => (await (await routes.saved.GET(get("/api/saved", cookie))).json()) as { stamps: string[]; passport: Entry[] };
const note = (id: string, extra: Partial<Note> = {}): Note => ({ id, title: `Note ${id}`, body: "Book the houseboat", date: null, ...extra });

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
    notes: await import("@/app/api/notes/route"),
  };
});

beforeEach(() => resetMemoryStore());

describe("plan notes", () => {
  it("need a signed-in person", async () => {
    expect((await routes.notes.GET(get("/api/notes"))).status).toBe(401);
    expect((await notesPost({ action: "save", note: note("a1") }, "")).status).toBe(401);
    expect((await notesPost({ action: "import", notes: [note("a1")] }, "")).status).toBe(401);
  });

  it("creates, edits in place and deletes, newest first", async () => {
    const asha = await member();
    expect((await notesPost({ action: "save", note: note("first") }, asha.cookie)).status).toBe(200);
    await notesPost({ action: "save", note: note("second", { date: "2026-12-24" }) }, asha.cookie);
    await notesPost({ action: "save", note: note("first", { title: "Kerala in December", body: "Ferry times" }) }, asha.cookie);
    const list = await notesRead(asha.cookie);
    expect(list.map((n) => n.id)).toEqual(["second", "first"]);
    expect(list[1]).toMatchObject({ title: "Kerala in December", body: "Ferry times", date: null });
    expect(list[0]!.date).toBe("2026-12-24");
    expect((await notesPost({ action: "delete", id: "first" }, asha.cookie)).status).toBe(200);
    expect((await notesRead(asha.cookie)).map((n) => n.id)).toEqual(["second"]);
    expect((await notesPost({ action: "delete", id: "first" }, asha.cookie)).status).toBe(404);
  });

  it("checks lengths, ids, dates and unknown fields", async () => {
    const asha = await member();
    const bad = [
      { action: "save", note: note("x", { title: "t".repeat(121) }) },
      { action: "save", note: note("x", { body: "b".repeat(5001) }) },
      { action: "save", note: note("../etc") },
      { action: "save", note: note("x", { date: "2026-02-30" }) },
      { action: "save", note: note("x", { date: "tomorrow" }) },
      { action: "save", note: { ...note("x"), userId: "someone" } },
      { action: "import", notes: [] },
      { action: "import", notes: ["1", "2", "3", "4", "5", "6"].map((id) => note(id)) },
    ];
    for (const body of bad) expect((await notesPost(body, asha.cookie)).status).toBe(422);
    expect(await notesRead(asha.cookie)).toEqual([]);
    expect((await notesPost({ action: "save", note: note("x", { body: "b".repeat(5000) }) }, asha.cookie)).status).toBe(200);
  });

  it("caps how many notes one person can keep", async () => {
    const asha = await member();
    const { NOTE_LIMITS } = await import("@/features/notes/service");
    const db = (await getStore())!.collection(STORE_COLLECTIONS.notes);
    const now = new Date();
    for (let i = 0; i < NOTE_LIMITS.count; i++) await db.insertOne({ _id: `n${i}`, userId: asha.id, noteId: `n${i}`, title: "", body: "", date: null, createdAt: now, updatedAt: now });
    expect((await notesPost({ action: "save", note: note("one-more") }, asha.cookie)).status).toBe(422);
    // Editing an existing note still works at the cap.
    expect((await notesPost({ action: "save", note: note("n3", { title: "Edited" }) }, asha.cookie)).status).toBe(200);
    expect((await notesPost({ action: "import", notes: [note("extra")] }, asha.cookie)).body).toMatchObject({ added: 0, skipped: 1 });
  });

  it("keeps notes private to their owner, even with the same id", async () => {
    const asha = await member();
    const ravi = await member();
    await notesPost({ action: "save", note: note("shared-id", { title: "Asha's plan" }) }, asha.cookie);
    expect(await notesRead(ravi.cookie)).toEqual([]);
    expect((await notesPost({ action: "delete", id: "shared-id" }, ravi.cookie)).status).toBe(404);
    // Ravi saving a note with the same id makes his own note and leaves Asha's alone.
    await notesPost({ action: "save", note: note("shared-id", { title: "Ravi's plan" }) }, ravi.cookie);
    expect((await notesRead(asha.cookie))[0]!.title).toBe("Asha's plan");
    expect((await notesRead(ravi.cookie))[0]!.title).toBe("Ravi's plan");
  });

  it("moves a guest's notes in once, skipping ones the account has, newest staying on top", async () => {
    const asha = await member();
    await notesPost({ action: "save", note: note("kept", { title: "Already here" }) }, asha.cookie);
    const moved = await notesPost({ action: "import", notes: [note("g2", { title: "Newest" }), note("g1", { title: "Oldest" }), note("kept", { title: "From the browser" })] }, asha.cookie);
    expect(moved.body).toMatchObject({ added: 2, skipped: 1 });
    const list = await notesRead(asha.cookie);
    expect(list.map((n) => n.title)).toEqual(["Newest", "Oldest", "Already here"]);
    // Importing the same notes again adds nothing.
    expect((await notesPost({ action: "import", notes: [note("g2"), note("g1")] }, asha.cookie)).body).toMatchObject({ added: 0 });
  });
});

describe("travel passport", () => {
  it("needs a signed-in person", async () => {
    expect((await savedPost({ action: "passport-set", state: "kerala", status: "visited" }, "")).status).toBe(401);
    expect((await savedPost({ action: "passport-merge", entries: [{ state: "kerala", status: "visited" }] }, "")).status).toBe(401);
  });

  it("records want to visit, exploring and visited, with a visit month, and keeps stamps as the visits", async () => {
    const asha = await member();
    await savedPost({ action: "passport-set", state: "kerala", status: "visited", month: "2024-12" }, asha.cookie);
    await savedPost({ action: "passport-set", state: "ladakh", status: "want" }, asha.cookie);
    await savedPost({ action: "passport-set", state: "goa", status: "exploring" }, asha.cookie);
    expect(await savedRead(asha.cookie)).toMatchObject({
      stamps: ["kerala"],
      passport: [
        { state: "kerala", status: "visited", month: "2024-12" },
        { state: "ladakh", status: "want" },
        { state: "goa", status: "exploring" },
      ],
    });
    // Changing a status keeps the state's place; going back from visited drops the month.
    await savedPost({ action: "passport-set", state: "kerala", status: "exploring" }, asha.cookie);
    await savedPost({ action: "passport-set", state: "goa", status: "visited" }, asha.cookie);
    await savedPost({ action: "passport-set", state: "ladakh", status: null }, asha.cookie);
    const after = await savedRead(asha.cookie);
    expect(after.passport).toEqual([
      { state: "kerala", status: "exploring" },
      { state: "goa", status: "visited" },
    ]);
    expect(after.stamps).toEqual(["goa"]);
  });

  it("refuses unknown states, bad statuses and months in the future or the wrong form", async () => {
    const asha = await member();
    const next = new Date();
    next.setUTCMonth(next.getUTCMonth() + 2);
    const future = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
    const bad = [
      { action: "passport-set", state: "atlantis", status: "visited" },
      { action: "passport-set", state: "munnar", status: "visited" },
      { action: "passport-set", state: "kerala", status: "lived" },
      { action: "passport-set", state: "kerala", status: "visited", month: future },
      { action: "passport-set", state: "kerala", status: "visited", month: "1949-12" },
      { action: "passport-set", state: "kerala", status: "visited", month: "2024-13" },
      { action: "passport-set", state: "kerala", status: "visited", month: "Dec 2024" },
      { action: "passport-set", state: "kerala", status: "want", month: "2024-12" },
      { action: "passport-set", state: "kerala", status: "visited", lat: 9.9 },
    ];
    for (const body of bad) expect((await savedPost(body, asha.cookie)).status).toBe(422);
    expect((await savedRead(asha.cookie)).passport).toEqual([]);
  });

  it("moves a guest's passport without overriding the account's own entries", async () => {
    const asha = await member();
    await savedPost({ action: "passport-set", state: "goa", status: "want" }, asha.cookie);
    const merged = await savedPost(
      {
        action: "passport-merge",
        entries: [
          { state: "goa", status: "visited" },
          { state: "sikkim", status: "visited", month: "2023-04" },
          { state: "assam", status: "exploring" },
          { state: "atlantis", status: "visited" },
          { state: "sikkim", status: "want" },
        ],
      },
      asha.cookie,
    );
    expect(merged.status).toBe(200);
    expect(merged.body.passport).toEqual([
      { state: "goa", status: "want" },
      { state: "sikkim", status: "visited", month: "2023-04" },
      { state: "assam", status: "exploring" },
    ]);
  });

  it("reads stamps saved before statuses as visits, and the old stamp actions still work", async () => {
    const asha = await member();
    const saved = (await getStore())!.collection(STORE_COLLECTIONS.saved);
    await saved.insertOne({ _id: asha.id, places: [], stamps: ["kerala", "goa"], updatedAt: new Date() });
    expect((await savedRead(asha.cookie)).passport).toEqual([
      { state: "kerala", status: "visited" },
      { state: "goa", status: "visited" },
    ]);
    await savedPost({ action: "set", kind: "stamps", slug: "assam", on: true }, asha.cookie);
    await savedPost({ action: "set", kind: "stamps", slug: "kerala", on: false }, asha.cookie);
    const after = await savedRead(asha.cookie);
    expect(after.stamps).toEqual(["goa", "assam"]);
    expect((await saved.findOne({ _id: asha.id }))!.stamps).toEqual(["goa", "assam"]);
  });

  it("keeps each person's passport apart, and badges count visits only", async () => {
    const { computeBadges } = await import("@/features/user/badges");
    const asha = await member();
    const ravi = await member();
    for (const state of ["kerala", "goa", "karnataka"]) await savedPost({ action: "passport-set", state, status: "visited" }, asha.cookie);
    await savedPost({ action: "passport-set", state: "tamil-nadu", status: "want" }, asha.cookie);
    expect((await savedRead(ravi.cookie)).passport).toEqual([]);
    const { stamps } = await savedRead(asha.cookie);
    const badges = computeBadges(stamps, () => "south");
    expect(badges.find((b) => b.id === "coast")!.earned).toBe(true);
    expect(badges.find((b) => b.id === "five")!.earned).toBe(false);
  });
});

describe("deleting the account", () => {
  it("removes notes and the passport", async () => {
    const asha = await member();
    await notesPost({ action: "save", note: note("n1") }, asha.cookie);
    await savedPost({ action: "passport-set", state: "kerala", status: "visited" }, asha.cookie);
    expect((await routes.account.DELETE(call("/api/account", { confirm: "DELETE" }, asha.cookie, "DELETE"))).status).toBe(200);
    const db = (await getStore())!;
    expect(await db.collection(STORE_COLLECTIONS.notes).countDocuments({ userId: asha.id })).toBe(0);
    expect(await db.collection(STORE_COLLECTIONS.saved).findOne({ _id: asha.id })).toBeNull();
  });
});
