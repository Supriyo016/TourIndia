import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Time-based one-time passwords (RFC 6238), the six-digit codes authenticator apps show.
 * Built on Node's crypto only. Secrets are stored encrypted (AES-256-GCM) with a key derived
 * from AUTH_SECRET, so a database leak alone doesn't reveal them.
 */

const STEP_SECONDS = 30;
const DIGITS = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string): Buffer {
  const clean = text.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    value = (value << 5) | ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export const newTotpSecret = () => base32Encode(randomBytes(20));

/** The code for one 30-second step. */
export function totpAt(secret: string, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = digest[digest.length - 1]! & 15;
  const binary = ((digest[offset]! & 127) << 24) | (digest[offset + 1]! << 16) | (digest[offset + 2]! << 8) | digest[offset + 3]!;
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP_SECONDS);

/**
 * Checks a code against the current step and one either side (clock drift). Returns the step
 * that matched so the caller can refuse to accept it twice, or null.
 */
export function verifyTotp(secret: string, code: string, now = Date.now(), lastUsedStep = -1): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const step = currentStep(now);
  for (const candidate of [step - 1, step, step + 1]) {
    if (candidate <= lastUsedStep) continue;
    const expected = Buffer.from(totpAt(secret, candidate));
    if (timingSafeEqual(expected, Buffer.from(code))) return candidate;
  }
  return null;
}

/** The link authenticator apps understand (tapping it on a phone opens the app). */
export function otpauthUri(secret: string, account: string, issuer = "Tour India"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

const keyFrom = (authSecret: string) => createHash("sha256").update(`tour-india:mfa:${authSecret}`).digest();

export function encryptSecret(secret: string, authSecret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(authSecret), iv);
  const data = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString("base64url")).join(".");
}

export function decryptSecret(sealed: string, authSecret: string): string | null {
  try {
    const [iv, tag, data] = sealed.split(".").map((part) => Buffer.from(part, "base64url"));
    if (!iv || !tag || !data) return null;
    const decipher = createDecipheriv("aes-256-gcm", keyFrom(authSecret), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Ten single-use recovery codes like "k7q2-9xmd". Only their hashes are stored. */
export function newRecoveryCodes(count = 10): string[] {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: count }, () => {
    const bytes = randomBytes(8);
    const chars = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("");
    return `${chars.slice(0, 4)}-${chars.slice(4)}`;
  });
}

export const hashRecoveryCode = (code: string, authSecret: string) =>
  createHmac("sha256", authSecret).update(`recovery:${code.trim().toLowerCase()}`).digest("hex");
