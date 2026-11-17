import { describe, expect, it } from "vitest";
import { base32Decode, base32Encode, decryptSecret, encryptSecret, hashRecoveryCode, newRecoveryCodes, newTotpSecret, otpauthUri, totpAt, verifyTotp } from "@/lib/auth/totp";

// RFC 6238 appendix B uses the ASCII secret "12345678901234567890" with SHA-1.
const RFC_SECRET = base32Encode(Buffer.from("12345678901234567890"));

describe("TOTP", () => {
  it("matches the RFC 6238 test vectors (last six digits)", () => {
    expect(totpAt(RFC_SECRET, Math.floor(59 / 30))).toBe("287082");
    expect(totpAt(RFC_SECRET, Math.floor(1111111109 / 30))).toBe("081804");
    expect(totpAt(RFC_SECRET, Math.floor(1234567890 / 30))).toBe("005924");
    expect(totpAt(RFC_SECRET, Math.floor(2000000000 / 30))).toBe("279037");
  });

  it("round-trips base32 and makes 32-character secrets", () => {
    const bytes = Buffer.from([0, 1, 2, 250, 255, 128, 64]);
    expect(base32Decode(base32Encode(bytes))).toEqual(bytes);
    expect(newTotpSecret()).toMatch(/^[A-Z2-7]{32}$/);
  });

  it("accepts the current code and one step of drift, and never the same step twice", () => {
    const secret = newTotpSecret();
    const now = 1_800_000_000_000;
    const step = Math.floor(now / 30_000);
    expect(verifyTotp(secret, totpAt(secret, step), now)).toBe(step);
    expect(verifyTotp(secret, totpAt(secret, step - 1), now)).toBe(step - 1);
    expect(verifyTotp(secret, totpAt(secret, step - 2), now)).toBeNull();
    expect(verifyTotp(secret, totpAt(secret, step), now, step)).toBeNull();
    expect(verifyTotp(secret, "12345", now)).toBeNull();
    expect(verifyTotp(secret, "abcdef", now)).toBeNull();
  });

  it("encrypts secrets so they can only be read with the same AUTH_SECRET", () => {
    const sealed = encryptSecret("JBSWY3DPEHPK3PXP", "a".repeat(40));
    expect(sealed).not.toContain("JBSWY3DPEHPK3PXP");
    expect(decryptSecret(sealed, "a".repeat(40))).toBe("JBSWY3DPEHPK3PXP");
    expect(decryptSecret(sealed, "b".repeat(40))).toBeNull();
    expect(decryptSecret("garbage", "a".repeat(40))).toBeNull();
  });

  it("makes ten distinct recovery codes and hashes them case-insensitively", () => {
    const codes = newRecoveryCodes();
    expect(new Set(codes).size).toBe(10);
    for (const code of codes) expect(code).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}$/);
    expect(hashRecoveryCode(` ${codes[0]!.toUpperCase()} `, "s".repeat(40))).toBe(hashRecoveryCode(codes[0]!, "s".repeat(40)));
  });

  it("builds an otpauth link authenticator apps accept", () => {
    expect(otpauthUri("JBSWY3DPEHPK3PXP", "owner@example.com")).toBe(
      "otpauth://totp/Tour%20India%3Aowner%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Tour%20India&algorithm=SHA1&digits=6&period=30",
    );
  });
});
