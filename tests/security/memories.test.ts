import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";

/** Memories, quiz history, achievements and My contributions, through the real routes. */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  account: typeof import("@/app/api/account/route");
  memories: typeof import("@/app/api/memories/route");
  quiz: typeof import("@/app/api/quiz/route");
  profile: typeof import("@/app/api/profile/route");
  community: typeof import("@/app/api/community/route");
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
  const email = `memory${++addresses}@example.com`;
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose: "login" }));
  const cookie = cookieOf(await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose: "login" })));
  const user = await (await getStore())!.collection(STORE_COLLECTIONS.users).findOne({ email });
  return { cookie, id: user!._id as string };
}
const post = async (body: unknown, cookie: string) => {
  const response = await routes.memories.POST(call("/api/memories", body, cookie));
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
};
const quiz = async (body: unknown, cookie: string) => {
  const response = await routes.quiz.POST(call("/api/quiz", body, cookie));
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
};
const memory = (fields: Record<string, unknown> = {}) => ({
  title: "Sunrise at Tiger Hill",
  body: "We left at four. The tea at the top was the best of the trip.",
  date: "2025-11-02",
  place: "place:darjeeling",
  tags: ["Sunrise", "tea", " Family "],
  photos: ["destination:darjeeling"],
  ...fields,
});
const create = async (cookie: string, fields: Record<string, unknown> = {}) => {
  const result = await post({ action: "create", memory: memory(fields) }, cookie);
  expect(result.status).toBe(201);
  return (result.body.memory as { id: string }).id;
};

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
    memories: await import("@/app/api/memories/route"),
    quiz: await import("@/app/api/quiz/route"),
    profile: await import("@/app/api/profile/route"),
    community: await import("@/app/api/community/route"),
  };
});

beforeEach(() => resetMemoryStore());

