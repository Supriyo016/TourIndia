import "server-only";
import { authSecret, type UserDoc } from "@/lib/auth/session";
import { decryptSecret, encryptSecret, hashRecoveryCode, newRecoveryCodes, newTotpSecret, otpauthUri, verifyTotp } from "@/lib/auth/totp";
import { getStore, STORE_COLLECTIONS } from "@/lib/database/store";
import type { AdminMemberDoc } from "./rbac";

/**
 * Authenticator-app MFA for every admin, on top of the emailed sign-in code.
 * Enrolment: start → scan or type the key → confirm with a code → save the recovery codes.
 */

export type MfaState = "none" | "pending" | "enabled";

async function members() {
  const store = await getStore();
  if (!store) throw new Error("store unavailable");
  return store.collection<AdminMemberDoc>(STORE_COLLECTIONS.adminMembers);
}

export async function mfaState(userId: string): Promise<MfaState> {
  const member = await (await members()).findOne({ _id: userId });
  if (!member?.mfa) return "none";
  return member.mfa.enabledAt ? "enabled" : "pending";
}

/** Creates (or replaces an unconfirmed) secret. Refuses if MFA is already on. */
export async function startEnrolment(user: Pick<UserDoc, "_id" | "email">): Promise<{ secret: string; uri: string } | "already-enabled"> {
  const collection = await members();
  const member = await collection.findOne({ _id: user._id });
  if (member?.mfa?.enabledAt) return "already-enabled";
  const secret = newTotpSecret();
  await collection.updateOne(
    { _id: user._id },
    {
      $set: { mfa: { secret: encryptSecret(secret, authSecret()), lastStep: -1, recovery: [] }, updatedAt: new Date() },
      $setOnInsert: { email: user.email.toLowerCase(), roles: [], createdAt: new Date() },
    },
    { upsert: true },
  );
  return { secret, uri: otpauthUri(secret, user.email) };
}

/** Confirms enrolment with a first code; returns the recovery codes to show once. */
export async function confirmEnrolment(userId: string, code: string): Promise<string[] | "invalid" | "no-enrolment"> {
  const collection = await members();
  const member = await collection.findOne({ _id: userId });
  if (!member?.mfa || member.mfa.enabledAt) return "no-enrolment";
  const secret = decryptSecret(member.mfa.secret, authSecret());
  const step = secret ? verifyTotp(secret, code.trim()) : null;
  if (step === null) return "invalid";
  const codes = newRecoveryCodes();
  await collection.updateOne(
    { _id: userId },
    { $set: { mfa: { ...member.mfa, enabledAt: new Date(), lastStep: step, recovery: codes.map((c) => hashRecoveryCode(c, authSecret())) }, updatedAt: new Date() } },
  );
  return codes;
}

/** Checks an authenticator code or a recovery code (which is then used up). */
export async function verifyMfa(userId: string, input: string): Promise<"totp" | "recovery" | "invalid"> {
  const collection = await members();
  const member = await collection.findOne({ _id: userId });
  if (!member?.mfa?.enabledAt) return "invalid";
  const value = input.trim();
  if (/^\d{6}$/.test(value)) {
    const secret = decryptSecret(member.mfa.secret, authSecret());
    const step = secret ? verifyTotp(secret, value, Date.now(), member.mfa.lastStep) : null;
    if (step === null) return "invalid";
    await collection.updateOne({ _id: userId }, { $set: { mfa: { ...member.mfa, lastStep: step } } });
    return "totp";
  }
  const hash = hashRecoveryCode(value, authSecret());
  if (!member.mfa.recovery.includes(hash)) return "invalid";
  await collection.updateOne({ _id: userId }, { $set: { mfa: { ...member.mfa, recovery: member.mfa.recovery.filter((h) => h !== hash) } } });
  return "recovery";
}

export async function recoveryCodesLeft(userId: string): Promise<number> {
  const member = await (await members()).findOne({ _id: userId });
  return member?.mfa?.recovery.length ?? 0;
}

export async function regenerateRecoveryCodes(userId: string): Promise<string[] | "no-mfa"> {
  const collection = await members();
  const member = await collection.findOne({ _id: userId });
  if (!member?.mfa?.enabledAt) return "no-mfa";
  const codes = newRecoveryCodes();
  await collection.updateOne({ _id: userId }, { $set: { mfa: { ...member.mfa, recovery: codes.map((c) => hashRecoveryCode(c, authSecret())) }, updatedAt: new Date() } });
  return codes;
}
