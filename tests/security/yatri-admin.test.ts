import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { encodeConsent } from "@/lib/consent";
import { admin, call, owner, setup, signIn, withRole } from "../support/admin";

/** Yatri administration: consent-aware question records, feedback ownership, usage, and the review queue. */
let assistant: typeof import("@/app/api/assistant/route").POST;
let feedback: typeof import("@/app/api/assistant/feedback/route").POST;
let yatri: typeof import("@/app/api/admin/yatri/route").POST;
let insights: typeof import("@/features/assistant/insights");

beforeAll(async () => {
  await setup();
  delete process.env.GROQ_API_KEY;
  assistant = (await import("@/app/api/assistant/route")).POST;
  feedback = (await import("@/app/api/assistant/feedback/route")).POST;
  yatri = (await import("@/app/api/admin/yatri/route")).POST;
  insights = await import("@/features/assistant/insights");
});
beforeEach(() => resetMemoryStore());

async function askYatri(content: string, consent: boolean | null) {
  const cookie = consent === null ? "" : `ti_consent=${encodeConsent(consent)}`;
  const response = await assistant(call("/api/assistant", { messages: [{ role: "user", content }] }, cookie));
  const events = (await response.text()).split("\n").filter(Boolean).map((line) => JSON.parse(line) as { t: string; id?: string; token?: string });
  const meta = events.find((event) => event.t === "meta")!;
  expect(events.at(-1)?.t).toBe("done");
  return { id: meta.id!, token: meta.token! };
}

const questions = async () => (await getStore())!.collection(STORE_COLLECTIONS.yatriQuestions);

describe("recording Yatri's answers", () => {
  it("keeps a question's words only with consent, without emails or numbers, for 30 days", async () => {
    const withConsent = await askYatri("Tell me about Hampi, email me at asha@example.com or 98765 43210", true);
    const without = await askYatri("Tell me about Goa", false);
    const unset = await askYatri("Tell me about Jaipur", null);
    const db = await questions();
    const kept = await db.findOne({ _id: withConsent.id });
    expect(kept!.question).toBe("Tell me about Hampi, email me at [email] or [number]");
    expect((kept!.expiresAt as Date).getTime() - Date.now()).toBeGreaterThan(29 * 86_400_000);
    expect((await db.findOne({ _id: without.id }))!.question).toBeNull();
    expect((await db.findOne({ _id: unset.id }))!.question).toBeNull();
    // The token itself is never stored.
    expect(JSON.stringify(await db.find({}).toArray())).not.toContain(withConsent.token);
    const [today] = await insights.usage(1);
    expect(today).toMatchObject({ questions: 3, guide: 3 });
  });

  it("flags answers the guides couldn't give", () => {
    expect(insights.confidenceOf("I don't have a guide that matches that exactly.", "", "guide")).toBe("unanswered");
    expect(insights.confidenceOf("Here's what Tour India has on that:\n- x", "", "guide")).toBe("low");
    expect(insights.confidenceOf("Goa is lovely.", '{"found":false}', "ai")).toBe("low");
    expect(insights.confidenceOf("**Hampi**: ruins.", "", "guide")).toBe("ok");
  });
});

describe("answer feedback", () => {
  it("only the browser holding the token can rate an answer, and a new vote replaces the old", async () => {
    const mine = await askYatri("Tell me about Hampi", true);
    const theirs = await askYatri("Tell me about Goa", true);
    const rate = (id: string, token: string, vote: string) => feedback(call("/api/assistant/feedback", { id, token, vote }));
    expect((await rate(theirs.id, mine.token, "down")).status).toBe(404);
    expect((await rate(mine.id, "A".repeat(24), "down")).status).toBe(404);
    expect((await rate(mine.id, mine.token, "sideways")).status).toBe(422);
    expect((await rate(mine.id, mine.token, "up")).status).toBe(200);
    expect((await rate(mine.id, mine.token, "down")).status).toBe(200);
    expect((await (await questions()).findOne({ _id: mine.id }))!.feedback).toBe("down");
    expect((await (await questions()).findOne({ _id: theirs.id }))!.feedback).toBeNull();
    const [today] = await insights.usage(1);
    expect(today).toMatchObject({ up: 0, down: 1 });
  });

  it("refuses ratings for expired answers", async () => {
    const mine = await askYatri("Tell me about Hampi", true);
    await (await questions()).updateOne({ _id: mine.id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await feedback(call("/api/assistant/feedback", { ...mine, vote: "up" }))).status).toBe(404);
    expect(await insights.listQuestions("all")).toEqual([]);
  });
});

describe("the Yatri review queue", () => {
  it("needs yatri.manage, lists what needs attention, and audits marking it handled", async () => {
    const boss = await admin(owner());
    const developer = await withRole(boss, "developer");
    const moderator = await withRole(boss, "moderator");
    const user = await signIn("visitor@example.com");
    const bad = await askYatri("zzqx flibbertigibbet", true);
    const good = await askYatri("Tell me about Hampi", true);
    await feedback(call("/api/assistant/feedback", { ...good, vote: "up" }));

    const attention = (await insights.listQuestions("attention")).map((row) => row._id);
    expect(attention).toContain(bad.id);
    expect(attention).not.toContain(good.id);

    const handle = (cookie: string) => yatri(call("/api/admin/yatri", { action: "handle", id: bad.id, note: "Added to the search words" }, cookie));
    expect((await handle("")).status).toBe(401);
    expect((await handle(user)).status).toBe(403);
    expect((await handle(moderator.cookie)).status).toBe(403);
    expect((await handle(developer.cookie)).status).toBe(200);
    expect((await insights.listQuestions("attention")).map((row) => row._id)).not.toContain(bad.id);
    expect((await insights.listQuestions("handled")).map((row) => row._id)).toContain(bad.id);
    const db = (await getStore())!;
    expect(await db.collection(STORE_COLLECTIONS.audit).findOne({ action: "yatri.handle", target: bad.id })).toMatchObject({ actorId: developer.id });
  });
});
