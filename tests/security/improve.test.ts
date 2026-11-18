import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { admin, call, owner, setup, signIn, withRole } from "../support/admin";

/** The improvement engine: recommendations from real records only, with review states and who decided. */
let improve: typeof import("@/app/api/admin/improve/route").POST;
let engine: typeof import("@/features/improve/engine");

beforeAll(async () => {
  await setup();
  improve = (await import("@/app/api/admin/improve/route")).POST;
  engine = await import("@/features/improve/engine");
});
beforeEach(() => resetMemoryStore());

const byKind = async (kind: string) => (await engine.refresh()).filter((row) => row.kind === kind && row.active);

describe("the improvement engine", () => {
  it("makes no data-driven recommendations when nothing has been recorded", async () => {
    for (const kind of ["zero-search", "yatri-gap", "wrong-report"]) expect(await byKind(kind)).toEqual([]);
  });

  it("reads Phase 6's zero-result searches, Yatri's weak answers and wrong-info reports", async () => {
    const db = (await getStore())!;
    const today = new Date().toISOString().slice(0, 10);
    await db.collection("analytics_daily").insertOne({ _id: `${today}:search:toy train`, dim: "search", key: "toy train", day: today, count: 5, zero: 4 });
    await db.collection("analytics_daily").insertOne({ _id: `${today}:search:goa`, dim: "search", key: "goa", day: today, count: 9, zero: 0 });
    const soon = new Date(Date.now() + 86_400_000);
    for (let i = 0; i < 2; i += 1) await db.collection(STORE_COLLECTIONS.yatriQuestions).insertOne({ _id: crypto.randomUUID(), question: "Is the Matheran toy train running?", mode: "guide", confidence: "unanswered", tokenHash: "x", feedback: null, status: "new", createdAt: new Date(), expiresAt: soon });
    await db.collection(STORE_COLLECTIONS.yatriQuestions).insertOne({ _id: crypto.randomUUID(), question: "Tell me about Hampi", mode: "guide", confidence: "ok", tokenHash: "x", feedback: "up", status: "new", createdAt: new Date(), expiresAt: soon });
    const comment = crypto.randomUUID();
    await db.collection(STORE_COLLECTIONS.comments).insertOne({ _id: comment, target: "place:goa", status: "visible", body: "Wrong", createdAt: new Date() });
    await db.collection(STORE_COLLECTIONS.reports).insertOne({ _id: `${comment}:u1`, commentId: comment, userId: "u1", reason: "wrong", createdAt: new Date() });
    await db.collection(STORE_COLLECTIONS.reports).insertOne({ _id: `${comment}:u2`, commentId: comment, userId: "u2", reason: "spam", createdAt: new Date() });

    const searches = await byKind("zero-search");
    expect(searches).toHaveLength(1);
    expect(searches[0]).toMatchObject({ count: 4, state: "new" });
    expect(searches[0]!.evidence).toContain("4 searches");
    const yatri = await byKind("yatri-gap");
    expect(yatri.map((row) => row.count)).toEqual([2]);
    expect(yatri[0]!.title).toContain("matheran toy train");
    expect(await byKind("wrong-report")).toMatchObject([{ _id: "wrong-report:place:goa", count: 1, href: "/encyclopedia/goa" }]);
  });

  it("keeps a decision with who made it, and marks recommendations whose evidence has gone", async () => {
    const db = (await getStore())!;
    const today = new Date().toISOString().slice(0, 10);
    await db.collection("analytics_daily").insertOne({ _id: "s1", dim: "search", key: "houseboat", day: today, count: 3, zero: 3 });
    const [rec] = await byKind("zero-search");

    const boss = await admin(owner());
    const editor = await withRole(boss, "editor");
    const moderator = await withRole(boss, "moderator");
    const user = await signIn("visitor@example.com");
    const decide = (cookie: string, state: string) => improve(call("/api/admin/improve", { id: rec!._id, state }, cookie));
    expect((await decide("", "accepted")).status).toBe(401);
    expect((await decide(user, "accepted")).status).toBe(403);
    expect((await decide(moderator.cookie, "accepted")).status).toBe(403);
    expect((await decide(editor.cookie, "maybe")).status).toBe(422);
    expect((await decide(editor.cookie, "accepted")).status).toBe(200);

    await db.collection("analytics_daily").deleteMany({});
    const after = (await engine.refresh()).find((row) => row._id === rec!._id)!;
    expect(after).toMatchObject({ state: "accepted", decidedBy: editor.id, decidedByEmail: editor.email, active: false });
    expect(await db.collection(STORE_COLLECTIONS.audit).findOne({ action: "improve.decide" })).toMatchObject({ actorId: editor.id, after: { state: "accepted" } });
  });
});
