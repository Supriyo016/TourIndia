import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { admin, call, get, owner, setup, signIn, staleMfa, withRole } from "../support/admin";

/** The CMS: permissions on every step, the workflow, scheduled publishing, history and preview. */
const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined) }),
}));
class Redirected extends Error {
  constructor(readonly to: string) {
    super(`redirect ${to}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Redirected(to);
  },
  notFound: () => {
    throw new Redirected("404");
  },
}));

let content: typeof import("@/app/api/admin/content/route").POST;
let cron: typeof import("@/app/api/cron/content/route").GET;
let overridesFor: typeof import("@/features/community/service").overridesFor;
const place = { type: "place", id: "goa" } as const;
const BASE_TIP = "Carry cash for small shacks.";

beforeAll(async () => {
  await setup();
  content = (await import("@/app/api/admin/content/route")).POST;
  cron = (await import("@/app/api/cron/content/route")).GET;
  overridesFor = (await import("@/features/community/service")).overridesFor;
});
beforeEach(() => resetMemoryStore());

const post = async (body: unknown, cookie: string) => {
  const response = await content(call("/api/admin/content", body, cookie));
  return { status: response.status, data: (await response.json()) as { id?: string; error?: string; code?: string; published?: number } };
};

async function team() {
  const boss = await admin(owner());
  const editor = await withRole(boss, "editor");
  const manager = await withRole(boss, "content_manager");
  return { boss, editor, manager };
}

async function draft(cookie: string, fields: Record<string, string> = { bestTimeNote: "November to February is driest." }) {
  const { status, data } = await post({ action: "create", target: place, fields, note: "Better timing" }, cookie);
  expect(status).toBe(200);
  return data.id!;
}

async function version(id: string) {
  const db = (await getStore())!;
  return db.collection(STORE_COLLECTIONS.contentVersions).findOne({ _id: id });
}

describe("CMS permissions", () => {
  it("refuses signed-out visitors, ordinary users and admins without content.edit", async () => {
    const boss = await admin(owner());
    const moderator = await withRole(boss, "moderator");
    const user = await signIn("someone@example.com");
    const body = { action: "create", target: place };
    expect((await post(body, "")).status).toBe(401);
    expect((await post(body, user)).status).toBe(403);
    expect((await post(body, moderator.cookie)).status).toBe(403);
    expect((await post({ action: "publish-due" }, moderator.cookie)).status).toBe(403);
  });

  it("lets editors draft and submit, but only content.publish can approve, publish or schedule", async () => {
    const { editor, manager } = await team();
    const id = await draft(editor.cookie);
    expect((await post({ action: "submit", id }, editor.cookie)).status).toBe(200);
    expect((await post({ action: "approve", id }, editor.cookie)).status).toBe(403);
    expect((await post({ action: "approve", id }, manager.cookie)).status).toBe(200);
    expect((await post({ action: "publish", id }, editor.cookie)).status).toBe(403);
    expect((await post({ action: "schedule", id, at: new Date(Date.now() + 3_600_000).toISOString() }, editor.cookie)).status).toBe(403);
    expect((await post({ action: "publish", id }, manager.cookie)).status).toBe(200);
    // Archiving what's live is unpublishing, which editors can't do.
    expect((await post({ action: "archive", id }, editor.cookie)).status).toBe(403);
  });

  it("needs content.delete and a fresh authenticator code to delete, and never deletes what's live", async () => {
    const { editor, manager } = await team();
    const id = await draft(editor.cookie);
    expect((await post({ action: "delete", id }, editor.cookie)).status).toBe(403);
    await staleMfa(manager.id);
    const stale = await post({ action: "delete", id }, manager.cookie);
    expect(stale).toMatchObject({ status: 401, data: { code: "reauth" } });
    expect(await version(id)).not.toBeNull();

    const other = await withRole(await admin(owner()), "content_manager");
    expect((await post({ action: "delete", id }, other.cookie)).status).toBe(200);
    expect(await version(id)).toBeNull();

    const live = await draft(other.cookie);
    await post({ action: "submit", id: live }, other.cookie);
    await post({ action: "approve", id: live }, other.cookie);
    await post({ action: "publish", id: live }, other.cookie);
    expect((await post({ action: "delete", id: live }, other.cookie)).status).toBe(409);
  });

  it("refuses fields that aren't editable and pages that don't exist", async () => {
    const { editor } = await team();
    expect((await post({ action: "create", target: place, fields: { name: "Goa!" } }, editor.cookie)).status).toBe(422);
    expect((await post({ action: "create", target: { type: "place", id: "atlantis" } }, editor.cookie)).status).toBe(404);
    expect((await post({ action: "create", target: { type: "story", id: "x" } }, editor.cookie)).status).toBe(400);
  });
});

describe("the CMS workflow", () => {
  it("goes Draft → Review → Approved → Published, and refuses steps out of order", async () => {
    const { manager } = await team();
    const id = await draft(manager.cookie);
    expect((await post({ action: "publish", id }, manager.cookie)).status).toBe(409);
    expect((await post({ action: "approve", id }, manager.cookie)).status).toBe(409);
    await post({ action: "submit", id }, manager.cookie);
    expect((await post({ action: "save", id, fields: { bestTimeNote: "Changed in review" } }, manager.cookie)).status).toBe(409);
    expect((await post({ action: "reject", id, note: "Add a source" }, manager.cookie)).status).toBe(200);
    expect(await version(id)).toMatchObject({ status: "draft", reviewNote: "Add a source" });
    await post({ action: "submit", id }, manager.cookie);
    await post({ action: "approve", id }, manager.cookie);
    expect(await overridesFor(place)).toEqual({});
    expect((await post({ action: "publish", id }, manager.cookie)).status).toBe(200);
    expect(await overridesFor(place)).toEqual({ bestTimeNote: "November to February is driest." });

    const db = (await getStore())!;
    const actions = (await db.collection(STORE_COLLECTIONS.audit).find({ target: id }).toArray()).map((row) => row.action);
    expect(actions).toEqual(expect.arrayContaining(["content.create", "content.submit", "content.reject", "content.approve", "content.publish"]));
  });

  it("publishing replaces what was live, archives the old version and can be undone by restoring", async () => {
    const { manager } = await team();
    const live = async (id: string) => {
      await post({ action: "submit", id }, manager.cookie);
      await post({ action: "approve", id }, manager.cookie);
      expect((await post({ action: "publish", id }, manager.cookie)).status).toBe(200);
    };
    const first = await draft(manager.cookie, { bestTimeNote: "First wording.", tips: `${BASE_TIP}\nBook early in December.` });
    await live(first);
    expect(Object.keys(await overridesFor(place)).sort()).toEqual(["bestTimeNote", "tips"]);

    // The second version changes only the best time, so the tips go back to the guide's own.
    const second = await draft(manager.cookie, { bestTimeNote: "Second wording." });
    await live(second);
    expect(await overridesFor(place)).toEqual({ bestTimeNote: "Second wording." });
    expect(await version(first)).toMatchObject({ status: "archived" });

    const restored = await post({ action: "restore", id: first }, manager.cookie);
    expect(restored.status).toBe(200);
    expect(await version(restored.data.id!)).toMatchObject({ status: "draft", source: "restore", restoredFrom: 1, fields: { bestTimeNote: "First wording." } });

    // Unpublishing takes the page back to the guide's own text.
    expect((await post({ action: "archive", id: second }, manager.cookie)).status).toBe(200);
    expect(await overridesFor(place)).toEqual({});
  });

  it("drops fields that match the guide, and starts a blank draft from what's live", async () => {
    const { manager } = await team();
    const { getDestination } = await import("@/data");
    const id = await draft(manager.cookie, { bestTimeNote: getDestination("goa")!.bestTimeNote, permits: "None needed for Indian citizens." });
    expect((await version(id))!.fields).toEqual({ permits: "None needed for Indian citizens." });
    await post({ action: "submit", id }, manager.cookie);
    await post({ action: "approve", id }, manager.cookie);
    await post({ action: "publish", id }, manager.cookie);
    const blank = await post({ action: "create", target: place }, manager.cookie);
    expect((await version(blank.data.id!))!.fields).toEqual({ permits: "None needed for Indian citizens." });
  });

  it("turns an approved community suggestion into a published version", async () => {
    const { decideEdit, proposeEdit } = await import("@/features/community/service");
    const now = new Date();
    const person = (email: string) => ({ _id: crypto.randomUUID(), email, name: "Asha", role: "user", status: "active", interests: [], marketingConsent: false, profileComplete: true, createdAt: now }) as never;
    const { id } = await proposeEdit(place, person("asha@example.com"), { field: "permits", text: "No permits for Goa.", reason: "Checked with the tourism board." });
    await decideEdit(id, person("moderator@example.com"), true, "Thanks");
    expect(await overridesFor(place)).toEqual({ permits: "No permits for Goa." });
    const db = (await getStore())!;
    const [published] = await db.collection(STORE_COLLECTIONS.contentVersions).find({ target: "place:goa" }).toArray();
    expect(published).toMatchObject({ status: "published", source: "community", editId: id });
  });
});

describe("scheduled publishing", () => {
  it("refuses times in the past, and publishes due versions from the cron route only with the secret", async () => {
    const { manager } = await team();
    const id = await draft(manager.cookie);
    await post({ action: "submit", id }, manager.cookie);
    await post({ action: "approve", id }, manager.cookie);
    expect((await post({ action: "schedule", id, at: new Date(Date.now() - 60_000).toISOString() }, manager.cookie)).status).toBe(422);
    expect((await post({ action: "schedule", id, at: new Date(Date.now() + 3_600_000).toISOString() }, manager.cookie)).status).toBe(200);
    expect(await overridesFor(place)).toEqual({});

    // Time passes: the page already reads the due version before any job runs.
    const db = (await getStore())!;
    await db.collection(STORE_COLLECTIONS.contentVersions).updateOne({ _id: id }, { $set: { publishAt: new Date(Date.now() - 1000) } });
    expect(await overridesFor(place)).toEqual({ bestTimeNote: "November to February is driest." });
    expect(await version(id)).toMatchObject({ status: "approved" });

    delete process.env.CRON_SECRET;
    expect((await cron(get("/api/cron/content"))).status).toBe(401);
    process.env.CRON_SECRET = "a-long-enough-cron-secret";
    expect((await cron(get("/api/cron/content", "", { authorization: "Bearer wrong" }))).status).toBe(401);
    const ran = await cron(get("/api/cron/content", "", { authorization: "Bearer a-long-enough-cron-secret" }));
    expect(await ran.json()).toMatchObject({ ok: true, published: 1 });
    expect(await version(id)).toMatchObject({ status: "published" });
    expect(await overridesFor(place)).toEqual({ bestTimeNote: "November to February is driest." });
  });

  it("lets a publisher cancel a schedule", async () => {
    const { manager } = await team();
    const id = await draft(manager.cookie);
    await post({ action: "submit", id }, manager.cookie);
    await post({ action: "approve", id }, manager.cookie);
    await post({ action: "schedule", id, at: new Date(Date.now() + 3_600_000).toISOString() }, manager.cookie);
    expect((await post({ action: "unschedule", id }, manager.cookie)).status).toBe(200);
    expect((await version(id))!.publishAt).toBeUndefined();
  });
});

describe("draft preview", () => {
  it("shows a draft to content editors and nobody else", async () => {
    const { default: Preview } = await import("@/app/admin/content/preview/[id]/page");
    const { editor } = await team();
    const id = await draft(editor.cookie, { bestTimeNote: "Preview-only wording." });
    const params = Promise.resolve({ id });
    const use = (cookie: string) => {
      jar.clear();
      const [name, value] = cookie.split("=");
      if (name) jar.set(name, value ?? "");
    };

    use("");
    await expect(Preview({ params })).rejects.toMatchObject({ to: "/admin/login" });
    use(await signIn("visitor@example.com"));
    await expect(Preview({ params })).rejects.toMatchObject({ to: "/admin/login" });
    const boss = await admin(owner());
    use((await withRole(boss, "moderator")).cookie);
    await expect(Preview({ params })).rejects.toMatchObject({ to: "/admin?denied=1" });

    use(editor.cookie);
    const { renderToStaticMarkup } = await import("react-dom/server");
    const html = renderToStaticMarkup(await Preview({ params }));
    expect(html).toContain("Preview-only wording.");
    expect(html).toContain("Only admins can see this.");
    // The public page doesn't have it.
    expect(await overridesFor(place)).toEqual({});
  });
});
