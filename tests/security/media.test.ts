import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { admin, call, owner, setup, signIn, withRole } from "../support/admin";

/** The media manager: permissions, image choices as content fields, usage and gaps. */
let media: typeof import("@/app/api/admin/media/route").POST;
let lib: typeof import("@/features/media/library");
let pageImage: typeof import("@/features/content/cms").pageImage;

beforeAll(async () => {
  await setup();
  media = (await import("@/app/api/admin/media/route")).POST;
  lib = await import("@/features/media/library");
  pageImage = (await import("@/features/content/cms")).pageImage;
});
beforeEach(() => resetMemoryStore());

const goa = { type: "place", id: "goa" } as const;
const assign = (key: string | null, cookie: string, target: unknown = goa) => media(call("/api/admin/media", { action: "assign", target, key }, cookie));

describe("the media manager", () => {
  it("needs media.manage to choose a page's image", async () => {
    const boss = await admin(owner());
    const moderator = await withRole(boss, "moderator");
    const user = await signIn("viewer@example.com");
    const key = lib.candidatesFor(goa).find((candidate) => candidate !== "destination:goa")!;
    expect((await assign(key, "")).status).toBe(401);
    expect((await assign(key, user)).status).toBe(403);
    expect((await assign(key, moderator.cookie)).status).toBe(403);
  });

  it("stores the choice as a content field, audits it, and can go back to the page's own image", async () => {
    const boss = await admin(owner());
    const editor = await withRole(boss, "editor");
    const key = lib.candidatesFor(goa).find((candidate) => candidate !== "destination:goa")!;
    expect(key).toBeTruthy();
    expect((await assign("gallery:not-a-real-image", editor.cookie)).status).toBe(422);
    expect((await assign(key, editor.cookie, { type: "place", id: "atlantis" })).status).toBe(404);
    expect((await assign(key, editor.cookie)).status).toBe(200);
    expect(await pageImage(goa, "destination:goa")).toBe(key);
    const db = (await getStore())!;
    expect(await db.collection(STORE_COLLECTIONS.overrides).findOne({ _id: "place:goa:image" })).toMatchObject({ field: "image", value: key });
    expect(await db.collection(STORE_COLLECTIONS.audit).findOne({ action: "media.assign" })).toMatchObject({ target: "place:goa", before: null, after: key });
    expect((await lib.library({ q: key })).rows.find((row) => row.key === key)!.usage.some((use) => use.label === "Chosen for Goa")).toBe(true);

    expect((await assign(null, editor.cookie)).status).toBe(200);
    expect(await pageImage(goa, "destination:goa")).toBe("destination:goa");
  });

  it("lists where an image is used and finds gaps from the real data only", () => {
    expect(lib.usageOf("destination:goa").map((use) => use.href)).toContain("/destinations/goa");
    for (const gap of lib.gaps()) expect(["missing-image", "missing-alt", "missing-credit"]).toContain(gap.kind);
    expect(lib.gaps().filter((gap) => gap.kind === "missing-image" && gap.href === "/destinations/goa")).toEqual([]);
  });
});
