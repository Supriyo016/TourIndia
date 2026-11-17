import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getStore, resetMemoryStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { currentStep, totpAt } from "@/lib/auth/totp";

/** Support tickets and the moderation queue, through the real routes and services. */
let routes: {
  request: typeof import("@/app/api/auth/otp/request/route").POST;
  verify: typeof import("@/app/api/auth/otp/verify/route").POST;
  team: typeof import("@/app/api/admin/team/route").POST;
  mfa: typeof import("@/app/api/admin/mfa/route").POST;
  support: typeof import("@/app/api/admin/support/route").POST;
};
let lastCode = "";
let ip = 1;
let addresses = 0;
const ORIGIN = "http://localhost:3000";

const call = (path: string, body: unknown, cookie = "") =>
  new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000", "x-vercel-forwarded-for": `198.19.1.${ip++ % 250}`, cookie },
    body: JSON.stringify(body),
  });
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
async function withRole(boss: string, role: string) {
  const email = fresh(role);
  await signIn(email);
  expect((await routes.team(call("/api/admin/team", { action: "set-roles", email, roles: [role] }, boss))).status).toBe(200);
  const db = (await getStore())!;
  const user = await db.collection(STORE_COLLECTIONS.users).findOne({ email });
  return { email, id: user!._id, cookie: await admin(email) };
}

async function ticket(fields: Record<string, unknown> = {}) {
  const db = (await getStore())!;
  const reference = `S-${String(++addresses).padStart(4, "2")}-ABCD`;
  await db.collection(STORE_COLLECTIONS.tickets).insertOne({
    _id: crypto.randomUUID(),
    reference,
    name: "Meera",
    email: "meera@example.com",
    category: "general",
    subject: "A question",
    message: "Is the Darjeeling toy train running in July?",
    priority: "normal",
    status: "new",
    notes: [],
    createdAt: new Date(),
    ...fields,
  });
  return reference;
}

beforeAll(async () => {
  process.env.VERCEL = "1";
  process.env.ADMIN_EMAILS = "nobody@example.com";
  vi.spyOn(console, "info").mockImplementation((message: unknown) => {
    const match = /code for \S+ is (\d{6})/.exec(String(message));
    if (match) lastCode = match[1]!;
  });
  routes = {
    request: (await import("@/app/api/auth/otp/request/route")).POST,
    verify: (await import("@/app/api/auth/otp/verify/route")).POST,
    team: (await import("@/app/api/admin/team/route")).POST,
    mfa: (await import("@/app/api/admin/mfa/route")).POST,
    support: (await import("@/app/api/admin/support/route")).POST,
  };
});

beforeEach(() => resetMemoryStore());

