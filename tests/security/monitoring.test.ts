import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { currentStep, totpAt } from "@/lib/auth/totp";

/** Phase 8: log centre, health, SEO, notifications and backups, through the real routes. */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  team: typeof import("@/app/api/admin/team/route").POST;
  mfa: typeof import("@/app/api/admin/mfa/route").POST;
  support: typeof import("@/app/api/admin/support/route").POST;
  users: typeof import("@/app/api/admin/users/route").POST;
  moderation: typeof import("@/app/api/admin/route").POST;
  logsGet: typeof import("@/app/api/admin/logs/route").GET;
  logsPost: typeof import("@/app/api/admin/logs/route").POST;
  backup: typeof import("@/app/api/admin/backups/route").POST;
  backupVerify: typeof import("@/app/api/admin/backups/verify/route").POST;
  backupRestore: typeof import("@/app/api/admin/backups/restore/route").POST;
  notesGet: typeof import("@/app/api/notifications/route").GET;
  notesPost: typeof import("@/app/api/notifications/route").POST;
};
let lastCode = "";
let ip = 1;
let addresses = 0;
const ORIGIN = "http://localhost:3000";
const headers = (cookie: string, extra: Record<string, string> = {}) => ({ origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `198.19.2.${ip++ % 250}`, cookie, ...extra });

const call = (path: string, body: unknown, cookie = "") => new NextRequest(`${ORIGIN}${path}`, { method: "POST", headers: headers(cookie, { "content-type": "application/json" }), body: JSON.stringify(body) });
const get = (path: string, cookie = "") => new NextRequest(`${ORIGIN}${path}`, { method: "GET", headers: headers(cookie) });
const upload = (path: string, bytes: Uint8Array, cookie: string, extra: Record<string, string> = {}) =>
  new NextRequest(`${ORIGIN}${path}`, { method: "POST", headers: headers(cookie, { "content-type": "application/gzip", ...extra }), body: Buffer.from(bytes) });
const cookieOf = (response: Response) => (response.headers.get("set-cookie") ?? "").split(";")[0]!;
const fresh = (name: string) => `${name}${++addresses}@example.com`;
function owner() {
  const email = fresh("owner");
  process.env.ADMIN_EMAILS = `${process.env.ADMIN_EMAILS},${email}`;
  return email;
}
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
async function userId(email: string) {
  const db = (await getStore())!;
  return (await db.collection(STORE_COLLECTIONS.users).findOne({ email }))!._id;
}
async function withRole(boss: string, role: string) {
  const email = fresh(role);
  await signIn(email);
  expect((await routes.team(call("/api/admin/team", { action: "set-roles", email, roles: [role] }, boss))).status).toBe(200);
  return { email, id: await userId(email), cookie: await admin(email) };
}
async function member() {
  const email = fresh("member");
  const cookie = await signIn(email);
  return { email, cookie, id: await userId(email) };
}
async function staleMfa(cookieUserId: string) {
  const db = (await getStore())!;
  await db.collection(STORE_COLLECTIONS.sessions).updateOne({ userId: cookieUserId, role: "admin" }, { $set: { mfaAt: new Date(Date.now() - 20 * 60_000) } });
}
async function download(cookie: string) {
  const response = await routes.backup(call("/api/admin/backups", { action: "export" }, cookie));
  expect(response.status).toBe(200);
  const gz = new Uint8Array(await response.arrayBuffer());
  return { gz, file: JSON.parse(gunzipSync(gz).toString("utf8")) as { collections: Record<string, Record<string, unknown>[]>; counts: Record<string, number>; checksum: string } };
}

