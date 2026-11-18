import "server-only";
import { getStore, STORE_COLLECTIONS, type Filter } from "@/lib/database/store";
import type { LogKind, LogRecord } from "@/lib/security/audit";

/**
 * Reading the admin and security logs for the log centre. Read-only: the logs are append-only and
 * nothing here changes them.
 */

export const LOG_PAGE_SIZE = 50;
export const EXPORT_LIMIT = 5000;
/** How many of the most recent records "verify the chain" checks. */
export const VERIFY_LIMIT = 5000;

export interface LogQuery {
  kind: LogKind;
  /** An action name or the start of one, such as "user." or "ticket.update". */
  action?: string;
  /** An email address (exact) or a user id. */
  actor?: string;
  outcome?: LogRecord["outcome"];
  /** Inclusive dates, "YYYY-MM-DD", as days in India time (IST). */
  from?: string;
  to?: string;
  page?: number;
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Cleans a raw query (from the address bar) into something safe to filter on. */
export function parseLogQuery(params: Record<string, string | undefined>): LogQuery {
  const kind: LogKind = params.kind === "security" ? "security" : "audit";
  const action = params.action?.trim().slice(0, 60).replace(/[^\w.:-]/g, "") || undefined;
  const actor = params.actor?.trim().toLowerCase().slice(0, 254) || undefined;
  const outcome = params.outcome === "ok" || params.outcome === "denied" || params.outcome === "failed" ? params.outcome : undefined;
  const from = params.from && DAY.test(params.from) ? params.from : undefined;
  const to = params.to && DAY.test(params.to) ? params.to : undefined;
  return { kind, action, actor, outcome, from, to, page: Math.max(1, Math.floor(Number(params.page) || 1)) };
}

export function logFilter(query: LogQuery): Filter {
  const filter: Filter = { seq: { $exists: true } };
  if (query.action) filter.action = { $regex: `^${escape(query.action)}` };
  if (query.actor) filter[UUID.test(query.actor) ? "actorId" : "actorEmail"] = query.actor;
  if (query.outcome) filter.outcome = query.outcome;
  const at: Record<string, Date> = {};
  if (query.from) at.$gte = new Date(`${query.from}T00:00:00.000+05:30`);
  if (query.to) at.$lte = new Date(`${query.to}T23:59:59.999+05:30`);
  if (Object.keys(at).length) filter.at = at;
  return filter;
}

const collectionFor = (kind: LogKind) => (kind === "audit" ? STORE_COLLECTIONS.audit : STORE_COLLECTIONS.securityEvents);

export async function listLogs(query: LogQuery): Promise<{ rows: LogRecord[]; total: number; page: number; pages: number } | null> {
  const store = await getStore();
  if (!store) return null;
  const logs = store.collection<LogRecord>(collectionFor(query.kind));
  const filter = logFilter(query);
  const total = await logs.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / LOG_PAGE_SIZE));
  const page = Math.min(query.page ?? 1, pages);
  const rows = await logs.find(filter, { sort: { seq: -1 }, skip: (page - 1) * LOG_PAGE_SIZE, limit: LOG_PAGE_SIZE }).toArray();
  return { rows, total, page, pages };
}

/** Distinct action names seen recently, for the filter's suggestions. */
export async function recentActions(kind: LogKind): Promise<string[]> {
  const store = await getStore();
  if (!store) return [];
  const rows = await store.collection<LogRecord>(collectionFor(kind)).find({ seq: { $exists: true } }, { sort: { seq: -1 }, limit: 1000 }).toArray();
  return [...new Set(rows.map((row) => row.action))].sort();
}

const short = (value: unknown) => (value === undefined || value === null ? "" : typeof value === "string" ? value : JSON.stringify(value));

/** Spreadsheet apps run cells that start with these as formulas, so they're prefixed with a quote. */
export function csvCell(value: unknown): string {
  let text = short(value).replace(/\r?\n/g, " ");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function exportLogs(query: LogQuery): Promise<{ csv: string; rows: number } | null> {
  const store = await getStore();
  if (!store) return null;
  const rows = await store.collection<LogRecord>(collectionFor(query.kind)).find(logFilter(query), { sort: { seq: -1 }, limit: EXPORT_LIMIT }).toArray();
  const header = ["seq", "at", "action", "outcome", "actorId", "actorEmail", "target", "detail", "before", "after", "country", "hash"];
  const lines = rows.map((row) => [row.seq, row.at instanceof Date ? row.at.toISOString() : row.at, row.action, row.outcome, row.actorId, row.actorEmail, row.target, row.detail, row.before, row.after, row.country, row.hash].map(csvCell).join(","));
  return { csv: `${[header.join(","), ...lines].join("\r\n")}\r\n`, rows: rows.length };
}
