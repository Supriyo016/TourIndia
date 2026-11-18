import "server-only";
import type { UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";
import { audit } from "@/lib/security/audit";
import { DEFAULT_MAINTENANCE_MESSAGE, FLAGS, type Flag } from "./flags";

/**
 * Site settings in one document (`site_settings`, _id "site"): feature flags and maintenance mode.
 * Read on the server through a short cache, so checking a flag costs nothing on most requests.
 * Static pages never read these; only route handlers and the proxy do.
 */

export interface SettingsDoc extends Doc {
  flags: Partial<Record<Flag, boolean>>;
  maintenance: { on: boolean; message: string; since?: Date; by?: string };
  updatedAt?: Date;
  updatedBy?: string;
}

export interface SiteSettings {
  flags: Record<Flag, boolean>;
  maintenance: { on: boolean; message: string; since?: Date };
}

const CACHE_MS = 30_000;
const DEFAULTS: SiteSettings = { flags: Object.fromEntries(Object.keys(FLAGS).map((flag) => [flag, true])) as Record<Flag, boolean>, maintenance: { on: false, message: DEFAULT_MAINTENANCE_MESSAGE } };

declare global {
  var __tourIndiaSettings: { value: SiteSettings; at: number } | undefined;
}

const withDefaults = (doc: SettingsDoc | null): SiteSettings => ({
  flags: { ...DEFAULTS.flags, ...Object.fromEntries(Object.entries(doc?.flags ?? {}).filter(([flag, value]) => flag in FLAGS && typeof value === "boolean")) },
  maintenance: { on: doc?.maintenance?.on === true, message: doc?.maintenance?.message || DEFAULT_MAINTENANCE_MESSAGE, since: doc?.maintenance?.since },
});

/** The current settings. Falls back to the defaults (everything on, no maintenance) if the database is slow or missing. */
export async function getSettings(options: { fresh?: boolean; timeoutMs?: number } = {}): Promise<SiteSettings> {
  const cached = globalThis.__tourIndiaSettings;
  if (!options.fresh && cached && Date.now() - cached.at < CACHE_MS) return cached.value;
  try {
    const read = (async () => {
      const db = await getStore();
      return withDefaults(db ? await db.collection<SettingsDoc>(STORE_COLLECTIONS.settings).findOne({ _id: "site" }) : null);
    })();
    const value = await Promise.race([read, new Promise<null>((resolve) => setTimeout(() => resolve(null), options.timeoutMs ?? 1500))]);
    if (!value) return cached?.value ?? DEFAULTS;
    globalThis.__tourIndiaSettings = { value, at: Date.now() };
    return value;
  } catch {
    return cached?.value ?? DEFAULTS;
  }
}

export const isEnabled = async (flag: Flag) => (await getSettings()).flags[flag];

/** Test helper and after-write refresh. */
export function clearSettingsCache() {
  globalThis.__tourIndiaSettings = undefined;
}

async function save(admin: UserDoc, action: string, set: Record<string, unknown>, before: unknown, after: unknown) {
  const db = await getStore();
  if (!db) throw new Error("unavailable");
  await db.collection<SettingsDoc>(STORE_COLLECTIONS.settings).updateOne(
    { _id: "site" },
    { $set: { ...set, updatedAt: new Date(), updatedBy: admin._id }, $setOnInsert: {} },
    { upsert: true },
  );
  clearSettingsCache();
  await audit({ actorId: admin._id, actorEmail: admin.email, action, target: "site_settings", before, after, outcome: "ok" }, db);
}

export async function updateFlags(admin: UserDoc, changes: Partial<Record<Flag, boolean>>) {
  const current = await getSettings({ fresh: true });
  const changed = Object.fromEntries(Object.entries(changes).filter(([flag, value]) => flag in FLAGS && current.flags[flag as Flag] !== value));
  if (!Object.keys(changed).length) return current.flags;
  const flags = { ...current.flags, ...changed };
  await save(admin, "settings.flags", { flags }, Object.fromEntries(Object.keys(changed).map((flag) => [flag, current.flags[flag as Flag]])), changed);
  return flags;
}

export async function setMaintenance(admin: UserDoc, on: boolean, message?: string) {
  const current = await getSettings({ fresh: true });
  const text = (message ?? "").trim().slice(0, 300) || DEFAULT_MAINTENANCE_MESSAGE;
  await save(admin, on ? "settings.maintenance.on" : "settings.maintenance.off", { maintenance: { on, message: text, ...(on ? { since: new Date(), by: admin._id } : {}) } }, { on: current.maintenance.on, message: current.maintenance.message }, { on, message: text });
}