beforeAll(async () => {
  process.env.VERCEL = "1";
  process.env.ADMIN_EMAILS = "nobody@example.com";
  vi.spyOn(console, "info").mockImplementation((message: unknown) => {
    const match = /code for \S+ is (\d{6})/.exec(String(message));
    if (match) lastCode = match[1]!;
  });
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  const logs = await import("@/app/api/admin/logs/route");
  const notes = await import("@/app/api/notifications/route");
  routes = {
    request: (await import("@/app/api/auth/otp/request/route")).POST,
    verify: (await import("@/app/api/auth/otp/verify/route")).POST,
    team: (await import("@/app/api/admin/team/route")).POST,
    mfa: (await import("@/app/api/admin/mfa/route")).POST,
    support: (await import("@/app/api/admin/support/route")).POST,
    users: (await import("@/app/api/admin/users/route")).POST,
    moderation: (await import("@/app/api/admin/route")).POST,
    logsGet: logs.GET,
    logsPost: logs.POST,
    backup: (await import("@/app/api/admin/backups/route")).POST,
    backupVerify: (await import("@/app/api/admin/backups/verify/route")).POST,
    backupRestore: (await import("@/app/api/admin/backups/restore/route")).POST,
    notesGet: notes.GET,
    notesPost: notes.POST,
  };
});

beforeEach(() => resetMemoryStore());

describe("permissions", () => {
  it("keeps every Phase 8 admin page behind the right permission", () => {
    const expected: Record<string, string> = { logs: "logs.view", health: "logs.view", seo: "seo.manage", backups: "backup.create" };
    for (const [page, permission] of Object.entries(expected)) {
      const source = readFileSync(join("src/app/admin", page, "page.tsx"), "utf8");
      expect(source).toContain(`requireAdminPage("${permission}")`);
    }
  });

  it("refuses signed-out visitors, members and admins without the permission on every route", async () => {
    const boss = await admin(owner());
    const moderator = await withRole(boss, "moderator");
    const someone = await member();
    const bytes = gzipSync(Buffer.from("{}"));
    const attempts = (cookie: string) => [
      routes.logsGet(get("/api/admin/logs?kind=audit", cookie)),
      routes.logsPost(call("/api/admin/logs", { action: "verify", kind: "audit" }, cookie)),
      routes.backup(call("/api/admin/backups", { action: "export" }, cookie)),
      routes.backupVerify(upload("/api/admin/backups/verify", bytes, cookie)),
      routes.backupRestore(upload("/api/admin/backups/restore?mode=dry-run", bytes, cookie)),
    ];
    for (const response of await Promise.all(attempts(""))) expect(response.status).toBe(401);
    for (const response of await Promise.all(attempts(someone.cookie))) expect(response.status).toBe(403);
    for (const response of await Promise.all(attempts(moderator.cookie))) expect(response.status).toBe(403);
    expect((await routes.notesGet(get("/api/notifications"))).status).toBe(401);
    expect((await routes.notesPost(call("/api/notifications", { action: "read-all" }))).status).toBe(401);
  });

  it("lets the Developer role read logs, and refuses cross-site uploads", async () => {
    const boss = await admin(owner());
    const developer = await withRole(boss, "developer");
    expect((await routes.logsGet(get("/api/admin/logs?kind=security", developer.cookie))).status).toBe(200);
    const crossSite = new NextRequest(`${ORIGIN}/api/admin/backups/verify`, { method: "POST", headers: { origin: "https://evil.example", host: "localhost:3000", "content-type": "application/gzip", cookie: boss }, body: Buffer.from("x") });
    expect((await routes.backupVerify(crossSite)).status).toBe(403);
  });
});

