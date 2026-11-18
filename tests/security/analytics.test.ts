import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { currentStep, totpAt } from "@/lib/auth/totp";
import { encodeConsent, parseConsent } from "@/lib/consent";

/** Cookieless analytics: consent, what is stored, limits, and who can read the figures. */
let routes: {
  collect: typeof import("@/app/api/collect/route").POST;
  consent: typeof import("@/app/api/consent/route").POST;
  report: typeof import("@/app/api/admin/analytics/route").GET;
  exportCsv: typeof import("@/app/api/admin/analytics/export/route").GET;
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  team: typeof import("@/app/api/admin/team/route").POST;
  mfa: typeof import("@/app/api/admin/mfa/route").POST;
};
let lastCode = "";
let ip = 1;
let addresses = 0;
const ORIGIN = "http://localhost:3000";
const CHROME = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const ALLOWED = `ti_consent=${encodeConsent(false, true)}`;

const nextIp = () => `198.18.${Math.floor(ip / 250)}.${ip++ % 250}`;

function beacon(body: unknown, { cookie = ALLOWED, ua = CHROME, address = nextIp(), headers = {} as Record<string, string>, type = "text/plain;charset=UTF-8" } = {}) {
  return new NextRequest(`${ORIGIN}/api/collect`, {
    method: "POST",
    headers: { "content-type": type, origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": address, "user-agent": ua, cookie, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const call = (path: string, body: unknown, cookie = "") =>
  new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": nextIp(), cookie },
    body: JSON.stringify(body),
  });
const get = (path: string, cookie = "") => new NextRequest(`${ORIGIN}${path}`, { headers: { host: "localhost:3000", "x-vercel-forwarded-for": nextIp(), cookie } });
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;
const fresh = (name: string) => `${name}${++addresses}@example.com`;

async function signIn(email: string, purpose: "login" | "admin" = "login") {
  lastCode = "";
  await routes.request(call("/api/auth/otp/request", { email, purpose }));
  return cookieOf(await routes.verify(call("/api/auth/otp/verify", { email, code: lastCode, purpose })));
}
async function admin(email: string) {
  const cookie = await signIn(email, "admin");
  const { secret } = (await (await routes.mfa(call("/api/admin/mfa", { action: "start" }, cookie))).json()) as { secret: string };
  expect((await routes.mfa(call("/api/admin/mfa", { action: "enable", code: totpAt(secret, currentStep()) }, cookie))).status).toBe(200);
  return cookie;
}
async function owner() {
  const email = fresh("owner");
  process.env.ADMIN_EMAILS = `${process.env.ADMIN_EMAILS},${email}`;
  return admin(email);
}
async function withRole(boss: string, role: string) {
  const email = fresh(role);
  await signIn(email);
  expect((await routes.team(call("/api/admin/team", { action: "set-roles", email, roles: [role] }, boss))).status).toBe(200);
  return admin(email);
}

async function all(name: string) {
  return (await getStore())!.collection(name).find({}).toArray();
}

beforeAll(async () => {
  process.env.VERCEL = "1";
  process.env.ADMIN_EMAILS = "nobody@example.com";
  vi.spyOn(console, "info").mockImplementation((message: unknown) => {
    const match = /code for \S+ is (\d{6})/.exec(String(message));
    if (match) lastCode = match[1]!;
  });
  routes = {
    collect: (await import("@/app/api/collect/route")).POST,
    consent: (await import("@/app/api/consent/route")).POST,
    report: (await import("@/app/api/admin/analytics/route")).GET,
    exportCsv: (await import("@/app/api/admin/analytics/export/route")).GET,
    request: (await import("@/app/api/auth/otp/request/route")).POST,
    verify: (await import("@/app/api/auth/otp/verify/route")).POST,
    team: (await import("@/app/api/admin/team/route")).POST,
    mfa: (await import("@/app/api/admin/mfa/route")).POST,
  };
});

beforeEach(() => resetMemoryStore());

describe("consent for analytics", () => {
  it("is off by default, separate from preferences, and older choices keep it off", async () => {
    expect(parseConsent(encodeConsent(true))).toMatchObject({ preferences: true, analytics: false });
    expect(parseConsent(encodeConsent(false, true))).toMatchObject({ preferences: false, analytics: true });
    expect(parseConsent("1.1.1700000000")).toMatchObject({ version: 1, preferences: true, analytics: false });
    expect(parseConsent("2.1.1")).toBeNull();
    expect(parseConsent("2.1.2.123")).toBeNull();

    const response = await routes.consent(call("/api/consent", { preferences: false, analytics: true }));
    expect(parseConsent(cookieOf(response).split("=")[1])).toMatchObject({ preferences: false, analytics: true });
    const without = await routes.consent(call("/api/consent", { preferences: true }));
    expect(parseConsent(cookieOf(without).split("=")[1])?.analytics).toBe(false);
  });

  it("records nothing without analytics consent, even if a beacon arrives", async () => {
    const view = { events: [{ t: "view", p: "/destinations/goa", e: true }] };
    expect((await routes.collect(beacon(view, { cookie: "" }))).status).toBe(204);
    expect((await routes.collect(beacon(view, { cookie: `ti_consent=${encodeConsent(true, false)}` }))).status).toBe(204);
    expect((await routes.collect(beacon(view, { cookie: "ti_consent=1.1.1700000000" }))).status).toBe(204);
    expect(await all(STORE_COLLECTIONS.analyticsEvents)).toHaveLength(0);
    expect(await all(STORE_COLLECTIONS.analyticsDaily)).toHaveLength(0);
    expect(await all(STORE_COLLECTIONS.analyticsVisitors)).toHaveLength(0);
  });
});

describe("the collect endpoint", () => {
  it("stores no IP address, user agent, cookie or visitor hash with the events", async () => {
    const address = "203.0.113.77";
    const response = await routes.collect(
      beacon(
        {
          events: [
            { t: "view", p: "/destinations/goa?utm=x#top", e: true, r: "www.google.com" },
            { t: "event", n: "search", p: "/destinations/goa", q: "Goa Beaches", c: 4 },
            { t: "vital", n: "LCP", v: 1800, p: "/destinations/goa" },
          ],
        },
        { address, headers: { "x-vercel-ip-country": "IN", "x-vercel-ip-country-region": "MH" } },
      ),
    );
    expect(response.status).toBe(204);

    const events = await all(STORE_COLLECTIONS.analyticsEvents);
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ type: "view", path: "/destinations/goa", referrer: "google.com", device: "mobile", browser: "Chrome", country: "IN", state: "Maharashtra" });
    const everything = JSON.stringify([events, await all(STORE_COLLECTIONS.analyticsDaily), await all(STORE_COLLECTIONS.analyticsVisitors)]);
    for (const secret of [address, "203.0.113", CHROME, "Pixel 8", "Android 14", encodeConsent(false, true).slice(0, 6), "utm"]) expect(everything).not.toContain(secret);

    const [visitor] = await all(STORE_COLLECTIONS.analyticsVisitors);
    const hash = visitor!._id.split("|")[1]!;
    expect(hash).toMatch(/^[0-9a-f]{32}$/);
    expect(JSON.stringify(events)).not.toContain(hash);
    for (const event of events) {
      expect(Object.keys(event).sort()).not.toContain("ip");
      expect((event.expiresAt as Date).getTime() - (event.at as Date).getTime()).toBe(90 * 86_400_000);
    }
    expect((visitor!.expiresAt as Date).getTime() - Date.now()).toBeLessThanOrEqual(2 * 86_400_000);
  });

  it("only trusts location headers on Vercel, and ignores unknown regions", async () => {
    const { geography } = await import("@/features/analytics/collect");
    const headers = new Headers({ "x-vercel-ip-country": "IN", "x-vercel-ip-country-region": "KA" });
    expect(geography(headers, true)).toEqual({ country: "IN", state: "Karnataka" });
    expect(geography(headers, false)).toEqual({});
    expect(geography(new Headers({ "x-vercel-ip-country": "IN", "x-vercel-ip-country-region": "ZZ" }), true)).toEqual({ country: "IN" });
    expect(geography(new Headers({ "x-vercel-ip-country": "<script>" }), true)).toEqual({});
    expect(geography(new Headers({ "x-vercel-ip-country": "GB", "x-vercel-ip-country-region": "ENG" }), true)).toEqual({ country: "GB" });
  });

  it("drops bots, prefetches and headless browsers quietly", async () => {
    const view = { events: [{ t: "view", p: "/", e: true }] };
    for (const ua of ["Googlebot/2.1 (+http://www.google.com/bot.html)", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36", "curl/8.4.0", "", "Mozilla/5.0 (compatible; Chrome-Lighthouse)"]) {
      expect((await routes.collect(beacon(view, { ua }))).status).toBe(204);
    }
    expect((await routes.collect(beacon(view, { headers: { "sec-purpose": "prefetch;prerender" } }))).status).toBe(204);
    expect(await all(STORE_COLLECTIONS.analyticsEvents)).toHaveLength(0);
  });

  it("refuses other sites, other content types, oversized and malformed batches", async () => {
    const view = { events: [{ t: "view", p: "/", e: true }] };
    expect((await routes.collect(beacon(view, { headers: { origin: "https://evil.example" } }))).status).toBe(403);
    expect((await routes.collect(beacon(view, { type: "application/x-www-form-urlencoded" }))).status).toBe(415);
    expect((await routes.collect(beacon({ events: [{ t: "view", p: `/${"a".repeat(5000)}` }] }))).status).toBe(413);
    expect((await routes.collect(beacon("{not json"))).status).toBe(400);
    expect((await routes.collect(beacon({ events: [] }))).status).toBe(422);
    expect((await routes.collect(beacon({ events: Array.from({ length: 21 }, () => ({ t: "view", p: "/" })) }))).status).toBe(422);
    expect((await routes.collect(beacon({ events: [{ t: "event", n: "keystrokes", p: "/" }] }))).status).toBe(422);
    expect((await routes.collect(beacon({ events: [{ t: "view", p: "/", email: "a@b.co" }] }))).status).toBe(422);
    expect((await routes.collect(beacon({ events: [{ t: "vital", n: "CLS", v: 99, p: "/" }] }))).status).toBe(422);
    expect((await routes.collect(beacon({ events: [{ t: "event", n: "share_link", p: "/", k: "my-secret" }] }))).status).toBe(422);
    expect((await routes.collect(beacon(view, { type: "application/json" }))).status).toBe(204);
    expect(await all(STORE_COLLECTIONS.analyticsEvents)).toHaveLength(1);
  });

  it("rate-limits each address", async () => {
    const address = "198.51.100.9";
    const view = { events: [{ t: "event", n: "yatri_open", p: "/" }] };
    for (let index = 0; index < 240; index++) expect((await routes.collect(beacon(view, { address }))).status).toBe(204);
    expect((await routes.collect(beacon(view, { address }))).status).toBe(429);
    expect((await routes.collect(beacon(view))).status).toBe(204);
  });

  it("counts private links, profiles and trips under placeholders, and skips the admin area", async () => {
    await routes.collect(
      beacon({
        events: [
          { t: "view", p: "/t/AbCdEfGhIjKlMnOp", e: true },
          { t: "view", p: "/c/ZyXwVuTsRqPoNmLk", from: "/t/AbCdEfGhIjKlMnOp" },
          { t: "view", p: "/u/meera_k" },
          { t: "view", p: "/profile/trips/6f1c2a" },
          { t: "view", p: "/admin/users" },
          { t: "view", p: "/api/collect" },
          { t: "view", p: "//evil.example/x" },
        ],
      }),
    );
    const paths = (await all(STORE_COLLECTIONS.analyticsEvents)).map((event) => event.path);
    expect(paths).toEqual(["/t/:link", "/c/:link", "/u/:profile", "/profile/trips/:trip"]);
    const everything = JSON.stringify(await all(STORE_COLLECTIONS.analyticsDaily));
    for (const secret of ["AbCdEf", "ZyXwVu", "meera", "6f1c2a", "admin"]) expect(everything.toLowerCase()).not.toContain(secret.toLowerCase());
  });

  it("keeps search words tidy, drops ones that look personal, and counts searches with no results", async () => {
    await routes.collect(
      beacon({
        events: [
          { t: "event", n: "search", p: "/", q: "  Hampi!! ruins ", c: 0 },
          { t: "event", n: "search", p: "/", q: "hampi ruins", c: 0 },
          { t: "event", n: "search", p: "/", q: "Varanasi", c: 7 },
          { t: "event", n: "search", p: "/", q: "meera@example.com", c: 0 },
          { t: "event", n: "search", p: "/", q: "call 98765 43210", c: 0 },
        ],
      }),
    );
    const daily = await all(STORE_COLLECTIONS.analyticsDaily);
    const search = Object.fromEntries(daily.filter((row) => row.dim === "search").map((row) => [row.key, [row.count, row.zero]]));
    expect(search).toEqual({ "hampi ruins": [2, 2], varanasi: [1, 0] });
    expect(JSON.stringify(daily)).not.toMatch(/meera|98765/);
  });
});

describe("aggregation", () => {
  it("counts each visitor once a day, and adds up pages, entries, referrers, journeys and devices", async () => {
    const alice = "192.0.2.1";
    const bob = "192.0.2.2";
    const desktop = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0";
    await routes.collect(beacon({ events: [{ t: "view", p: "/", e: true, r: "google.com" }] }, { address: alice }));
    await routes.collect(beacon({ events: [{ t: "view", p: "/planner", from: "/" }, { t: "view", p: "/destinations/goa" }] }, { address: alice }));
    await routes.collect(beacon({ events: [{ t: "view", p: "/", e: true }, { t: "view", p: "/planner", from: "/" }] }, { address: bob, ua: desktop }));
    await routes.collect(beacon({ events: [{ t: "view", p: "/", e: true, r: "localhost" }] }, { address: bob, ua: desktop }));

    const { loadReport } = await import("@/features/analytics/report");
    const report = await loadReport(7);
    expect(report.totals.views).toBe(6);
    expect(report.totals.visitorDays).toBe(2);
    expect(report.days.at(-1)).toMatchObject({ views: 6, visitors: 2 });
    expect(report.pages).toEqual([{ key: "/", count: 3 }, { key: "/planner", count: 2 }, { key: "/destinations/goa", count: 1 }]);
    expect(report.entries).toEqual([{ key: "/", count: 3 }]);
    expect(report.referrers).toEqual([{ key: "(direct or not shared)", count: 2 }, { key: "google.com", count: 1 }]);
    expect(report.journeys).toEqual([{ key: "/ → /planner", count: 2 }]);
    expect(report.devices).toEqual([{ key: "mobile", count: 3 }, { key: "desktop", count: 3 }].sort((a, b) => a.key.localeCompare(b.key)));
    expect(report.browsers).toEqual([{ key: "Chrome", count: 3 }, { key: "Edge", count: 3 }]);
    expect(report.firstDay).toBe(report.to);
  });

  it("rates and averages Core Web Vitals per page", async () => {
    await routes.collect(
      beacon({
        events: [
          { t: "vital", n: "LCP", v: 2000, p: "/" },
          { t: "vital", n: "LCP", v: 3000, p: "/" },
          { t: "vital", n: "LCP", v: 5000, p: "/planner" },
          { t: "vital", n: "CLS", v: 0.05, p: "/" },
          { t: "vital", n: "INP", v: 600, p: "/" },
        ],
      }),
    );
    const { loadReport } = await import("@/features/analytics/report");
    const { vitals } = await loadReport(7);
    const lcp = vitals.find((vital) => vital.name === "LCP")!;
    expect(lcp).toMatchObject({ count: 3, average: 3333, good: 1, ni: 1, poor: 1 });
    expect(lcp.pages).toEqual([{ path: "/", count: 2, average: 2500, good: 1, poor: 0 }, { path: "/planner", count: 1, average: 5000, good: 0, poor: 1 }]);
    expect(vitals.find((vital) => vital.name === "CLS")).toMatchObject({ count: 1, average: 0.05, good: 1 });
    expect(vitals.find((vital) => vital.name === "INP")).toMatchObject({ count: 1, poor: 1 });

    // The shape the monitoring Health page reads: one document per UTC day, metric and page.
    const day = new Date().toISOString().slice(0, 10);
    const stored = await (await getStore())!.collection(STORE_COLLECTIONS.webVitals).findOne({ _id: `${day}:LCP:/` });
    expect(stored).toMatchObject({ day, metric: "LCP", path: "/", count: 2, good: 1, needsImprovement: 1, poor: 0, sum: 5000 });
  });

  it("uses India's calendar days and only adds up the chosen range", async () => {
    const { dayOf } = await import("@/features/analytics/collect");
    const { summarise } = await import("@/features/analytics/report");
    expect(dayOf(new Date("2026-11-17T18:29:00Z"))).toBe("2026-11-17");
    expect(dayOf(new Date("2026-11-17T18:31:00Z"))).toBe("2026-11-18");

    const now = new Date("2026-11-18T06:00:00Z");
    const rows = [
      { _id: "a", day: "2026-11-18", dim: "views", key: "all", count: 5 },
      { _id: "b", day: "2026-11-12", dim: "views", key: "all", count: 4 },
      { _id: "c", day: "2026-11-11", dim: "views", key: "all", count: 100 },
      { _id: "d", day: "2026-11-18", dim: "event", key: "planner_save", count: 2 },
      { _id: "e", day: "2026-11-18", dim: "event", key: "planner_save:account", count: 1 },
    ];
    const week = summarise(rows, 7, now);
    expect(week.from).toBe("2026-11-12");
    expect(week.days).toHaveLength(7);
    expect(week.totals.views).toBe(9);
    expect(week.totals.events).toBe(2);
    expect(summarise(rows, 30, now).totals.views).toBe(109);
  });

  it("writes CSV that spreadsheets can't run as formulas", async () => {
    const { totalsCsv } = await import("@/features/analytics/report");
    const csv = totalsCsv([
      { _id: "1", day: "2026-11-18", dim: "search", key: "=cmd|' /c calc'!a0", count: 1, zero: 1 },
      { _id: "2", day: "2026-11-17", dim: "page", key: "/a,b", count: 3 },
    ]);
    const lines = csv.trim().split("\r\n");
    expect(lines[0]).toBe("day,dimension,key,count,zero_results,sum,good,needs_improvement,poor");
    expect(lines[1]).toBe('2026-11-17,page,"/a,b",3,,,,,');
    expect(lines[2]).toContain("'=cmd");
  });
});

describe("the analytics dashboards", () => {
  it("need analytics.view to read and analytics.export to download, and exports are audited", async () => {
    await routes.collect(beacon({ events: [{ t: "view", p: "/", e: true }] }));
    expect((await routes.report(get("/api/admin/analytics"))).status).toBe(401);
    expect((await routes.exportCsv(get("/api/admin/analytics/export"))).status).toBe(401);

    const user = await signIn(fresh("traveller"));
    expect((await routes.report(get("/api/admin/analytics", user))).status).toBe(403);

    const boss = await owner();
    const support = await withRole(boss, "support_manager");
    expect((await routes.report(get("/api/admin/analytics", support))).status).toBe(403);

    const content = await withRole(boss, "content_manager");
    const viewed = await routes.report(get("/api/admin/analytics?days=7", content));
    expect(viewed.status).toBe(200);
    expect(((await viewed.json()) as { report: { totals: { views: number }; range: number } }).report).toMatchObject({ range: 7, totals: { views: 1 } });
    expect((await routes.exportCsv(get("/api/admin/analytics/export", content))).status).toBe(403);

    const analyst = await withRole(boss, "analyst");
    const exported = await routes.exportCsv(get("/api/admin/analytics/export?days=90", analyst));
    expect(exported.status).toBe(200);
    expect(exported.headers.get("content-type")).toContain("text/csv");
    expect(exported.headers.get("content-disposition")).toMatch(/attachment; filename="tour-india-analytics-\d{4}-\d{2}-\d{2}-to-\d{4}-\d{2}-\d{2}\.csv"/);
    expect(await exported.text()).toContain(",views,all,1,");

    const audit = await all(STORE_COLLECTIONS.audit);
    expect(audit.filter((entry) => entry.action === "analytics.export")).toHaveLength(1);
    const denied = await all(STORE_COLLECTIONS.securityEvents);
    expect(denied.some((entry) => entry.action === "admin.denied" && String(entry.detail).includes("analytics.export"))).toBe(true);
  });

  it("guard the dashboard page with analytics.view", async () => {
    const { readFile } = await import("node:fs/promises");
    const page = await readFile("src/app/admin/analytics/page.tsx", "utf8");
    expect(page).toContain('requireAdminPage("analytics.view")');
    expect(page).toContain('has("analytics.export")');
  });
});
