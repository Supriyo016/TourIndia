import "server-only";
import { randomUUID } from "node:crypto";
import { getStore, STORE_COLLECTIONS } from "@/lib/database/store";
import { adminEmails, type UserDoc } from "./session";

/** Finds the account for an address, creating it on first sign-in. Returns null for blocked accounts. */
export async function signInUser(email: string, extra: { name?: string; googleSub?: string } = {}): Promise<UserDoc | null> {
  const store = await getStore();
  if (!store) throw new Error("store unavailable");
  const users = store.collection<UserDoc>(STORE_COLLECTIONS.users);
  const now = new Date();
  const set: Record<string, unknown> = { lastLoginAt: now, role: adminEmails().has(email) ? "admin" : "user" };
  if (extra.googleSub) set.googleSub = extra.googleSub;
  const update = {
    $set: set,
    $setOnInsert: {
      _id: randomUUID(),
      name: extra.name ?? "",
      status: "active",
      interests: [],
      marketingConsent: false,
      profileComplete: false,
      createdAt: now,
    },
  };
  let user: UserDoc | null;
  try {
    user = await users.findOneAndUpdate({ email }, update, { upsert: true, returnDocument: "after" });
  } catch (error) {
    // Two first sign-ins at once: the unique index rejects one, which then finds the other's account.
    if ((error as { code?: number }).code !== 11000) throw error;
    user = await users.findOneAndUpdate({ email }, { $set: set }, { returnDocument: "after" });
  }
  return user && user.status === "active" ? user : null;
}