describe("the log centre", () => {
  it("verifies the chain, then reports an edited record and a removed one", async () => {
    const boss = await admin(owner());
    const { audit } = await import("@/lib/security/audit");
    for (let i = 0; i < 5; i += 1) await audit({ action: "test.step", outcome: "ok", detail: `step ${i}` });
    const verify = async () => (await (await routes.logsPost(call("/api/admin/logs", { action: "verify", kind: "audit" }, boss))).json()) as { checked: number; problems: { problem: string }[] };
    const clean = await verify();
    expect(clean.checked).toBeGreaterThanOrEqual(5);
    expect(clean.problems).toEqual([]);

    const db = (await getStore())!;
    const logs = db.collection(STORE_COLLECTIONS.audit);
    const steps = await logs.find({ action: "test.step" }, { sort: { seq: 1 } }).toArray();
    await logs.updateOne({ _id: steps[1]!._id }, { $set: { detail: "rewritten" } });
    await logs.deleteOne({ _id: steps[3]!._id });
    const problems = (await verify()).problems.map((p) => p.problem);
    expect(problems).toContain("edited");
    expect(problems).toContain("gap");
    expect(await logs.findOne({ action: "logs.verify" })).toBeTruthy();
  });

  it("filters by action prefix, person and outcome, and exports a safe, audited CSV", async () => {
    const boss = await admin(owner());
    const { audit, securityEvent } = await import("@/lib/security/audit");
    await audit({ action: "ticket.update", outcome: "ok", actorEmail: "agent@example.com", detail: "=HYPERLINK(\"x\")" });
    await audit({ action: "user.suspension", outcome: "ok", actorEmail: "mod@example.com" });
    await securityEvent({ action: "login.failed", outcome: "failed" });
    const { listLogs, parseLogQuery } = await import("@/features/monitoring/logs");
    const tickets = await listLogs(parseLogQuery({ kind: "audit", action: "ticket." }));
    expect(tickets!.rows.map((r) => r.action)).toEqual(["ticket.update"]);
    expect((await listLogs(parseLogQuery({ kind: "audit", actor: "MOD@example.com" })))!.total).toBe(1);
    expect((await listLogs(parseLogQuery({ kind: "security", outcome: "failed" })))!.rows.some((r) => r.action === "login.failed")).toBe(true);
    expect((await listLogs(parseLogQuery({ kind: "audit", action: "(.*)+" })))!.total).toBe(0);

    const response = await routes.logsGet(get("/api/admin/logs?kind=audit&action=ticket.", boss));
    expect(response.headers.get("content-type")).toContain("text/csv");
    const csv = await response.text();
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).not.toContain("user.suspension");
    const db = (await getStore())!;
    expect(await db.collection(STORE_COLLECTIONS.audit).findOne({ action: "logs.export" })).toMatchObject({ outcome: "ok", detail: "1 rows" });
  });
});

describe("health", () => {
  it("records only where an error happened and its kind", async () => {
    const { errorSummary, reportError } = await import("@/lib/monitoring/errors");
    await reportError("trips", Object.assign(new TypeError("meera@example.com could not save"), {}));
    await reportError("trips", new TypeError("again"));
    const db = (await getStore())!;
    const rows = await db.collection(STORE_COLLECTIONS.appErrors).find({}).toArray();
    expect(rows).toHaveLength(2);
    expect(JSON.stringify(rows)).not.toContain("meera");
    expect(rows[0]).toMatchObject({ source: "trips", name: "TypeError" });
    expect(rows[0]!.expiresAt).toBeInstanceOf(Date);
    const summary = await errorSummary();
    expect(summary).toMatchObject({ hour: 2, day: 2, week: 2 });
    expect(summary!.top[0]).toMatchObject({ source: "trips", name: "TypeError", count: 2 });
  });

  it("reads Web Vitals aggregates as recorded and shows nothing when there are none", async () => {
    const { vitalsSummary } = await import("@/features/monitoring/vitals");
    expect((await vitalsSummary())!.metrics).toEqual([]);
    const db = (await getStore())!;
    const day = new Date().toISOString().slice(0, 10);
    await db.collection("web_vitals").insertOne({ _id: `${day}:LCP`, day, metric: "LCP", count: 10, good: 7, needsImprovement: 2, poor: 1, p75: 2100 });
    await db.collection("web_vitals").insertOne({ _id: `${day}:LCP:/explore`, day, metric: "LCP", path: "/explore", count: 4, good: 4, needsImprovement: 0, poor: 0, p75: 900 });
    await db.collection("web_vitals").insertOne({ _id: "2001-01-01:LCP", day: "2001-01-01", metric: "LCP", count: 99, good: 0, needsImprovement: 0, poor: 99 });
    const [lcp] = (await vitalsSummary())!.metrics;
    expect(lcp).toMatchObject({ metric: "LCP", count: 10, good: 7, poor: 1, p75: 2100 });
  });

  it("lists deployments only when a Vercel token is set, and never fails the page", async () => {
    const { latestDeployments } = await import("@/features/monitoring/health");
    delete process.env.VERCEL_API_TOKEN;
    expect(await latestDeployments()).toEqual({ configured: false });
    process.env.VERCEL_API_TOKEN = "test-token";
    process.env.VERCEL_PROJECT_ID = "prj_test";
    const ok = vi.fn(async () => new Response(JSON.stringify({ deployments: [{ uid: "dpl_1", state: "READY", target: "production", created: 1_700_000_000_000, meta: { githubCommitSha: "abcdef1234", githubCommitMessage: "Fix\nmore" } }] })));
    expect(await latestDeployments(ok as unknown as typeof fetch)).toMatchObject({ ok: true, deployments: [{ id: "dpl_1", state: "READY", commit: "abcdef1", message: "Fix" }] });
    const refused = vi.fn(async () => new Response("", { status: 403 }));
    expect(await latestDeployments(refused as unknown as typeof fetch)).toMatchObject({ configured: true, ok: false });
    delete process.env.VERCEL_API_TOKEN;
    delete process.env.VERCEL_PROJECT_ID;
  });
});

