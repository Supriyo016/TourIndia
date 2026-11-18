import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { VerifyChain } from "@/components/admin/VerifyChain";
import { requireAdminPage } from "@/features/admin/guard";
import { EXPORT_LIMIT, listLogs, parseLogQuery, recentActions, type LogQuery } from "@/features/monitoring/logs";

export const metadata: Metadata = { title: "Logs", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (value: Date) => value.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Kolkata" });
const OUTCOME_STYLE = { ok: "", denied: "font-semibold text-danger", failed: "font-semibold text-danger" } as const;

function queryString(query: LogQuery, extra: Record<string, string> = {}) {
  const entries = Object.entries({ kind: query.kind, action: query.action, actor: query.actor, outcome: query.outcome, from: query.from, to: query.to, ...extra }).filter((entry): entry is [string, string] => Boolean(entry[1]));
  return new URLSearchParams(entries).toString();
}

const brief = (value: unknown) => (value === undefined || value === null ? "" : JSON.stringify(value).slice(0, 160));

/** The log centre: the admin action log and the security log, filtered and paged, newest first. */
export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { session, access } = await requireAdminPage("logs.view");
  const query = parseLogQuery(await searchParams);
  const [result, actions] = await Promise.all([listLogs(query), recentActions(query.kind)]);
  const tabs = [
    { kind: "audit", label: "Admin actions" },
    { kind: "security", label: "Security events" },
  ] as const;

  return (
    <AdminShell permissions={access.permissions} current="/admin/logs" email={session.user.email}>
      <h1>Logs</h1>
      <p className="mt-1 max-w-prose text-ink-2">
        Every admin action and security event, as it was written. The app can only add to these logs; each record carries a fingerprint of the one before it, so a change made directly in the database shows up when you verify the chain.
      </p>

      <nav aria-label="Log" className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link key={tab.kind} prefetch={false} href={`/admin/logs?kind=${tab.kind}`} aria-current={query.kind === tab.kind ? "page" : undefined} className={`chip ${query.kind === tab.kind ? "font-semibold text-accent-ink" : ""}`}>
            {tab.label}
          </Link>
        ))}
      </nav>

      <form className="mt-5 flex flex-wrap items-end gap-3" aria-label="Filter the log">
        <input type="hidden" name="kind" value={query.kind} />
        <div className="grid gap-1.5">
          <label htmlFor="log-action" className="text-sm font-semibold">
            Action
          </label>
          <input id="log-action" name="action" list="log-actions" defaultValue={query.action ?? ""} placeholder="user. or ticket.update" className="input w-56 max-w-full" />
          <datalist id="log-actions">
            {actions.map((action) => (
              <option key={action} value={action} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="log-actor" className="text-sm font-semibold">
            Who
          </label>
          <input id="log-actor" name="actor" defaultValue={query.actor ?? ""} placeholder="Email or user id" className="input w-60 max-w-full" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="log-outcome" className="text-sm font-semibold">
            Outcome
          </label>
          <select id="log-outcome" name="outcome" defaultValue={query.outcome ?? ""} className="input">
            <option value="">Any</option>
            <option value="ok">Done</option>
            <option value="denied">Denied</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="log-from" className="text-sm font-semibold">
            From
          </label>
          <input id="log-from" type="date" name="from" defaultValue={query.from ?? ""} className="input" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="log-to" className="text-sm font-semibold">
            To
          </label>
          <input id="log-to" type="date" name="to" defaultValue={query.to ?? ""} className="input" />
        </div>
        <button className="btn btn-primary">Show</button>
        <Link prefetch={false} href={`/admin/logs?kind=${query.kind}`} className="link-text min-h-11 content-center text-sm">
          Clear
        </Link>
      </form>

      {!result ? (
        <p className="mt-6 text-ink-2">The database isn&apos;t connected, so there are no logs to show.</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-2" role="status">
              {result.total} {result.total === 1 ? "record" : "records"}. Times and dates are India time (IST).
            </p>
            <a href={`/api/admin/logs?${queryString(query)}`} className="btn btn-outline" download>
              <Download className="size-4" aria-hidden /> Export CSV{result.total > EXPORT_LIMIT ? ` (latest ${EXPORT_LIMIT})` : ""}
            </a>
          </div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="text-ink-2">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">When</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Action</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Outcome</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Who</th>
                  <th scope="col" className="py-2 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row._id} className="border-t border-line align-top">
                    <td className="py-2.5 pr-4 text-ink-2">{row.seq}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">{when(row.at)}</td>
                    <td className="py-2.5 pr-4">
                      <code>{row.action}</code>
                      {row.target && <span className="block text-xs break-all text-ink-2">{row.target}</span>}
                    </td>
                    <td className={`py-2.5 pr-4 ${OUTCOME_STYLE[row.outcome] ?? ""}`}>{row.outcome === "ok" ? "Done" : row.outcome === "denied" ? "Denied" : "Failed"}</td>
                    <td className="py-2.5 pr-4 break-all">{row.actorEmail ?? (row.actorId ? <code className="text-xs">{row.actorId}</code> : <span className="text-ink-2">System</span>)}</td>
                    <td className="py-2.5 text-ink-2">
                      {row.detail}
                      {(row.before !== undefined || row.after !== undefined) && (
                        <span className="block text-xs break-all">
                          {brief(row.before) || "–"} → {brief(row.after) || "–"}
                        </span>
                      )}
                      {row.country && <span className="block text-xs">From {row.country}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.rows.length === 0 && <p className="mt-4 text-ink-2">Nothing matches these filters.</p>}
          </div>
          {result.pages > 1 && (
            <nav aria-label="Pages" className="mt-4 flex items-center gap-3 text-sm">
              {result.page > 1 && (
                <Link prefetch={false} href={`/admin/logs?${queryString(query, { page: String(result.page - 1) })}`} className="chip">
                  Previous
                </Link>
              )}
              <span>
                Page {result.page} of {result.pages}
              </span>
              {result.page < result.pages && (
                <Link prefetch={false} href={`/admin/logs?${queryString(query, { page: String(result.page + 1) })}`} className="chip">
                  Next
                </Link>
              )}
            </nav>
          )}
        </>
      )}

      <section aria-labelledby="chain-title" className="card mt-8 p-5">
        <h2 id="chain-title" className="text-xl">
          Check for tampering
        </h2>
        <p className="mt-1 mb-4 max-w-prose text-sm text-ink-2">
          Recalculates the fingerprints of the latest 5,000 {query.kind === "audit" ? "admin actions" : "security events"}. An edited record or a removed one in the middle shows up here. Removing the very newest records can&apos;t be detected this way, so compare the latest number with an earlier CSV export if you need certainty. Each check is itself logged.
        </p>
        <VerifyChain kind={query.kind} />
      </section>
    </AdminShell>
  );
}
