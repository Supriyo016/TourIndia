import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { site } from "@/config/site";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";

export type Role = "user" | "admin";

export interface UserDoc extends Doc {
  email: string;
  name: string;
  role: Role;
  status: "active" | "blocked";
  homeState?: string;
  country?: string;
  interests: string[];
  travelStyle?: string;
  language?: string;
  marketingConsent: boolean;
  profileComplete: boolean;
  googleSub?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface SessionDoc extends Doc {
  userId: string;
  role: Role;
  createdAt: Date;
  expiresAt: Date;
  /** A random id the user may see (the _id is the token's hash and stays server-side). */
  publicId?: string;
  /** Browser family and OS, e.g. "Chrome on Android". Never the full user-agent string. */
  device?: string;
  /** Country code from the edge; no IP address is stored. */
  country?: string;
  lastSeenAt?: Date;
  /** Admin sessions: when the authenticator code was last checked in this session. */
  mfaAt?: Date;
}

export interface SessionMeta {
  device?: string;
  country?: string;
}

/** "Chrome on Android" from a user-agent header, without keeping the header itself. */
export function deviceLabel(userAgent: string | null | undefined): string {
  const ua = userAgent ?? "";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /SamsungBrowser/.test(ua) ? "Samsung Internet" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS X|Macintosh/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "another system";
  return `${browser} on ${os}`;
}

export const metaFrom = (request: NextRequest): SessionMeta => ({
  device: deviceLabel(request.headers.get("user-agent")),
  country: request.headers.get("x-vercel-ip-country")?.slice(0, 2) || undefined,
});

/** What the browser may see about the signed-in person. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  homeState?: string;
  country?: string;
  interests: string[];
  travelStyle?: string;
  language?: string;
  marketingConsent: boolean;
  profileComplete: boolean;
  google: boolean;
}

export const toPublicUser = (user: UserDoc): PublicUser => ({
  id: user._id,
  email: user.email,
  name: user.name,
  role: user.role,
  homeState: user.homeState,
  country: user.country,
  interests: user.interests ?? [],
  travelStyle: user.travelStyle,
  language: user.language,
  marketingConsent: Boolean(user.marketingConsent),
  profileComplete: Boolean(user.profileComplete),
  google: Boolean(user.googleSub),
});

const USER_DAYS = 30;
const ADMIN_HOURS = 8;
const COOKIE_HOST = "__Host-ti_auth";
const COOKIE_DEV = "ti_auth";

/** Signs OTP hashes and OAuth state. Production refuses to run without a real secret. */
export function authSecret(): string {
  const secret = process.env.AUTH_SECRET ?? "";
  if (secret.length >= 32) return secret;
  return process.env.NODE_ENV === "production" ? "" : "tour-india-dev-auth-secret-not-for-production";
}

export const isAuthConfigured = () => authSecret().length >= 32;

export const hmac = (value: string) => createHmac("sha256", authSecret()).update(value).digest("hex");

/** Session tokens are stored only as hashes, so a database leak doesn't expose live sessions. */
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function adminEmails(): Set<string> {
  return new Set((process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export async function createSession(userId: string, role: Role, meta: SessionMeta = {}): Promise<{ token: string; maxAge: number }> {
  const store = await getStore();
  if (!store) throw new Error("store unavailable");
  const token = randomBytes(32).toString("base64url");
  const maxAge = role === "admin" ? ADMIN_HOURS * 3600 : USER_DAYS * 86400;
  const now = new Date();
  await store.collection<SessionDoc>(STORE_COLLECTIONS.sessions).insertOne({
    _id: hashToken(token),
    userId,
    role,
    createdAt: now,
    expiresAt: new Date(now.getTime() + maxAge * 1000),
    publicId: randomBytes(9).toString("base64url"),
    lastSeenAt: now,
    ...meta,
  });
  return { token, maxAge };
}

// Behind a proxy the request may look like plain HTTP; production always serves the public HTTPS address.
const isHttps = (request: NextRequest) => (process.env.NODE_ENV === "production" ? site.url.startsWith("https:") : request.nextUrl.protocol === "https:");

export function setSessionCookie(response: NextResponse, request: NextRequest, session: { token: string; maxAge: number }) {
  // Lax, not Strict, so the cookie survives the redirect back from Google sign-in.
  response.cookies.set(isHttps(request) ? COOKIE_HOST : COOKIE_DEV, session.token, {
    httpOnly: true,
    secure: isHttps(request),
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
}

export function clearSessionCookie(response: NextResponse, request: NextRequest) {
  response.cookies.set(isHttps(request) ? COOKIE_HOST : COOKIE_DEV, "", { httpOnly: true, secure: isHttps(request), sameSite: "lax", path: "/", maxAge: 0 });
}

export interface ResolvedSession {
  user: UserDoc;
  role: Role;
  sessionId: string;
  publicId?: string;
  /** Admin sessions: when MFA was last completed, if ever. */
  mfaAt?: Date;
}

/** Admin rights need the address on the bootstrap list or an admin_members record with roles. */
async function stillAdmin(user: UserDoc): Promise<boolean> {
  if (adminEmails().has(user.email)) return true;
  const store = await getStore();
  const member = store ? await store.collection<Doc & { roles?: string[] }>(STORE_COLLECTIONS.adminMembers).findOne({ _id: user._id }) : null;
  return Boolean(member?.roles?.length);
}

const SEEN_EVERY_MS = 10 * 60_000;

async function resolve(token: string | undefined): Promise<ResolvedSession | null> {
  if (!token || token.length > 100) return null;
  const store = await getStore();
  if (!store) return null;
  const sessionId = hashToken(token);
  const sessions = store.collection<SessionDoc>(STORE_COLLECTIONS.sessions);
  const session = await sessions.findOne({ _id: sessionId });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  const user = await store.collection<UserDoc>(STORE_COLLECTIONS.users).findOne({ _id: session.userId });
  if (!user || user.status !== "active") return null;
  const role: Role = session.role === "admin" && (await stillAdmin(user)) ? "admin" : "user";
  // "Last active" for the session list, written at most every ten minutes.
  if (!session.lastSeenAt || Date.now() - session.lastSeenAt.getTime() > SEEN_EVERY_MS) {
    await sessions.updateOne({ _id: sessionId }, { $set: { lastSeenAt: new Date() } }).catch(() => undefined);
  }
  return { user, role, sessionId, publicId: session.publicId, mfaAt: session.mfaAt };
}

/** Records that this session has just passed the authenticator check. */
export async function markSessionMfa(sessionId: string): Promise<void> {
  const store = await getStore();
  if (store) await store.collection<SessionDoc>(STORE_COLLECTIONS.sessions).updateOne({ _id: sessionId }, { $set: { mfaAt: new Date() } });
}

// Production reads only the __Host- cookie, which a subdomain can't set.
const tokenFrom = (read: (name: string) => string | undefined) => (process.env.NODE_ENV === "production" ? read(COOKIE_HOST) : (read(COOKIE_HOST) ?? read(COOKIE_DEV)));

/** For route handlers. */
export function sessionFromRequest(request: NextRequest) {
  return resolve(tokenFrom((name) => request.cookies.get(name)?.value));
}

/** For server components, such as the admin pages. */
export async function currentSession() {
  const jar = await cookies();
  return resolve(tokenFrom((name) => jar.get(name)?.value));
}

export async function endSession(request: NextRequest) {
  const session = await sessionFromRequest(request);
  const store = await getStore();
  if (session && store) await store.collection(STORE_COLLECTIONS.sessions).deleteOne({ _id: session.sessionId });
}

export async function endAllSessions(userId: string) {
  const store = await getStore();
  if (store) await store.collection(STORE_COLLECTIONS.sessions).deleteMany({ userId });
}