describe("the SEO centre", () => {
  it("uses each page's real metadata and finds no broken internal links", async () => {
    const { pageMetadata, brokenLinks, redirectReport } = await import("@/features/seo/report");
    const { destinations } = await import("@/data");
    const pages = await pageMetadata();
    const page = await import("@/app/destinations/[slug]/page");
    const slug = destinations[0]!.slug;
    const real = await page.generateMetadata({ params: Promise.resolve({ slug }) } as never);
    expect(pages.find((p) => p.path === `/destinations/${slug}`)).toMatchObject({ title: real.title, description: real.description, inheritsTitle: false });
    expect(brokenLinks()).toEqual([]);
    expect(redirectReport().every((r) => r.destinationExists)).toBe(true);
  }, 120_000);

  it("keeps the noindex list in step with every index: false in the app", async () => {
    const { NOINDEX_PAGES } = await import("@/features/seo/report");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.(tsx?|ts)$/.test(name) && /index: false/.test(readFileSync(path, "utf8"))) files.push(path.replace(/\\/g, "/"));
      }
    };
    walk("src/app");
    const listed = NOINDEX_PAGES.map((p) => p.path);
    for (const file of files) {
      const route = file.replace(/^src\/app/, "").replace(/\/(page|layout)\.tsx$/, "") || "/";
      const covered = listed.some((entry) => (entry.endsWith("/*") ? route.startsWith(entry.slice(0, -2)) : entry === route));
      expect(covered, `${route} is noindex but not in NOINDEX_PAGES`).toBe(true);
    }
  });
});

