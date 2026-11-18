import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { admin, call, get, owner, setup, signIn, staleMfa, withRole } from "../support/admin";

/** Settings, feature flags and maintenance mode. */
let settingsRoute: typeof import("@/app/api/admin/settings/route").POST;
let assistant: typeof import("@/app/api/assistant/route").POST;
let newsletter: typeof import("@/app/api/newsletter/route").POST;
let proxy: typeof import("@/proxy").proxy;
let settings: typeof import("@/features/settings/settings");

beforeAll(async () => {
  await setup();
  settingsRoute = (await import("@/app/api/admin/settings/route")).POST;
  assistant = (await import("@/app/api/assistant/route")).POST;
  newsletter = (await import("@/app/api/newsletter/route")).POST;
  proxy = (await import("@/proxy")).proxy;
  settings = await import("@/features/settings/settings");
});
beforeEach(() => {
  resetMemoryStore();
  settings.clearSettingsCache();
});

const change = (body: unknown, cookie: string) => settingsRoute(call("/api/admin/settings", body, cookie));
const rewrittenTo = (response: Response) => response.headers.get("x-middleware-rewrite");

describe("settings permissions", () => {
  it("needs settings.manage, and a fresh authenticator code for maintenance mode", async () => {
    const boss = await admin(owner());
    const moderator = await withRole(boss, "moderator");
    const user = await signIn("visitor@example.com");
    const off = { action: "flags", flags: { assistant: false } };
    expect((await change(off, "")).status).toBe(401);
    expect((await change(off, user)).status).toBe(403);
    expect((await change(off, moderator.cookie)).status).toBe(403);
    expect((await change({ action: "flags", flags: { teleport: true } }, boss)).status).toBe(422);

    const runner = await withRole(boss, "admin");
    await staleMfa(runner.id);
    expect((await change(off, runner.cookie)).status).toBe(200);
    const stale = await change({ action: "maintenance", on: true }, runner.cookie);
    expect(stale.status).toBe(401);
    expect(await stale.json()).toMatchObject({ code: "reauth" });
    expect((await settings.getSettings({ fresh: true })).maintenance.on).toBe(false);
  });

  it("audits every change with before and after values", async () => {
    const boss = await admin(owner());
    await change({ action: "flags", flags: { comments: false } }, boss);
    await change({ action: "maintenance", on: true, message: "Back at six." }, boss);
    const db = (await getStore())!;
    expect(await db.collection(STORE_COLLECTIONS.audit).findOne({ action: "settings.flags" })).toMatchObject({ before: { comments: true }, after: { comments: false } });
    expect(await db.collection(STORE_COLLECTIONS.audit).findOne({ action: "settings.maintenance.on" })).toMatchObject({ before: { on: false }, after: { on: true, message: "Back at six." } });
  });
});

describe("feature flags", () => {
  it("are on by default and switch features off with a friendly reason", async () => {
    expect(await settings.isEnabled("assistant")).toBe(true);
    const boss = await admin(owner());
    expect((await change({ action: "flags", flags: { assistant: false, newsletter: false } }, boss)).status).toBe(200);

    const asked = await assistant(call("/api/assistant", { messages: [{ role: "user", content: "Tell me about Goa" }] }));
    expect(asked.status).toBe(503);
    expect(await asked.json()).toMatchObject({ code: "feature-off" });
    expect((await newsletter(call("/api/newsletter", { email: "a@example.com", consent: true }))).status).toBe(503);

    await change({ action: "flags", flags: { assistant: true } }, boss);
    expect((await assistant(call("/api/assistant", { messages: [{ role: "user", content: "Tell me about Goa" }] }))).status).toBe(200);
  });

  it("falls back to everything on when the settings can't be read", async () => {
    const db = (await getStore())!;
    await db.collection(STORE_COLLECTIONS.settings).insertOne({ _id: "site", flags: { assistant: "nope", unknown: false }, maintenance: { on: "yes" } });
    const read = await settings.getSettings({ fresh: true });
    expect(read.flags.assistant).toBe(true);
    expect(read.maintenance.on).toBe(false);
  });
});

describe("maintenance mode", () => {
  it("shows visitors the maintenance page, refuses public APIs, and keeps admin and sign-in open", async () => {
    const boss = await admin(owner());
    expect(rewrittenTo(await proxy(get("/destinations/goa")))).toBeNull();
    expect((await change({ action: "maintenance", on: true, message: "Back soon." }, boss)).status).toBe(200);

    const page = await proxy(get("/destinations/goa"));
    expect(page.status).toBe(503);
    expect(rewrittenTo(page)).toContain("/maintenance");
    const api = await proxy(call("/api/community", {}));
    expect(api.status).toBe(503);
    expect(await api.json()).toMatchObject({ error: "Back soon.", code: "maintenance" });

    for (const path of ["/admin", "/admin/login", "/api/admin/settings", "/api/auth/otp/request", "/maintenance"]) {
      const open = await proxy(get(path));
      expect(open.status, path).toBe(200);
      expect(rewrittenTo(open), path).toBeNull();
    }
    // A signed-in admin sees the site; a signed-in visitor doesn't.
    expect(rewrittenTo(await proxy(get("/destinations/goa", boss)))).toBeNull();
    const visitor = await signIn("visitor@example.com");
    expect(rewrittenTo(await proxy(get("/destinations/goa", visitor)))).toContain("/maintenance");

    await change({ action: "maintenance", on: false }, boss);
    expect(rewrittenTo(await proxy(get("/destinations/goa")))).toBeNull();
  });
});
