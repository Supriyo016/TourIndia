/**
 * Cookie consent, shared by the browser and the consent API. The cookie holds only
 * a policy version, a yes/no for optional storage, a yes/no for analytics, and the time
 * of the choice. It is readable by scripts on purpose, so static pages can respect it.
 *
 * Version 2 added analytics: `2.<preferences>.<analytics>.<time>`. Choices made under
 * version 1 (`1.<preferences>.<time>`) still count, with analytics off until the visitor
 * turns it on in Cookie settings.
 */
export const CONSENT_COOKIE = "ti_consent";
export const CONSENT_VERSION = 2;
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

/** Browser storage that is only used with consent. */
export const PREFERENCE_STORAGE_KEYS = ["ti-theme", "ti-recent", "ti-yatri"] as const;

export interface Consent {
  version: number;
  preferences: boolean;
  analytics: boolean;
  decidedAt: number;
}

export function encodeConsent(preferences: boolean, analytics = false, decidedAt = Math.floor(Date.now() / 1000)): string {
  return `${CONSENT_VERSION}.${preferences ? 1 : 0}.${analytics ? 1 : 0}.${decidedAt}`;
}

export function parseConsent(value: string | undefined | null): Consent | null {
  const current = /^2\.([01])\.([01])\.(\d{1,12})$/.exec(value ?? "");
  if (current) return { version: 2, preferences: current[1] === "1", analytics: current[2] === "1", decidedAt: Number(current[3]) };
  const older = /^1\.([01])\.(\d{1,12})$/.exec(value ?? "");
  if (older) return { version: 1, preferences: older[1] === "1", analytics: false, decidedAt: Number(older[2]) };
  return null;
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function readConsentValue(): string | null {
  if (typeof document === "undefined") return null;
  return readCookie(CONSENT_COOKIE) ?? null;
}

export function readConsent(): Consent | null {
  return parseConsent(readConsentValue());
}

export function hasPreferenceConsent(): boolean {
  return readConsent()?.preferences === true;
}

/** True only when the visitor has turned analytics on. Nothing is measured otherwise. */
export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === true;
}

const listeners = new Set<() => void>();

export function subscribeToConsent(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const OPEN_COOKIE_SETTINGS = "ti:cookie-settings";

/** Records the choice through the server, which sets the secure cookie attributes. */
export async function saveConsent(preferences: boolean, analytics = false): Promise<void> {
  try {
    const response = await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences, analytics }),
    });
    if (!response.ok) throw new Error("rejected");
  } catch {
    // The visitor's choice must still take effect if the server can't be reached.
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_COOKIE}=${encodeConsent(preferences, analytics)}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  }
  if (!preferences) {
    try {
      PREFERENCE_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // Nothing to clear if storage is unavailable.
    }
  }
  listeners.forEach((listener) => listener());
}