describe("notifications", () => {
  it("tells the person when their support ticket moves on, without the subject", async () => {
    const boss = await admin(owner());
    const person = await member();
    const db = (await getStore())!;
    await db.collection(STORE_COLLECTIONS.tickets).insertOne({ _id: crypto.randomUUID(), reference: "S-2222-ABCD", name: "Meera", email: person.email, category: "general", subject: "Private subject", message: "x", priority: "normal", status: "new", notes: [], createdAt: new Date() });
    expect((await routes.support(call("/api/admin/support", { action: "update", reference: "S-2222-ABCD", status: "in_progress" }, boss))).status).toBe(200);
    const reply = (await (await routes.notesGet(get("/api/notifications", person.cookie))).json()) as { unread: number; items: { title: string }[] };
    expect(reply.unread).toBe(1);
    expect(reply.items[0]!.title).toBe("Your support request S-2222-ABCD is now in progress");
    expect(JSON.stringify(reply)).not.toContain("Private subject");
  });

  it("only shows and changes a person's own notifications", async () => {
    const { notify } = await import("@/features/notifications/service");
    const a = await member();
    const b = await member();
    await notify(a.id, { kind: "account", title: "For A" });
    await notify(b.id, { kind: "account", title: "For B" });
    const db = (await getStore())!;
    const bNote = await db.collection(STORE_COLLECTIONS.notifications).findOne({ userId: b.id });
    const listA = (await (await routes.notesGet(get("/api/notifications", a.cookie))).json()) as { items: { title: string }[] };
    expect(listA.items.map((i) => i.title)).toEqual(["For A"]);
    const tried = (await (await routes.notesPost(call("/api/notifications", { action: "read", ids: [bNote!._id] }, a.cookie))).json()) as { changed: number };
    expect(tried.changed).toBe(0);
    expect((await db.collection(STORE_COLLECTIONS.notifications).findOne({ _id: bNote!._id }))!.readAt).toBeUndefined();
    const all = (await (await routes.notesPost(call("/api/notifications", { action: "read-all" }, a.cookie))).json()) as { unread: number };
    expect(all.unread).toBe(0);
    expect((await (await routes.notesGet(get("/api/notifications?count=1", b.cookie))).json()).unread).toBe(1);
  });

  it("sends notices for restrictions, restores, edit decisions and removed comments", async () => {
    const boss = await admin(owner());
    const person = await member();
    expect((await routes.users(call("/api/admin/users", { action: "restrict", userId: person.id, kind: "suspension", days: 3, reason: "spam", note: "Link spam in comments." }, boss))).status).toBe(200);
    const db = (await getStore())!;
    const restriction = await db.collection(STORE_COLLECTIONS.restrictions).findOne({ userId: person.id });
    expect((await routes.users(call("/api/admin/users", { action: "lift", restrictionId: restriction!._id, note: "Cleared up." }, boss))).status).toBe(200);

    const editId = crypto.randomUUID();
    await db.collection(STORE_COLLECTIONS.edits).insertOne({ _id: editId, target: "destination:agra", title: "Agra", path: "/destinations/agra", field: "tagline", current: "old", proposed: "new", reason: "r", userId: person.id, authorName: "M", status: "pending", createdAt: new Date() });
    expect((await routes.moderation(call("/api/admin", { action: "edit", id: editId, approve: false, note: "" }, boss))).status).toBe(200);
    const commentId = crypto.randomUUID();
    await db.collection(STORE_COLLECTIONS.comments).insertOne({ _id: commentId, target: "destination:agra", parentId: null, userId: person.id, authorName: "M", kind: "tip", body: "x", status: "visible", reports: 1, helpful: 0, createdAt: new Date() });
    expect((await routes.moderation(call("/api/admin", { action: "comment", id: commentId, status: "removed", note: "" }, boss))).status).toBe(200);

    const titles = (await db.collection(STORE_COLLECTIONS.notifications).find({ userId: person.id }, { sort: { createdAt: 1 } }).toArray()).map((n) => n.title);
    expect(titles[0]).toMatch(/^Your account was suspended until/);
    expect(titles).toContain("Your account has been restored");
    expect(titles).toContain("Your suggested edit to Agra wasn't accepted");
    expect(titles).toContain("One of your comments was removed");
  });
});

