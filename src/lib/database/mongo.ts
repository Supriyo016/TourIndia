import "server-only";
import { MongoClient, type Db } from "mongodb";

declare global {
  var __tourIndiaMongo: Promise<MongoClient> | undefined;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

/** One shared connection per server instance. Credentials stay in server-only code. */
export async function getDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  globalThis.__tourIndiaMongo ??= new MongoClient(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    appName: "tour-india",
  })
    .connect()
    .catch((error) => {
      globalThis.__tourIndiaMongo = undefined;
      throw error;
    });
  const client = await globalThis.__tourIndiaMongo;
  return client.db(process.env.MONGODB_DB ?? "tour_india");
}

export const COLLECTIONS = {
  contact: "contact_messages",
  newsletter: "newsletter_subscribers",
  stories: "story_submissions",
  rateLimits: "rate_limits",
} as const;
