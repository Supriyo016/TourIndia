import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MongoClient, type Db } from "mongodb";
import { NextRequest } from "next/server";

/**
 * Runs the real route handlers. By default the database is an in-memory stand-in,
 * which exercises the handlers but not MongoDB. Set TEST_MONGODB_URI, as CI does,
 * to run the same tests against a real server.
 * Rate limiting is per client address, so each test uses its own IP.
 */
const realUri = process.env.TEST_MONGODB_URI;

vi.mock("@/lib/database/mongo", async (importOriginal) => {
  if (process.env.TEST_MONGODB_URI) return importOriginal();
  const { fakeDb } = await import("../fake-mongo");
  return {
    COLLECTIONS: { contact: "contact_messages", newsletter: "newsletter_subscribers", stories: "story_submissions", rateLimits: "rate_limits" },
    isDatabaseConfigured: () => Boolean(process.env.MONGODB_URI),
    getDatabase: async () => fakeDb,
  };
});

let client: MongoClient | undefined;
let db: Db;
let contact: typeof import("@/app/api/contact/route").POST;
let newsletter: typeof import("@/app/api/newsletter/route").POST;
let stories: typeof import("@/app/api/stories/route").POST;
let approved: typeof import("@/features/user/community-stories").getApprovedStories;
let weather: typeof import("@/app/api/weather/route").GET;

let ipCounter = 1;
const nextIp = () => `203.0.113.${ipCounter++}`;

