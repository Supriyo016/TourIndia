/**
 * Creates the MongoDB collections with schema validation and indexes.
 * Safe to run more than once. Usage: MONGODB_URI=... npm run db:setup
 *
 * Vercel also runs it before each build (`npm run vercel-build`, with --deploy). In that mode a
 * missing or unreachable database is reported but never stops the deploy.
 */
import { MongoClient } from "mongodb";

const deploy = process.argv.includes("--deploy");
const uri = process.env.MONGODB_URI;
// Preview builds may share production's database, so only production deploys change its rules.
if (deploy && process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
  console.log(`db-setup: skipped for the ${process.env.VERCEL_ENV} build.`);
  process.exit(0);
}
if (!uri) {
  console.error(deploy ? "db-setup: MONGODB_URI is not set, skipping." : "Set MONGODB_URI first.");
  process.exit(deploy ? 0 : 1);
}

const str = (maxLength) => ({ bsonType: "string", maxLength });

const logRules = {
  required: ["seq", "action", "outcome", "at", "prevHash", "hash"],
  properties: {
    seq: { bsonType: ["int", "long", "double"] },
    action: str(60),
    outcome: { enum: ["ok", "denied", "failed"] },
    actorId: str(36),
    actorEmail: str(254),
    target: str(120),
    detail: str(300),
    country: str(2),
    at: { bsonType: "date" },
    prevHash: str(64),
    hash: str(64),
  },
  indexes: [[{ seq: -1 }, {}], [{ at: -1 }, {}], [{ actorId: 1, at: -1 }, {}]],
};

