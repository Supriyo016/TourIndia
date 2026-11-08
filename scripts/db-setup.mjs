/**
 * Creates the MongoDB collections with schema validation and indexes.
 * Safe to run more than once. Usage: MONGODB_URI=... npm run db:setup
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI first.");
  process.exit(1);
}

const str = (maxLength) => ({ bsonType: "string", maxLength });

const collections = {
  contact_messages: {
    required: ["name", "email", "subject", "message", "status", "createdAt"],
    properties: { name: str(80), email: str(254), subject: str(120), message: str(3000), status: { enum: ["new", "read", "closed"] }, createdAt: { bsonType: "date" } },
    indexes: [[{ createdAt: -1 }, {}]],
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
};

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "tour_india");
  const existing = new Set((await db.listCollections().toArray()).map(({ name }) => name));
  for (const [name, { required, properties, indexes }] of Object.entries(collections)) {
    const validator = { $jsonSchema: { bsonType: "object", required, properties } };
    if (existing.has(name)) await db.command({ collMod: name, validator });
    else await db.createCollection(name, { validator });
    for (const [keys, options] of indexes) await db.collection(name).createIndex(keys, options);
    console.log(`ready: ${name}`);
  }
} finally {
  await client.close();
}
