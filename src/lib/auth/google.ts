import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { hmac } from "./session";

/**
 * "Continue with Google" using the OAuth 2.0 authorization code flow with PKCE.
 * State, nonce and the PKCE verifier travel in one short-lived, signed, HttpOnly cookie.
 * The ID token comes straight from Google's token endpoint over TLS, so its claims are
 * checked (issuer, audience, expiry, nonce, verified email) without fetching signing keys,
 * as OpenID Connect Core 3.1.3.7 allows for this flow.
 */
export const isGoogleConfigured = () => Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
export const GOOGLE_STATE_COOKIE = "ti_google";
const STATE_SECONDS = 600;

const base64url = (buffer: Buffer) => buffer.toString("base64url");

export function redirectUri(origin: string) {
  return `${origin}/api/auth/google/callback`;
}

export function startGoogleSignIn(origin: string, returnTo: string) {
  const state = base64url(randomBytes(24));
  const nonce = base64url(randomBytes(24));
  const verifier = base64url(randomBytes(48));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const expires = Math.floor(Date.now() / 1000) + STATE_SECONDS;
  const payload = [state, nonce, verifier, expires, encodeURIComponent(returnTo)].join(".");
  const cookie = `${payload}.${hmac(`google:${payload}`)}`;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.AUTH_GOOGLE_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return { url: url.toString(), cookie, maxAge: STATE_SECONDS };
}

export function readStateCookie(value: string | undefined, state: string | null) {
  if (!value || !state) return null;
  const parts = value.split(".");
  if (parts.length !== 6) return null;
  const signature = parts.pop()!;
  const payload = parts.join(".");
  const expected = Buffer.from(hmac(`google:${payload}`));
  if (expected.length !== Buffer.byteLength(signature) || !timingSafeEqual(expected, Buffer.from(signature))) return null;
  const [savedState, nonce, verifier, expires, returnTo] = parts as [string, string, string, string, string];
  if (Number(expires) * 1000 < Date.now()) return null;
  const a = Buffer.from(savedState);
  const b = Buffer.from(state);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return { nonce, verifier, returnTo: safeReturnPath(decodeURIComponent(returnTo)) };
}

/** Only same-site paths, so sign-in can't be used to redirect people elsewhere. */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value.slice(0, 200);
}

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
}

export function checkIdTokenClaims(idToken: string, nonce: string, now = Date.now()): GoogleProfile | null {
  const part = idToken.split(".")[1];
  if (!part) return null;
  let claims: Record<string, unknown>;
  try {
    claims = JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  const audienceOk = claims.aud === process.env.AUTH_GOOGLE_ID;
  const fresh = typeof claims.exp === "number" && claims.exp * 1000 > now;
  const verified = claims.email_verified === true;
  if (!issuerOk || !audienceOk || !fresh || claims.nonce !== nonce || !verified) return null;
  if (typeof claims.sub !== "string" || typeof claims.email !== "string") return null;
  return { sub: claims.sub, email: claims.email.toLowerCase(), name: typeof claims.name === "string" ? claims.name.slice(0, 80) : "" };
}

export async function exchangeCode(code: string, verifier: string, origin: string): Promise<string | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        redirect_uri: redirectUri(origin),
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { id_token?: unknown };
    return typeof body.id_token === "string" ? body.id_token : null;
  } catch {
    return null;
  }
}
