import { beforeEach, describe, expect, it } from "vitest";
import { accountStats, communityStats, firstName, ratingTotals, requestStats } from "@/features/admin/dashboard";
import { loadDashboard } from "@/features/admin/load";
import { assistantDailyLimit, assistantProvider, contentCounts, integrationStatus, siteInfo, yatriStatus } from "@/features/admin/status";
import { COLLECTIONS } from "@/lib/database/mongo";
import { memoryStore, resetMemoryStore, STORE_COLLECTIONS, type Store } from "@/lib/database/store";
import { hashClient } from "@/lib/security/rate-limit";

const NOW = new Date("2026-11-17T12:00:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000);
let store: Store;

beforeEach(() => {
  resetMemoryStore();
  store = memoryStore();
});

describe("accountStats", () => {
  it("counts totals, recent sign-ups and blocked accounts", async () => {
    const users = store.collection(STORE_COLLECTIONS.users);
    await users.insertOne({ _id: "u1", email: "a@example.com", status: "active", createdAt: daysAgo(2), googleSub: "g1" });
    await users.insertOne({ _id: "u2", email: "b@example.com", status: "blocked", createdAt: daysAgo(20) });
    await users.insertOne({ _id: "u3", email: "c@example.com", status: "active", createdAt: daysAgo(90) });
    expect(await accountStats(store, NOW)).toEqual({ total: 3, new7: 1, new30: 2, blocked: 1, google: 1 });
  });

  it("returns zeros for an empty store", async () => {
    expect(await accountStats(store, NOW)).toEqual({ total: 0, new7: 0, new30: 0, blocked: 0, google: 0 });
  });
});

describe("communityStats", () => {
  beforeEach(async () => {
    const comments = store.collection(STORE_COLLECTIONS.comments);
    await comments.insertOne({ _id: "c1", target: "destination:goa", body: "Lovely beaches", status: "visible", reports: 0, createdAt: daysAgo(5) });
    await comments.insertOne({ _id: "c2", target: "destination:goa", body: "x".repeat(200), status: "pending", reports: 0, createdAt: daysAgo(1) });
    await comments.insertOne({ _id: "c3", target: "state:kerala", body: "Rude words", status: "hidden", reports: 3, createdAt: daysAgo(3) });
    await comments.insertOne({ _id: "c4", target: "state:kerala", body: "Reported once", status: "visible", reports: 1, createdAt: daysAgo(4) });
    const edits = store.collection(STORE_COLLECTIONS.edits);
    await edits.insertOne({ _id: "e1", title: "Goa", field: "summary", status: "pending", createdAt: daysAgo(2) });
    await edits.insertOne({ _id: "e2", title: "Goa", field: "summary", status: "approved", createdAt: daysAgo(10) });
    await edits.insertOne({ _id: "e3", title: "Goa", field: "summary", status: "rejected", createdAt: daysAgo(11) });
    await edits.insertOne({ _id: "e4", title: "Goa", field: "summary", status: "rejected", createdAt: daysAgo(12) });
    const reactions = store.collection(STORE_COLLECTIONS.reactions);
    await reactions.insertOne({ _id: "r1", kind: "love" });
    await reactions.insertOne({ _id: "r2", kind: "love" });
    const stats = store.collection(STORE_COLLECTIONS.stats);
    await stats.insertOne({ _id: "destination:goa", ratingCount: 2, ratingSum: 9, loves: 2 });
    await stats.insertOne({ _id: "state:kerala", ratingCount: 1, ratingSum: 3 });
  });

  it("counts comments, loves, ratings and edits", async () => {
    const result = await communityStats(store);
    expect(result.comments).toEqual({ total: 4, pending: 1, hidden: 1, reported: 1 });
    expect(result.loves).toBe(2);
    expect(result.ratings).toEqual({ count: 3, average: 4 });
    expect(result.edits).toEqual({ pending: 1, approved: 1, rejected: 2 });
  });

  it("lists the newest items needing action, linked to the moderation page", async () => {
    const { needsAction } = await communityStats(store);
    expect(needsAction.map((item) => item.kind)).toEqual(["held", "edit", "hidden"]);
    expect(needsAction.every((item) => item.href.startsWith("/admin#"))).toBe(true);
    expect(needsAction[0]!.detail.length).toBeLessThanOrEqual(70);
  });

  it("caps the action list at five", async () => {
    const comments = store.collection(STORE_COLLECTIONS.comments);
    for (let i = 0; i < 8; i++) await comments.insertOne({ _id: `p${i}`, target: "t", body: "b", status: "pending", reports: 0, createdAt: daysAgo(i / 10) });
    expect((await communityStats(store)).needsAction).toHaveLength(5);
  });

  it("reports no average when nothing is rated", async () => {
    resetMemoryStore();
    store = memoryStore();
    expect(await ratingTotals(store)).toEqual({ count: 0, sum: 0 });
    expect((await communityStats(store)).ratings).toEqual({ count: 0, average: null });
  });
});

describe("requestStats", () => {
  it("counts requests and lists the latest without personal details", async () => {
    const bookings = store.collection(STORE_COLLECTIONS.bookings);
    for (let i = 0; i < 7; i++) {
      await bookings.insertOne({
        _id: `b${i}`,
        reference: `TI-AAAA${i}${i}`,
        name: "Asha Rao",
        email: "asha@example.com",
        phone: "+91 98765 43210",
        notes: "Window seat",
        destinationName: "Goa",
        status: "new",
        createdAt: daysAgo(i * 2),
      });
    }
    await store.collection(COLLECTIONS.contact).insertOne({ _id: "m1", status: "new", createdAt: daysAgo(1) });
    await store.collection(COLLECTIONS.contact).insertOne({ _id: "m2", status: "read", createdAt: daysAgo(40) });
    await store.collection(COLLECTIONS.newsletter).insertOne({ _id: "n1", email: "x@example.com", status: "subscribed" });
    await store.collection(COLLECTIONS.stories).insertOne({ _id: "s1", status: "pending" });
    await store.collection(COLLECTIONS.stories).insertOne({ _id: "s2", status: "approved" });

    const result = await requestStats(store, NOW);
    expect(result.bookings.total).toBe(7);
    expect(result.bookings.last7).toBe(4);
    expect(result.bookings.recent).toHaveLength(5);
    expect(result.bookings.recent[0]).toEqual({ reference: "TI-AAAA00", createdAt: daysAgo(0), destination: "Goa", firstName: "Asha", status: "new" });
    const serialised = JSON.stringify(result);
    expect(serialised).not.toContain("example.com");
    expect(serialised).not.toContain("98765");
    expect(serialised).not.toContain("Rao");
    expect(serialised).not.toContain("Window seat");
    expect(result.contact).toEqual({ total: 2, unread: 1, last7: 1 });
    expect(result.newsletter).toBe(1);
    expect(result.stories).toEqual({ pending: 1, approved: 1 });
  });

  it("falls back to a neutral first name", () => {
    expect(firstName("  ")).toBe("Traveller");
    expect(firstName(undefined)).toBe("Traveller");
    expect(firstName("Ravi Kumar Singh")).toBe("Ravi");
  });
});

describe("yatriStatus", () => {
  it("says not tracked without MongoDB", async () => {
    const result = await yatriStatus(store, { env: { GROQ_API_KEY: "gsk_secret" }, databaseConfigured: false, now: NOW });
    expect(result).toEqual({ connected: true, provider: "Groq", dailyLimit: 500, repliesToday: null });
  });

  it("reads today's site-wide count from the rate-limit store", async () => {
    const window = Math.floor(NOW.getTime() / 86_400_000);
    await store.collection(COLLECTIONS.rateLimits).insertOne({ _id: `assistant-daily:${hashClient("site")}:${window}`, count: 42 });
    await store.collection(COLLECTIONS.rateLimits).insertOne({ _id: `assistant-daily:${hashClient("site")}:${window - 1}`, count: 99 });
    const result = await yatriStatus(store, { env: { ASSISTANT_DAILY_LIMIT: "200" }, databaseConfigured: true, now: NOW });
    expect(result).toEqual({ connected: false, provider: null, dailyLimit: 200, repliesToday: 42 });
  });

  it("names the provider without exposing keys", () => {
    expect(assistantProvider({ AI_GATEWAY_API_KEY: "secret" })).toBe("Vercel AI Gateway");
    expect(assistantProvider({ AI_GATEWAY_OIDC: "1" })).toBe("Vercel AI Gateway");
    expect(assistantProvider({})).toBeNull();
    expect(assistantDailyLimit({ ASSISTANT_DAILY_LIMIT: "abc" })).toBe(500);
  });
});

describe("integration and site status", () => {
  it("reports presence only, never values", () => {
    const env = { MONGODB_URI: "mongodb+srv://user:pass@host", RESEND_API_KEY: "re_secret", GROQ_API_KEY: "gsk_secret", AUTH_SECRET: "short" };
    const list = integrationStatus(env);
    const on = Object.fromEntries(list.map((item) => [item.id, item.on]));
    expect(on).toMatchObject({ database: true, email: false, groq: true, auth: false, google: false, maps: false, "search-console": false });
    const serialised = JSON.stringify(list);
    for (const value of Object.values(env)) expect(serialised).not.toContain(value);
  });

  it("shortens the commit and names the environment", () => {
    expect(siteInfo({ VERCEL: "1", VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: "40fa9ec1234567890" })).toMatchObject({ environment: "production", commit: "40fa9ec", hosted: "Vercel" });
    expect(siteInfo({ NODE_ENV: "development" })).toMatchObject({ environment: "development", commit: null });
  });

  it("counts content from the guide data", () => {
    const counts = Object.fromEntries(contentCounts().map((item) => [item.label, item.value]));
    expect(counts.Destinations).toBeGreaterThan(0);
    expect(counts["States and UTs"]).toBeGreaterThan(0);
    expect(counts.Images).toBeGreaterThan(0);
  });
});

describe("loadDashboard", () => {
  it("keeps the content and integration cards when there is no store", async () => {
    const data = await loadDashboard({ store: null, now: NOW });
    expect(data.storage).toBeNull();
    expect(data.storeNote).toMatch(/database isn't connected/);
    expect(data.accounts).toBeNull();
    expect(data.community).toBeNull();
    expect(data.requests).toBeNull();
    expect(data.content.length).toBeGreaterThan(0);
    expect(data.integrations.length).toBeGreaterThan(0);
  });

  it("shows a note instead of failing when a query throws", async () => {
    const broken: Store = {
      collection: () => {
        throw new Error("connection refused");
      },
    };
    const data = await loadDashboard({ store: broken, now: NOW });
    expect(data.storeNote).toMatch(/didn't answer/);
    expect(data.accounts).toBeNull();
  });

  it("fills every card from the in-memory store", async () => {
    const data = await loadDashboard({ store, now: NOW });
    expect(data.storage).toBe("memory");
    expect(data.storeNote).toBeNull();
    expect(data.accounts?.total).toBe(0);
    expect(data.community?.needsAction).toEqual([]);
    expect(data.requests?.bookings.recent).toEqual([]);
  });
});