const collections = {
  contact_messages: {
    required: ["name", "email", "subject", "message", "status", "createdAt"],
    // Contact messages are support tickets. "read" is the pre-ticket status, kept for old records.
    properties: {
      name: str(80),
      email: str(254),
      subject: str(120),
      message: str(3000),
      reference: str(12),
      category: { enum: ["general", "correction", "bug", "feature", "accessibility", "account", "privacy", "copyright", "other"] },
      priority: { enum: ["low", "normal", "high", "urgent"] },
      status: { enum: ["new", "under_review", "in_progress", "resolved", "closed", "read"] },
      assignedTo: str(36),
      notes: { bsonType: "array", maxItems: 100 },
      createdAt: { bsonType: "date" },
    },
    indexes: [[{ createdAt: -1 }, {}], [{ reference: 1 }, { unique: true, partialFilterExpression: { reference: { $type: "string" } } }], [{ status: 1, createdAt: -1 }, {}], [{ assignedTo: 1, status: 1 }, {}]],
  },
  newsletter_subscribers: {
    required: ["email", "consentedAt", "status"],
    properties: { email: str(254), consentedAt: { bsonType: "date" }, status: { enum: ["subscribed", "unsubscribed"] } },
    indexes: [[{ email: 1 }, { unique: true }]],
  },
  story_submissions: {
    required: ["name", "email", "title", "destination", "story", "status", "createdAt"],
    properties: { name: str(80), email: str(254), title: str(120), destination: str(80), story: str(6000), status: { enum: ["pending", "approved", "rejected"] }, createdAt: { bsonType: "date" } },
    indexes: [[{ status: 1, createdAt: -1 }, {}]],
  },
  rate_limits: {
    required: ["count", "expiresAt"],
    properties: { count: { bsonType: "int" }, expiresAt: { bsonType: "date" } },
    indexes: [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
  },

  // Accounts. Emails are unique; sessions and codes expire on their own (TTL indexes).
  users: {
    required: ["email", "role", "status", "interests", "marketingConsent", "profileComplete", "createdAt"],
    properties: {
      _id: { bsonType: "string" },
      email: str(254),
      name: str(60),
      role: { enum: ["user", "admin"] },
      status: { enum: ["active", "blocked"] },
      restrictedUntil: { bsonType: "date" },
      homeState: str(60),
      country: str(56),
      interests: { bsonType: "array", maxItems: 12, items: str(30) },
      travelStyle: str(20),
      language: str(20),
      marketingConsent: { bsonType: "bool" },
      profileComplete: { bsonType: "bool" },
      googleSub: str(64),
      createdAt: { bsonType: "date" },
      lastLoginAt: { bsonType: "date" },
    },
    indexes: [[{ email: 1 }, { unique: true }], [{ googleSub: 1 }, { sparse: true }]],
  },
  // Public-profile details and choices, one per user. Usernames are unique once chosen.
  profiles: {
    required: ["avatar", "cover", "prefs", "privacy", "createdAt", "updatedAt"],
    properties: {
      _id: { bsonType: "string" },
      username: { bsonType: "string", pattern: "^[a-z0-9][a-z0-9_]{1,18}[a-z0-9]$" },
      avatar: str(40),
      cover: str(60),
      tagline: str(80),
      bio: str(300),
      city: str(60),
      website: str(120),
      prefs: { bsonType: "object" },
      privacy: {
        bsonType: "object",
        required: ["visibility", "show", "linkComments"],
        properties: { visibility: { enum: ["private", "members", "public"] }, show: { bsonType: "array", maxItems: 12, items: str(20) }, linkComments: { bsonType: "bool" } },
      },
      privacySetAt: { bsonType: "date" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
    indexes: [[{ username: 1 }, { unique: true, partialFilterExpression: { username: { $type: "string" } } }]],
  },
  // Saved places and passport stamps, one per user (_id is the user id).
  saved_lists: {
    required: ["places", "stamps", "updatedAt"],
    properties: {
      _id: { bsonType: "string" },
      places: { bsonType: "array", maxItems: 500, items: str(80) },
      stamps: { bsonType: "array", maxItems: 60, items: str(80) },
      updatedAt: { bsonType: "date" },
    },
    indexes: [],
  },
  // Named lists of places. shareId is the read-only link's address while sharing is on.
  collections: {
    required: ["userId", "name", "note", "places", "createdAt", "updatedAt"],
    properties: {
      userId: str(36),
      name: str(60),
      note: str(300),
      places: { bsonType: "array", maxItems: 100, items: str(80) },
      shareId: { bsonType: "string", pattern: "^[A-Za-z0-9_-]{16}$" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
    indexes: [[{ userId: 1, updatedAt: -1 }, {}], [{ shareId: 1 }, { unique: true, partialFilterExpression: { shareId: { $type: "string" } } }]],
  },
  // Trips saved from the planner: settings plus the order of items; everything else is rebuilt from the guide.
  trips: {
    required: ["userId", "name", "input", "layout", "expenses", "status", "createdAt", "updatedAt"],
    properties: {
      userId: str(36),
      name: str(80),
      input: { bsonType: "object" },
      layout: { bsonType: "array", maxItems: 120 },
      expenses: { bsonType: "object" },
      status: { enum: ["active", "archived"] },
      shareId: { bsonType: "string", pattern: "^[A-Za-z0-9_-]{16}$" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
    indexes: [[{ userId: 1, updatedAt: -1 }, {}], [{ shareId: 1 }, { unique: true, partialFilterExpression: { shareId: { $type: "string" } } }]],
  },
  // Analytics (cookieless, consent only). Raw events go after 90 days; daily totals are kept;
  // visitor hashes (daily key, never stored with events) go after 2 days.
  analytics_events: {
    required: ["at", "day", "type", "path", "device", "browser", "expiresAt"],
    properties: {
      at: { bsonType: "date" },
      day: str(10),
      type: { enum: ["view", "event", "vital"] },
      path: str(120),
      name: str(20),
      variant: str(20),
      referrer: str(80),
      from: str(120),
      query: str(60),
      results: { bsonType: ["int", "long", "double"] },
      value: { bsonType: ["int", "long", "double"] },
      rating: { enum: ["good", "ni", "poor"] },
      device: { enum: ["mobile", "tablet", "desktop"] },
      browser: str(20),
      country: str(2),
      state: str(60),
      expiresAt: { bsonType: "date" },
    },
    indexes: [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }], [{ day: 1, type: 1 }, {}]],
  },
  analytics_daily: {
    required: ["day", "dim", "key", "count"],
    properties: { day: str(10), dim: str(20), key: str(140), count: { bsonType: ["int", "long", "double"] } },
    indexes: [[{ day: 1, dim: 1 }, {}], [{ dim: 1, day: 1 }, {}]],
  },
  // Core Web Vitals per UTC day, metric and page (written by /api/collect, read by the Health page).
  web_vitals: {
    required: ["day", "metric", "path", "count"],
    properties: {
      day: str(10),
      metric: { enum: ["LCP", "INP", "CLS", "FCP", "TTFB"] },
      path: str(120),
      count: { bsonType: ["int", "long", "double"] },
      good: { bsonType: ["int", "long", "double"] },
      needsImprovement: { bsonType: ["int", "long", "double"] },
      poor: { bsonType: ["int", "long", "double"] },
      sum: { bsonType: ["int", "long", "double"] },
    },
    indexes: [[{ day: -1 }, {}]],
  },
  analytics_visitors: {
    required: ["day", "expiresAt"],
    properties: { day: str(10), expiresAt: { bsonType: "date" } },
    indexes: [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
  },
  otp_codes: {
    required: ["codeHash", "attempts", "sentAt", "expiresAt"],
    properties: { codeHash: str(64), attempts: { bsonType: "int" }, sentAt: { bsonType: "date" }, expiresAt: { bsonType: "date" } },
    indexes: [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
  },
  sessions: {
    required: ["userId", "role", "createdAt", "expiresAt"],
    properties: {
      userId: str(36),
      role: { enum: ["user", "admin"] },
      createdAt: { bsonType: "date" },
      expiresAt: { bsonType: "date" },
      publicId: str(20),
      device: str(60),
      country: str(2),
      lastSeenAt: { bsonType: "date" },
      mfaAt: { bsonType: "date" },
    },
    indexes: [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }], [{ userId: 1 }, {}], [{ publicId: 1 }, {}]],
  },

  // Community. Counts live in target_stats so pages never scan whole collections.
  comments: {
    required: ["target", "authorName", "kind", "body", "status", "reports", "createdAt"],
    properties: {
      target: str(100),
      parentId: { bsonType: ["string", "null"] },
      userId: { bsonType: ["string", "null"] },
      authorName: str(60),
      kind: { enum: ["viewpoint", "tip", "question"] },
      body: str(2000),
      status: { enum: ["visible", "pending", "hidden", "removed"] },
      reports: { bsonType: "int" },
      helpful: { bsonType: "int" },
      createdAt: { bsonType: "date" },
    },
    indexes: [[{ target: 1, status: 1, createdAt: -1 }, {}], [{ status: 1, createdAt: -1 }, {}], [{ userId: 1 }, {}]],
  },
  reactions: {
    required: ["target", "userId", "kind", "createdAt"],
    properties: { target: str(100), userId: str(36), kind: { enum: ["love", "helpful"] }, createdAt: { bsonType: "date" } },
    indexes: [[{ userId: 1 }, {}]],
  },
  ratings: {
    required: ["target", "userId", "stars"],
    properties: { target: str(100), userId: str(36), stars: { bsonType: "int", minimum: 1, maximum: 5 } },
    indexes: [[{ userId: 1 }, {}]],
  },
  target_stats: {
    required: [],
    properties: { loves: { bsonType: "int" }, ratingCount: { bsonType: "int" }, ratingSum: { bsonType: "int" }, comments: { bsonType: "int" } },
    indexes: [],
  },
  edit_proposals: {
    required: ["target", "field", "proposed", "reason", "userId", "status", "createdAt"],
    properties: {
      target: str(100),
      field: str(40),
      reason: str(600),
      userId: str(36),
      status: { enum: ["pending", "approved", "rejected"] },
      createdAt: { bsonType: "date" },
    },
    indexes: [[{ status: 1, createdAt: 1 }, {}], [{ userId: 1, status: 1 }, {}]],
  },
  content_overrides: {
    required: ["target", "field", "value", "approvedAt"],
    properties: { target: str(100), field: str(40), approvedAt: { bsonType: "date" } },
    indexes: [[{ target: 1 }, {}]],
  },
  reports: {
    required: ["commentId", "userId", "reason", "createdAt"],
    properties: { commentId: str(36), userId: str(36), reason: str(20), createdAt: { bsonType: "date" } },
    indexes: [],
  },
  // Admin actions and security events: append-only, each record chained to the one before by hash.
  // Records from before the chain (adminId/subject, no seq) were written under the old rules and stay valid.
  audit_log: logRules,
  security_events: logRules,
  // Admin roles beyond the built-in ones, and who holds which roles (plus their MFA record).
  admin_roles: {
    required: ["name", "permissions", "createdAt"],
    properties: { name: str(40), description: str(200), permissions: { bsonType: "array", maxItems: 40, items: str(40) }, createdAt: { bsonType: "date" } },
    indexes: [[{ name: 1 }, { unique: true }]],
  },
  // Suspensions and bans, with their history and appeals. Kept after they end.
  user_restrictions: {
    required: ["userId", "email", "kind", "permanent", "reason", "note", "startsAt", "createdBy"],
    properties: {
      userId: str(36),
      email: str(254),
      kind: { enum: ["suspension", "ban"] },
      permanent: { bsonType: "bool" },
      reason: { enum: ["spam", "abuse", "misinformation", "copyright", "security", "other"] },
      note: str(500),
      evidence: str(200),
      startsAt: { bsonType: "date" },
      endsAt: { bsonType: "date" },
      createdBy: str(36),
    },
    indexes: [[{ userId: 1, startsAt: -1 }, {}], [{ "appeal.status": 1 }, {}]],
  },
  admin_members: {
    required: ["email", "roles", "createdAt"],
    properties: { email: str(254), roles: { bsonType: "array", maxItems: 20, items: str(40) }, createdAt: { bsonType: "date" } },
    indexes: [[{ email: 1 }, { unique: true }]],
  },
  booking_requests: {
    required: ["reference", "status", "createdAt"],
    properties: { reference: str(12), status: { enum: ["new", "contacted", "closed"] }, createdAt: { bsonType: "date" } },
    indexes: [[{ reference: 1 }, { unique: true }], [{ userId: 1, createdAt: -1 }, {}]],
  },
  // Cached page translations, keyed by a hash of language and source text; they expire after 180 days.
  translations: {
    required: ["lang", "text", "createdAt", "expiresAt"],
    properties: { _id: { bsonType: "string" }, lang: str(12), text: str(9000), createdAt: { bsonType: "date" }, expiresAt: { bsonType: "date" } },
    indexes: [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
  },
};

let client;
try {
  // Inside the try: the driver checks the connection string here and throws on a malformed one.
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "tour_india");
  const existing = new Set((await db.listCollections().toArray()).map(({ name }) => name));
  for (const [name, { required, properties, indexes }] of Object.entries(collections)) {
    const validator = { $jsonSchema: { bsonType: "object", ...(required.length ? { required } : {}), properties } };
    if (existing.has(name)) await db.command({ collMod: name, validator });
    else await db.createCollection(name, { validator });
    for (const [keys, options] of indexes) await db.collection(name).createIndex(keys, options);
    console.log(`ready: ${name}`);
  }

  // One-off migration: contact messages from before tickets get a reference, category and priority.
  const tickets = db.collection("contact_messages");
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const part = () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  let migrated = 0;
  for await (const old of tickets.find({ reference: { $exists: false } }, { projection: { _id: 1, status: 1 } })) {
    await tickets.updateOne(
      { _id: old._id },
      { $set: { reference: `S-${part()}-${part()}`, category: "general", priority: "normal", notes: [], status: old.status === "read" ? "under_review" : old.status ?? "new" } },
    );
    migrated += 1;
  }
  if (migrated) console.log(`migrated: ${migrated} contact messages to tickets`);
} catch (error) {
  // Only the error's name is printed, never the connection string.
  console.error(`db-setup failed: ${error?.name ?? "Error"}${error?.codeName ? ` (${error.codeName})` : ""}`);
  if (!deploy) process.exitCode = 1;
} finally {
  await client?.close().catch(() => {});
}