describe("backups", () => {
  it("exports every collection except secrets, with a checksum that verifies", async () => {
    const boss = await admin(owner());
    await member();
    const { gz, file } = await download(boss);
    expect(file.collections[STORE_COLLECTIONS.users]!.length).toBeGreaterThanOrEqual(2);
    for (const secret of [STORE_COLLECTIONS.otps, STORE_COLLECTIONS.sessions, "rate_limits"]) expect(file.collections[secret]).toBeUndefined();
    expect(file.collections[STORE_COLLECTIONS.adminMembers]!.length).toBeGreaterThan(0);
    for (const memberDoc of file.collections[STORE_COLLECTIONS.adminMembers]!) expect(memberDoc.mfa).toBeUndefined();
    const text = gunzipSync(gz).toString("utf8");
    expect(text).not.toMatch(/tokenHash|codeHash|"recovery"/);

    const db = (await getStore())!;
    expect(await db.collection(STORE_COLLECTIONS.backups).findOne({ checksum: file.checksum })).toMatchObject({ status: "complete" });
    expect(await db.collection(STORE_COLLECTIONS.audit).findOne({ action: "backup.create" })).toBeTruthy();
    const good = (await (await routes.backupVerify(upload("/api/admin/backups/verify", gz, boss))).json()) as { ok: boolean; madeHere?: unknown };
    expect(good.ok).toBe(true);
    expect(good.madeHere).toBeTruthy();

    file.collections[STORE_COLLECTIONS.users]![0]!.name = "Changed";
    const tampered = gzipSync(Buffer.from(JSON.stringify(file)));
    const bad = (await (await routes.backupVerify(upload("/api/admin/backups/verify", tampered, boss))).json()) as { ok: boolean; problems: string[] };
    expect(bad.ok).toBe(false);
    expect(bad.problems.join(" ")).toMatch(/checksum doesn't match/);
    expect((await routes.backupVerify(upload("/api/admin/backups/verify", new Uint8Array([1, 2, 3]), boss))).status).toBe(422);
  });

  it("needs a fresh authenticator code to download", async () => {
    const email = owner();
    const boss = await admin(email);
    await staleMfa(await userId(email));
    const response = await routes.backup(call("/api/admin/backups", { action: "export" }, boss));
    expect(response.status).toBe(401);
    expect((await response.json()).code).toBe("reauth");
  });

  it("keeps restores to Super Admins with a fresh code, a dry run and the typed confirmation", async () => {
    const email = owner();
    const boss = await admin(email);
    const adminRole = await withRole(boss, "admin");
    expect((await routes.team(call("/api/admin/team", { action: "save-role", name: "Restorer", description: "", permissions: ["backup.create", "backup.restore"] }, boss))).status).toBe(200);
    const role = await (await getStore())!.collection(STORE_COLLECTIONS.adminRoles).findOne({ name: "Restorer" });
    const restorer = await withRole(boss, role!._id);
    const person = await member();
    const { gz, file } = await download(boss);
    const confirm = `RESTORE ${file.checksum.slice(0, 8)}`;
    const restoreCall = (cookie: string, mode: string, typed?: string) => routes.backupRestore(upload(`/api/admin/backups/restore?mode=${mode}`, gz, cookie, typed ? { "x-restore-confirm": encodeURIComponent(typed) } : {}));

    expect((await restoreCall(adminRole.cookie, "dry-run")).status).toBe(403);
    expect((await restoreCall(restorer.cookie, "dry-run")).status).toBe(403);

    const db = (await getStore())!;
    const users = db.collection(STORE_COLLECTIONS.users);
    await users.deleteOne({ _id: person.id });
    const bossId = await userId(email);
    const memberBefore = await db.collection(STORE_COLLECTIONS.adminMembers).findOne({ _id: bossId });

    expect((await restoreCall(boss, "restore", confirm)).status).toBe(409); // no dry run yet
    const dry = (await (await restoreCall(boss, "dry-run")).json()) as { plans: { name: string; add: number; skipped?: string }[]; confirmation: string };
    expect(dry.confirmation).toBe(confirm);
    expect(dry.plans.find((p) => p.name === STORE_COLLECTIONS.users)!.add).toBe(1);
    expect(dry.plans.find((p) => p.name === STORE_COLLECTIONS.audit)!.skipped).toBeTruthy();
    expect(await users.findOne({ _id: person.id })).toBeNull(); // a dry run writes nothing

    expect((await restoreCall(boss, "restore", "RESTORE wrong")).status).toBe(422);
    await staleMfa(bossId);
    expect((await restoreCall(boss, "restore", confirm)).status).toBe(401);
    await db.collection(STORE_COLLECTIONS.sessions).updateOne({ userId: bossId, role: "admin" }, { $set: { mfaAt: new Date() } });

    const auditBefore = await db.collection(STORE_COLLECTIONS.audit).countDocuments({});
    const done = (await (await restoreCall(boss, "restore", confirm)).json()) as { restored: number; failed: number };
    expect(done.failed).toBe(0);
    expect(done.restored).toBeGreaterThanOrEqual(1);
    expect(await users.findOne({ _id: person.id })).toMatchObject({ email: person.email });
    expect((await users.findOne({ _id: person.id }))!.createdAt).toBeInstanceOf(Date);
    // Authenticators stay as they are now, and the logs are only added to.
    expect((await db.collection(STORE_COLLECTIONS.adminMembers).findOne({ _id: bossId }))!.mfa).toEqual(memberBefore!.mfa);
    expect(await db.collection(STORE_COLLECTIONS.audit).countDocuments({})).toBeGreaterThan(auditBefore);
    expect(await db.collection(STORE_COLLECTIONS.audit).findOne({ action: "backup.restore", outcome: "ok" })).toBeTruthy();
  });
});