describe("memories", () => {
  it("need a signed-in person", async () => {
    expect((await routes.memories.GET(get("/api/memories"))).status).toBe(401);
    expect((await post({ action: "create", memory: memory() }, "")).status).toBe(401);
    expect((await routes.quiz.GET(get("/api/quiz"))).status).toBe(401);
    expect((await quiz({ action: "save", answers: "month=1" }, "")).status).toBe(401);
  });

  it("save, list, search by tag and place, edit and delete", async () => {
    const meera = await member();
    const { listMemories, memoryForOwner } = await import("@/features/memories/service");
    const first = await create(meera.cookie);
    await create(meera.cookie, { title: "Fish curry in Panaji", place: "state:goa", tags: ["food"], photos: [], date: "2024-03-01" });
    const all = await listMemories(meera.id);
    expect(all.map((m) => m.title)).toEqual(["Sunrise at Tiger Hill", "Fish curry in Panaji"]);
    // Tags are tidied: lower case, trimmed, no repeats.
    expect(all[0]!.tags).toEqual(["sunrise", "tea", "family"]);
    expect(all[0]!.placeName).toBe("Darjeeling");
    expect((await listMemories(meera.id, { tag: "food" })).map((m) => m.title)).toEqual(["Fish curry in Panaji"]);
    // A state finds memories of its places too.
    expect((await listMemories(meera.id, { place: "state:west-bengal" })).map((m) => m.title)).toEqual(["Sunrise at Tiger Hill"]);
    expect((await listMemories(meera.id, { q: "panaji" })).length).toBe(1);

    expect((await post({ action: "update", id: first, memory: memory({ title: "Tiger Hill, again" }) }, meera.cookie)).status).toBe(200);
    expect((await memoryForOwner(meera.id, first))!.title).toBe("Tiger Hill, again");
    expect((await post({ action: "delete", id: first }, meera.cookie)).status).toBe(200);
    expect(await memoryForOwner(meera.id, first)).toBeNull();
  });

  it("refuse places, photos and dates that aren't real, and strict input", async () => {
    const meera = await member();
    expect((await post({ action: "create", memory: memory({ place: "place:atlantis" }) }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "create", memory: memory({ photos: ["https://evil.example/cat.jpg"] }) }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "create", memory: memory({ photos: ["destination:not-a-place"] }) }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "create", memory: memory({ date: "2999-01-01" }) }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "create", memory: memory({ date: "2025-02-30" }) }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "create", memory: memory({ tags: Array.from({ length: 11 }, (_, i) => `tag${i}`) }) }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "create", memory: memory({ photos: ["hero:kerala", "hero:goa", "hero:kashmir", "hero:ladakh", "hero:rajasthan", "hero:taj-mahal", "hero:varanasi"] }) }, meera.cookie)).status).toBe(422);
    expect((await post({ action: "create", memory: { ...memory(), userId: "someone-else" } }, meera.cookie)).status).toBe(422);
  });

  it("stop at the limit", async () => {
    const meera = await member();
    const { MEMORY_LIMIT } = await import("@/features/memories/schema");
    const rows = (await getStore())!.collection(STORE_COLLECTIONS.memories);
    const now = new Date();
    for (let i = 0; i < MEMORY_LIMIT; i += 1) {
      await rows.insertOne({ _id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`, userId: meera.id, title: `m${i}`, body: "", date: "2025-01-01", place: "", tags: [], photos: [], createdAt: now, updatedAt: now });
    }
    const refused = await post({ action: "create", memory: memory() }, meera.cookie);
    expect(refused.status).toBe(422);
    expect(refused.body.error).toMatch(/up to 200/);
  });

  it("are invisible and untouchable to anyone else", async () => {
    const meera = await member();
    const ravi = await member();
    const id = await create(meera.cookie);
    const { listMemories, memoryForOwner } = await import("@/features/memories/service");
    expect(await listMemories(ravi.id)).toEqual([]);
    expect(await memoryForOwner(ravi.id, id)).toBeNull();
    for (const body of [
      { action: "update", id, memory: memory({ title: "Mine now" }) },
      { action: "share", id, on: true },
      { action: "delete", id },
    ]) {
      expect((await post(body, ravi.cookie)).status).toBe(404);
    }
    expect((await memoryForOwner(meera.id, id))!.title).toBe("Sunrise at Tiger Hill");
    const listed = (await (await routes.memories.GET(get("/api/memories", ravi.cookie))).json()) as { memories: unknown[] };
    expect(listed.memories).toEqual([]);
  });
});

describe("memory share links", () => {
  it("show the memory without its owner, filter the text, and stop when off or the owner is restricted", async () => {
    const meera = await member();
    const { sharedMemory } = await import("@/features/memories/service");
    const id = await create(meera.cookie, { body: "The shit tea was still the best." });
    const first = (await post({ action: "share", id, on: true }, meera.cookie)).body.shareId as string;
    expect(first).toMatch(/^[A-Za-z0-9_-]{16}$/);
    const shared = await sharedMemory(first);
    expect(shared!.title).toBe("Sunrise at Tiger Hill");
    // Swearing is masked for others; the owner's own copy keeps their words.
    expect(shared!.body).toBe("The **** tea was still the best.");
    expect(JSON.stringify(shared)).not.toContain(meera.id);
    expect(Object.keys(shared!).sort()).toEqual(["body", "date", "photos", "placeName", "tags", "title"]);

    const users = (await getStore())!.collection(STORE_COLLECTIONS.users);
    await users.updateOne({ _id: meera.id }, { $set: { status: "blocked" } });
    expect(await sharedMemory(first)).toBeNull();
    await users.updateOne({ _id: meera.id }, { $set: { status: "active" } });
    expect(await sharedMemory(first)).not.toBeNull();

    await post({ action: "share", id, on: false }, meera.cookie);
    expect(await sharedMemory(first)).toBeNull();
    const second = (await post({ action: "share", id, on: true }, meera.cookie)).body.shareId as string;
    expect(second).not.toBe(first);
    expect(await sharedMemory(second)).not.toBeNull();
    expect(await sharedMemory(first)).toBeNull();
    expect(await sharedMemory("not-a-real-link!")).toBeNull();
  });

  it("refuse to share contact details, links or hostile words, and keep a shared memory clean", async () => {
    const meera = await member();
    const phone = await create(meera.cookie, { body: "Call our driver on 98765 43210." });
    expect((await post({ action: "share", id: phone, on: true }, meera.cookie)).status).toBe(422);
    const link = await create(meera.cookie, { body: "We booked through https://example.com/hotel" });
    expect((await post({ action: "share", id: link, on: true }, meera.cookie)).status).toBe(422);
    const hostile = await create(meera.cookie, { body: "Jains are backward people" });
    expect((await post({ action: "share", id: hostile, on: true }, meera.cookie)).status).toBe(422);

    // Private memories can hold anything the owner likes; only the shared one is checked on edit.
    const clean = await create(meera.cookie);
    expect((await post({ action: "share", id: clean, on: true }, meera.cookie)).status).toBe(200);
    const edited = await post({ action: "update", id: clean, memory: memory({ body: "Email me at meera@example.com" }) }, meera.cookie);
    expect(edited.status).toBe(422);
    expect(edited.body.error).toMatch(/shared by link/);

    // A memory that slipped past (say the filter grew) still isn't shown by its link.
    const { sharedMemory } = await import("@/features/memories/service");
    const rows = (await getStore())!.collection(STORE_COLLECTIONS.memories);
    const doc = await rows.findOne({ _id: clean });
    await rows.updateOne({ _id: clean }, { $set: { body: "you katua" } });
    expect(await sharedMemory(doc!.shareId as string)).toBeNull();
  });

  it("go with the account, along with quiz results and achievements", async () => {
    const meera = await member();
    const { sharedMemory } = await import("@/features/memories/service");
    const { achievementsFor } = await import("@/features/achievements/service");
    const id = await create(meera.cookie);
    const shareId = (await post({ action: "share", id, on: true }, meera.cookie)).body.shareId as string;
    expect((await quiz({ action: "save", answers: "month=12&budget=mid" }, meera.cookie)).body).toEqual({ saved: true });
    await achievementsFor(meera.id, { record: true });
    const store = (await getStore())!;
    expect(await store.collection(STORE_COLLECTIONS.achievements).findOne({ _id: meera.id })).not.toBeNull();

    expect((await routes.account.DELETE(call("/api/account", { confirm: "DELETE" }, meera.cookie, "DELETE"))).status).toBe(200);
    expect(await sharedMemory(shareId)).toBeNull();
    expect(await store.collection(STORE_COLLECTIONS.memories).countDocuments({ userId: meera.id })).toBe(0);
    expect(await store.collection(STORE_COLLECTIONS.quizAttempts).countDocuments({ userId: meera.id })).toBe(0);
    expect(await store.collection(STORE_COLLECTIONS.achievements).findOne({ _id: meera.id })).toBeNull();
  });
});

describe("quiz history", () => {
  it("keeps the answers, works out the matches itself, and skips repeats and junk", async () => {
    const meera = await member();
    const { listAttempts } = await import("@/features/quiz/history");
    const { scoreDestinations, toCandidate } = await import("@/features/quiz/score");
    const { readAnswers } = await import("@/features/quiz/params");
    const { destinations } = await import("@/data");

    expect((await quiz({ action: "save", answers: "step=results&month=12&budget=mid&style=beaches&evil=<script>" }, meera.cookie)).body).toEqual({ saved: true });
    // The same answers again straight after aren't kept twice.
    expect((await quiz({ action: "save", answers: "month=12&budget=mid&style=beaches" }, meera.cookie)).body).toEqual({ saved: false });
    // Nothing real answered: nothing kept.
    expect((await quiz({ action: "save", answers: "month=99&budget=free" }, meera.cookie)).body).toEqual({ saved: false });

    const [attempt] = await listAttempts(meera.id);
    expect(attempt!.query).toBe("month=12&budget=mid&style=beaches");
    const expected = scoreDestinations(destinations.map(toCandidate), readAnswers(new URLSearchParams(attempt!.query))).map((m) => m.slug);
    expect(attempt!.matches.map((m) => m.slug)).toEqual(expected);
    expect(await listAttempts(meera.id)).toHaveLength(1);
  });

  it("keeps the latest 50, and only the owner can remove one", async () => {
    const meera = await member();
    const ravi = await member();
    const { ATTEMPT_LIMIT, listAttempts, saveAttempt } = await import("@/features/quiz/history");
    for (let i = 0; i < ATTEMPT_LIMIT + 3; i += 1) await saveAttempt(meera.id, `length=${[3, 7, 14][i % 3]}&month=${(i % 12) + 1}`);
    const kept = await listAttempts(meera.id);
    expect(kept).toHaveLength(ATTEMPT_LIMIT);
    expect((await quiz({ action: "delete", id: kept[0]!.id }, ravi.cookie)).status).toBe(404);
    expect((await quiz({ action: "delete", id: kept[0]!.id }, meera.cookie)).status).toBe(200);
    expect(await listAttempts(meera.id)).toHaveLength(ATTEMPT_LIMIT - 1);
    expect((await quiz({ action: "clear" }, meera.cookie)).status).toBe(200);
    expect(await listAttempts(meera.id)).toHaveLength(0);
  });
});

describe("achievements", () => {
  it("come only from real activity and record when each was first earned", async () => {
    const meera = await member();
    const { achievementsFor } = await import("@/features/achievements/service");
    const fresh = (await achievementsFor(meera.id, { record: true }))!;
    expect(fresh.filter((a) => a.earned)).toEqual([]);

    await create(meera.cookie);
    await quiz({ action: "save", answers: "month=1" }, meera.cookie);
    const { setItem } = await import("@/features/saved/service");
    await setItem(meera.id, "stamps", "goa", true);
    const after = (await achievementsFor(meera.id, { record: true }))!;
    const earned = after.filter((a) => a.earned).map((a) => a.id);
    expect(earned.sort()).toEqual(["memory-first", "passport-first", "quiz-first"]);
    expect(after.find((a) => a.id === "memory-first")!.earnedAt).toBeTruthy();
    expect(after.find((a) => a.id === "memory-ten")).toMatchObject({ earned: false, progress: { current: 1, target: 10 } });
  });

  it("count helpful votes others give, and show on the public page only when chosen", async () => {
    const meera = await member();
    const ravi = await member();
    await routes.account.POST(call("/api/account", { name: "Meera Iyer", country: "India", homeState: "Kerala", interests: ["Food"], marketingConsent: false }, meera.cookie));
    const comment = (await (await routes.community.POST(call("/api/community", { action: "comment", target: { type: "place", id: "hampi" }, kind: "tip", body: "Hire a bicycle near the bazaar." }, meera.cookie))).json()) as { id: string };
    // Marking your own comment helpful counts for nothing; someone else's vote does.
    await routes.community.POST(call("/api/community", { action: "helpful", commentId: comment.id }, ravi.cookie));

    const { achievementsFor } = await import("@/features/achievements/service");
    const list = (await achievementsFor(meera.id))!;
    expect(list.find((a) => a.id === "comment-first")!.earned).toBe(true);
    expect(list.find((a) => a.id === "helpful-first")!.earned).toBe(true);

    const { publicProfile } = await import("@/features/profile/service");
    const username = `meera_${addresses}`;
    const identity = { action: "identity", identity: { username, avatar: "tea-garden", cover: "hero:kerala", tagline: "", bio: "", city: "", website: "" } };
    expect((await routes.profile.POST(call("/api/profile", identity, meera.cookie))).status).toBe(200);
    const privacy = (show: string[]) => ({ action: "privacy", privacy: { visibility: "public", show, linkComments: false } });
    await routes.profile.POST(call("/api/profile", privacy(["joined"]), meera.cookie));
    expect((await publicProfile(username, false))!.achievements).toBeUndefined();
    await routes.profile.POST(call("/api/profile", privacy(["joined", "achievements"]), meera.cookie));
    const shown = (await publicProfile(username, false))!.achievements!;
    expect(shown.map((a) => a.id).sort()).toEqual(["comment-first", "helpful-first"]);
    // Only what was earned, never progress towards the rest.
    expect(JSON.stringify(shown)).not.toMatch(/progress|earnedAt/);
  });
});

describe("my contributions", () => {
  it("list only the person's own comments, edits and reports, with their outcomes", async () => {
    const meera = await member();
    const ravi = await member();
    const profile = { name: "Someone", country: "India", homeState: "Kerala", interests: ["Food"], marketingConsent: false };
    await routes.account.POST(call("/api/account", profile, meera.cookie));
    await routes.account.POST(call("/api/account", profile, ravi.cookie));
    const target = { type: "place", id: "hampi" };
    const mine = (await (await routes.community.POST(call("/api/community", { action: "comment", target, kind: "tip", body: "Hire a bicycle near the bazaar." }, meera.cookie))).json()) as { id: string };
    const theirs = (await (await routes.community.POST(call("/api/community", { action: "comment", target, kind: "tip", body: "Go early for the boulders." }, ravi.cookie))).json()) as { id: string };
    await routes.community.POST(call("/api/community", { action: "helpful", commentId: mine.id }, ravi.cookie));
    await routes.community.POST(call("/api/community", { action: "report", commentId: theirs.id, reason: "spam" }, meera.cookie));
    const rows = (await getStore())!.collection(STORE_COLLECTIONS.edits);
    await rows.insertOne({ _id: "edit-1", target: "place:hampi", title: "Hampi", path: "/encyclopedia/hampi", field: "summary", current: "", proposed: "New", reason: "Out of date", userId: meera.id, authorName: "Someone", status: "rejected", createdAt: new Date(), reviewNote: "Internal note for admins" });
    await rows.insertOne({ _id: "edit-2", target: "place:hampi", title: "Hampi", path: "/encyclopedia/hampi", field: "summary", current: "", proposed: "Other", reason: "Mine", userId: ravi.id, authorName: "Someone", status: "pending", createdAt: new Date() });

    const { contributionsOf } = await import("@/features/contributions/service");
    const data = (await contributionsOf(meera.id))!;
    expect(data.comments.map((c) => c.id)).toEqual([mine.id]);
    expect(data.comments[0]).toMatchObject({ status: "visible", helpful: 1, page: { title: "Hampi" } });
    expect(data.helpful).toEqual({ total: 1, comments: 1 });
    expect(data.edits.map((e) => [e.id, e.status])).toEqual([["edit-1", "rejected"]]);
    expect(data.reports).toMatchObject([{ reason: "spam", outcome: "visible", page: { title: "Hampi" } }]);
    // Moderators' notes stay private.
    expect(JSON.stringify(data)).not.toContain("Internal note");
    expect((await contributionsOf(ravi.id))!.reports).toEqual([]);
  });
});