describe("the contact form", () => {
  it("defaults to a general question and refuses unknown categories", async () => {
    const { contactSchema } = await import("@/lib/validation/forms");
    const base = { name: "Meera", email: "meera@example.com", subject: "Hello", message: "A question about trains." };
    expect(contactSchema.parse(base).category).toBe("general");
    expect(contactSchema.safeParse({ ...base, category: "copyright" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...base, category: "billing" }).success).toBe(false);
  });

  it("makes readable references and starts privacy and copyright tickets at high priority", async () => {
    const { newTicketReference } = await import("@/features/support/reference");
    const { startingPriority } = await import("@/features/support/types");
    expect(newTicketReference()).toMatch(/^S-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
    expect(startingPriority("privacy")).toBe("high");
    expect(startingPriority("copyright")).toBe("high");
    expect(startingPriority("general")).toBe("normal");
  });
});

describe("support tickets", () => {
  it("lets support staff move a ticket through its statuses, assign it and add notes, all audited", async () => {
    const boss = await admin(owner());
    const agent = await withRole(boss, "support_manager");
    const reference = await ticket();
    expect((await routes.support(call("/api/admin/support", { action: "update", reference, status: "in_progress", priority: "high", assignTo: agent.id }, agent.cookie))).status).toBe(200);
    expect((await routes.support(call("/api/admin/support", { action: "note", reference, text: "Asked the railway; waiting to hear." }, agent.cookie))).status).toBe(200);
    expect((await routes.support(call("/api/admin/support", { action: "update", reference, status: "resolved" }, agent.cookie))).status).toBe(200);

    const db = (await getStore())!;
    const saved = await db.collection(STORE_COLLECTIONS.tickets).findOne({ reference });
    expect(saved).toMatchObject({ status: "resolved", priority: "high", assignedTo: agent.id, assignedEmail: agent.email });
    expect(saved!.resolvedAt).toBeInstanceOf(Date);
    expect((saved!.notes as { text: string }[])[0]?.text).toBe("Asked the railway; waiting to hear.");
    const log = await db.collection(STORE_COLLECTIONS.audit).find({ target: reference, action: "ticket.update" }).toArray();
    expect(log[0]).toMatchObject({ before: { status: "new", priority: "normal", assignedTo: null }, after: { status: "in_progress", priority: "high", assignedTo: agent.email } });
  });

  it("only assigns tickets to admins who can work on them, and keeps other roles out", async () => {
    const boss = await admin(owner());
    const agent = await withRole(boss, "support_manager");
    const analyst = await withRole(boss, "analyst");
    const reference = await ticket();
    expect((await routes.support(call("/api/admin/support", { action: "update", reference, assignTo: analyst.id }, agent.cookie))).status).toBe(403);
    expect((await routes.support(call("/api/admin/support", { action: "note", reference, text: "Peeking" }, analyst.cookie))).status).toBe(403);
    expect((await routes.support(call("/api/admin/support", { action: "update", reference: "not-a-ref", status: "closed" }, agent.cookie))).status).toBe(422);
    expect((await routes.support(call("/api/admin/support", { action: "update", reference: "S-ZZZZ-ZZZZ", status: "closed" }, agent.cookie))).status).toBe(404);
  });

  it("lists open tickets with urgent ones first and counts each status", async () => {
    const { countOpenTickets, listTickets } = await import("@/features/support/tickets");
    await ticket({ priority: "low" });
    await ticket({ priority: "urgent" });
    await ticket({ status: "closed" });
    await ticket({ status: "under_review", category: "copyright", priority: "high" });
    const open = await listTickets({});
    expect(open.total).toBe(3);
    expect(open.rows.map((t) => t.priority)).toEqual(["urgent", "high", "low"]);
    expect((await listTickets({ category: "copyright" })).total).toBe(1);
    expect((await listTickets({ status: "all" })).total).toBe(4);
    expect(await countOpenTickets()).toMatchObject({ new: 2, under_review: 1, closed: 1, total: 3 });
  });
});

describe("moderation queue", () => {
  it("groups waiting items by kind and ignores reports on comments that are already gone", async () => {
    const db = (await getStore())!;
    const comment = async (status: string, body: string) => {
      const id = crypto.randomUUID();
      await db.collection(STORE_COLLECTIONS.comments).insertOne({ _id: id, status, body, target: "destination:goa", createdAt: new Date() });
      return id;
    };
    const spam = await comment("visible", "Cheap tours here!!!");
    const rude = await comment("hidden", "You are an idiot");
    const removed = await comment("removed", "Spam that was already removed");
    await comment("pending", "Held by the filter");
    for (const [commentId, reason] of [[spam, "spam"], [rude, "hateful"], [rude, "disrespectful"], [removed, "spam"]] as const) {
      await db.collection(STORE_COLLECTIONS.reports).insertOne({ _id: crypto.randomUUID(), commentId, userId: crypto.randomUUID(), reason, createdAt: new Date() });
    }
    await db.collection(STORE_COLLECTIONS.edits).insertOne({ _id: crypto.randomUUID(), status: "pending", field: "bestMonths", value: "October to March", createdAt: new Date() });
    await ticket({ category: "copyright" });
    await ticket({ category: "correction" });

    const { moderationQueue } = await import("@/features/admin/queue");
    const { groups } = await moderationQueue();
    const count = (id: string) => groups.find((g) => g.id === id)?.count;
    expect(count("spam")).toBe(1);
    expect(count("inappropriate")).toBe(1);
    expect(count("held")).toBe(1);
    expect(count("wrong")).toBe(2);
    expect(count("copyright")).toBe(1);
    expect(count("appeals")).toBe(0);
  });
});