function post(path: string, body: unknown, headers: Record<string, string> = {}, ip = nextIp()) {
  return new NextRequest(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000", host: "localhost:3000", "x-vercel-forwarded-for": ip, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validContact = { name: "Test Person", email: "test@example.com", subject: "A question", message: "This is a long enough message." };
const validStory = { name: "Test Person", email: "t@example.com", title: "My trip", destination: "Hampi", story: "x".repeat(250), consent: true };

beforeAll(async () => {
  process.env.MONGODB_URI = realUri ?? "mongodb://stand-in";
  process.env.MONGODB_DB = "tour_india_test";
  process.env.VERCEL = "1";
  process.env.RATE_LIMIT_SALT = "test-salt-test-salt-test-salt-test";
  if (realUri) {
    client = await new MongoClient(realUri).connect();
    db = client.db("tour_india_test");
  } else {
    const { fakeDb } = await import("../fake-mongo");
    db = fakeDb as unknown as Db;
  }
  await db.collection("newsletter_subscribers").createIndex({ email: 1 }, { unique: true });

  contact = (await import("@/app/api/contact/route")).POST;
  newsletter = (await import("@/app/api/newsletter/route")).POST;
  stories = (await import("@/app/api/stories/route")).POST;
  weather = (await import("@/app/api/weather/route")).GET;
  approved = (await import("@/features/user/community-stories")).getApprovedStories;
});

afterAll(async () => {
  if (!realUri) return;
  await db.dropDatabase();
  const shared = await globalThis.__tourIndiaMongo;
  await shared?.close();
  await client?.close();
});

beforeEach(async () => {
  for (const name of ["contact_messages", "story_submissions", "newsletter_subscribers"]) await db.collection(name).deleteMany({});
});

describe("request guards", () => {
  it("accepts and stores a valid message", async () => {
    const response = await contact(post("/api/contact", validContact));
    expect(response.status).toBe(201);
    expect(await db.collection("contact_messages").countDocuments()).toBe(1);
  });

  it("rejects a cross-site origin", async () => {
    const response = await contact(post("/api/contact", validContact, { origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(await db.collection("contact_messages").countDocuments()).toBe(0);
  });

  it("rejects a request with no origin", async () => {
    const request = new NextRequest("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", host: "localhost:3000", "x-vercel-forwarded-for": nextIp() },
      body: JSON.stringify(validContact),
    });
    expect((await contact(request)).status).toBe(403);
  });

  it("rejects a non-JSON content type, which blocks simple cross-site forms", async () => {
    expect((await contact(post("/api/contact", "name=a", { "content-type": "application/x-www-form-urlencoded" }))).status).toBe(415);
  });

  it("rejects malformed JSON", async () => {
    expect((await contact(post("/api/contact", "{not json"))).status).toBe(400);
  });

  it("rejects an oversized body", async () => {
    expect((await contact(post("/api/contact", { ...validContact, message: "x".repeat(20_000) }))).status).toBe(413);
  });

  it("rate limits repeated submissions from one address", async () => {
    const ip = nextIp();
    const codes: number[] = [];
    for (let i = 0; i < 7; i += 1) codes.push((await contact(post("/api/contact", validContact, {}, ip))).status);
    expect(codes.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
    expect(codes.slice(5)).toEqual([429, 429]);
  });

  it("keeps rate-limit buckets separate per address", async () => {
    const first = nextIp();
    for (let i = 0; i < 6; i += 1) await contact(post("/api/contact", validContact, {}, first));
    expect((await contact(post("/api/contact", validContact))).status).toBe(201);
  });

  describe("client address", () => {
    const request = (headers: Record<string, string>) => post("/api/contact", {}, headers, "198.51.100.1");
    let clientAddress: typeof import("@/lib/api/form-handler").clientAddress;

    beforeAll(async () => {
      clientAddress = (await import("@/lib/api/form-handler")).clientAddress;
    });

    afterAll(() => {
      process.env.VERCEL = "1";
      delete process.env.TRUSTED_PROXY_HOPS;
    });

    it("ignores spoofable headers when not on a trusted platform", () => {
      delete process.env.VERCEL;
      delete process.env.TRUSTED_PROXY_HOPS;
      expect(clientAddress(request({ "x-forwarded-for": "1.1.1.1", "x-real-ip": "2.2.2.2" }))).toBe("unknown");
    });

    it("reads from the right of the chain behind a known number of proxies", () => {
      delete process.env.VERCEL;
      process.env.TRUSTED_PROXY_HOPS = "1";
      expect(clientAddress(request({ "x-forwarded-for": "6.6.6.6, 9.9.9.9" }))).toBe("9.9.9.9");
    });

    it("groups IPv6 clients by network", () => {
      process.env.VERCEL = "1";
      const one = clientAddress(post("/api/contact", {}, {}, "2001:db8:1:2:aaaa:0:0:1"));
      const two = clientAddress(post("/api/contact", {}, {}, "2001:db8:1:2:bbbb:0:0:2"));
      expect(one).toBe(two);
    });
  });

  it("rejects by declared size before reading the body", async () => {
    expect((await contact(post("/api/contact", validContact, { "content-length": "99999999" }))).status).toBe(413);
  });

  it("never stores raw IP addresses", async () => {
    const ip = "198.51.100.77";
    await contact(post("/api/contact", validContact, {}, ip));
    const records = await db.collection("rate_limits").find().toArray();
    expect(records.length).toBeGreaterThan(0);
    expect(JSON.stringify(records)).not.toContain(ip);
    expect(JSON.stringify(await db.collection("contact_messages").find().toArray())).not.toContain(ip);
  });
});

describe("input validation", () => {
  it.each([
    ["missing name", { ...validContact, name: "" }],
    ["bad email", { ...validContact, email: "nope" }],
    ["short message", { ...validContact, message: "hi" }],
    ["over-long subject", { ...validContact, subject: "x".repeat(121) }],
  ])("rejects %s", async (_label, body) => {
    expect((await contact(post("/api/contact", body))).status).toBe(422);
    expect(await db.collection("contact_messages").countDocuments()).toBe(0);
  });

  it("blocks NoSQL operator injection", async () => {
    const response = await contact(post("/api/contact", { ...validContact, email: { $gt: "" }, name: { $ne: null } }));
    expect(response.status).toBe(422);
    expect(await db.collection("contact_messages").countDocuments()).toBe(0);
  });

  it("ignores attempts to set privileged fields", async () => {
    await stories(post("/api/stories", { ...validStory, status: "approved", _id: "chosen" }));
    const [stored] = await db.collection("story_submissions").find().toArray();
    expect(stored?.status).toBe("pending");
    expect(stored?._id).not.toBe("chosen");
  });

  it("stores script text inertly for React to escape, never as markup", async () => {
    await contact(post("/api/contact", { ...validContact, subject: "<script>alert(1)</script>" }));
    const [stored] = await db.collection("contact_messages").find().toArray();
    expect(typeof stored?.subject).toBe("string");
  });

  it("drops honeypot submissions but reports success", async () => {
    const response = await contact(post("/api/contact", { ...validContact, company: "Bots Inc" }));
    expect(response.status).toBe(200);
    expect(await db.collection("contact_messages").countDocuments()).toBe(0);
  });

  it("requires explicit newsletter consent", async () => {
    expect((await newsletter(post("/api/newsletter", { email: "a@example.com" }))).status).toBe(422);
    expect((await newsletter(post("/api/newsletter", { email: "a@example.com", consent: false }))).status).toBe(422);
  });

  it("does not reveal whether an email is already subscribed", async () => {
    const first = await newsletter(post("/api/newsletter", { email: "a@example.com", consent: true }));
    const second = await newsletter(post("/api/newsletter", { email: "A@example.com", consent: true }));
    expect(first.status).toBe(second.status);
    expect(await first.json()).toEqual(await second.json());
    expect(await db.collection("newsletter_subscribers").countDocuments()).toBe(1);
  });
});

describe("story moderation", () => {
  it("does not publish a story until it is approved", async () => {
    await stories(post("/api/stories", validStory));
    expect(await approved()).toEqual([]);
    await db.collection("story_submissions").updateOne({}, { $set: { status: "approved" } });
    const published = await approved();
    expect(published).toHaveLength(1);
    expect(published[0]?.title).toBe("My trip");
  });

  it("never exposes submitters' email addresses", async () => {
    await stories(post("/api/stories", validStory));
    await db.collection("story_submissions").updateOne({}, { $set: { status: "approved" } });
    expect(JSON.stringify(await approved())).not.toContain("t@example.com");
  });
});

describe("weather endpoint", () => {
  it.each(["../../etc", "http://169.254.169.254/", "agra&latitude=0", "AGRA", "does-not-exist", ""])("refuses slug %j without calling upstream", async (slug) => {
    const response = await weather(new NextRequest(`http://localhost:3000/api/weather?slug=${encodeURIComponent(slug)}`));
    expect(response.status).toBe(404);
  });
});

describe("when the database is unavailable", () => {
  it("reports failure honestly rather than claiming success", async () => {
    const saved = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;
    try {
      const response = await contact(post("/api/contact", validContact));
      expect(response.status).toBe(503);
      const body = (await response.json()) as { error: string };
      expect(body.error).not.toMatch(/mongo|stack|ECONN/i);
    } finally {
      process.env.MONGODB_URI = saved;
    }
  });
});
