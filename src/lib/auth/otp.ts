import "server-only";
import { randomInt, timingSafeEqual } from "node:crypto";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";
import { hmac } from "./session";

export type OtpPurpose = "login" | "admin";

interface OtpDoc extends Doc {
  codeHash: string;
  attempts: number;
  sentAt: Date;
  expiresAt: Date;
}

export const OTP_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
const RESEND_SECONDS = 60;

const key = (email: string, purpose: OtpPurpose) => `${purpose}:${hmac(`email:${email}`)}`;
const codeHash = (email: string, purpose: OtpPurpose, code: string) => hmac(`otp:${purpose}:${email}:${code}`);

/** Six digits from a cryptographic source, keeping leading zeros. */
export const generateCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

/**
 * Stores a new code, replacing any earlier one. Returns null if a code was sent
 * less than a minute ago, so the address can't be flooded.
 */
export async function issueCode(email: string, purpose: OtpPurpose, now = new Date()): Promise<string | null> {
  const store = await getStore();
  if (!store) throw new Error("store unavailable");
  const collection = store.collection<OtpDoc>(STORE_COLLECTIONS.otps);
  const existing = await collection.findOne({ _id: key(email, purpose) });
  if (existing && now.getTime() - existing.sentAt.getTime() < RESEND_SECONDS * 1000) return null;
  const code = generateCode();
  await collection.updateOne(
    { _id: key(email, purpose) },
    { $set: { codeHash: codeHash(email, purpose, code), attempts: 0, sentAt: now, expiresAt: new Date(now.getTime() + OTP_MINUTES * 60_000) } },
    { upsert: true },
  );
  return code;
}

export type VerifyResult = "ok" | "invalid" | "expired" | "locked";

/**
 * Counts the attempt before comparing, so parallel guesses can't exceed the limit.
 * A used, expired or locked code is deleted.
 */
export async function verifyCode(email: string, purpose: OtpPurpose, code: string, now = new Date()): Promise<VerifyResult> {
  const store = await getStore();
  if (!store) throw new Error("store unavailable");
  const collection = store.collection<OtpDoc>(STORE_COLLECTIONS.otps);
  const id = key(email, purpose);
  const doc = await collection.findOneAndUpdate({ _id: id }, { $inc: { attempts: 1 } }, { returnDocument: "after" });
  if (!doc) return "invalid";
  if (doc.expiresAt.getTime() <= now.getTime()) {
    await collection.deleteOne({ _id: id });
    return "expired";
  }
  if (doc.attempts > OTP_MAX_ATTEMPTS) {
    await collection.deleteOne({ _id: id });
    return "locked";
  }
  const expected = Buffer.from(doc.codeHash);
  const given = Buffer.from(codeHash(email, purpose, code));
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  await collection.deleteOne({ _id: id });
  return "ok";
}
