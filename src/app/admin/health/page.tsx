import type { Metadata } from "next";
import { Activity, Database, Gauge, Rocket } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/features/admin/guard";
import { checkDatabase, latestDeployments, thisBuild } from "@/features/monitoring/health";
import { METRIC_INFO, vitalsSummary } from "@/features/monitoring/vitals";
import { errorSummary } from "@/lib/monitoring/errors";

export const metadata: Metadata = { title: "Health", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (value: Date) => value.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
const percent = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "–");

function Panel({ id, title, Icon, children }: { id: string; title: string; Icon: typeof Gauge; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="card p-5">
      <h2 id={id} className="flex items-center gap-2 text-xl">
        <Icon className="size-5 text-accent-ink" aria-hidden /> {title}
      </h2>
      <div className="mt-3 text-sm">{children}</div>
    </section>
  );
}

/**
 * Read-only health: the database, recent server errors, the deployment and Core Web Vitals.
 * Vercel manages the servers, so there are no restart controls here.
 */
export default async function AdminHealthPage() {
  const { session, access } = await requireAdminPage("logs.view");
  const [database, errors, deployments, vitals] = await Promise.all([checkDatabase(), errorSummary().catch(() => null), latestDeployments(), vitalsSummary().catch(() => null)]);
  const build = thisBuild();

  return (
    <AdminShell permissions={access.permissions} current="/admin/health" email={session.user.email}>
      <h1>Health</h1>
      <p className="mt-1 max-w-prose text-ink-2">Checked when you open this page. Vercel runs and restarts the servers itself, so there&apos;s nothing to restart here; this is what can be measured.</p>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Panel id="db-title" title="Database" Icon={Database}>
          {database.mode === "memory" && <p>Running on the in-memory store (development). Nothing is kept after the server stops.</p>}
          {database.mode === "none" && <p className="font-semibold text-danger">Not connected: {database.problem}</p>}
          {database.mode === "mongodb" &&
            (database.ok ? (
              <p>
                <strong>Reachable.</strong> A ping took {database.latencyMs} ms from this server.
              </p>
            ) : (
              <p className="font-semibold text-danger">
                Not reachable ({database.problem}) after {database.latencyMs} ms.
              </p>
            ))}
        </Panel>

        <Panel id="errors-title" title="Server errors" Icon={Activity}>
          {!errors ? (
            <p className="text-ink-2">Error counts need the database.</p>
          ) : (
            <>
              <dl className="grid grid-cols-3 gap-3">
                {[
                  ["Last hour", errors.hour],
                  ["Last 24 hours", errors.day],
                  ["Last 7 days", errors.week],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[var(--radius-md)] bg-surface-2 p-3">
                    <dt className="text-xs text-ink-2">{label}</dt>
                    <dd className={`text-2xl font-semibold ${Number(value) > 0 ? "text-danger" : ""}`}>{value}</dd>
                  </div>
                ))}
              </dl>
              {errors.top.length > 0 ? (
                <table className="mt-4 w-full text-left">
                  <caption className="mb-1 text-left text-ink-2">Last 24 hours, by where they happened</caption>
                  <thead className="text-ink-2">
                    <tr>
                      <th scope="col" className="py-1 pr-3 font-semibold">Where</th>
                      <th scope="col" className="py-1 pr-3 font-semibold">Error</th>
                      <th scope="col" className="py-1 pr-3 font-semibold">Count</th>
                      <th scope="col" className="py-1 font-semibold">Latest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.top.map((row) => (
                      <tr key={`${row.source}-${row.name}`} className="border-t border-line">
                        <td className="py-1.5 pr-3">{row.source}</td>
                        <td className="py-1.5 pr-3 break-all">
                          <code>{row.name}</code>
                        </td>
                        <td className="py-1.5 pr-3">{row.count}</td>
                        <td className="py-1.5 whitespace-nowrap">{when(row.last)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="mt-3 text-ink-2">No server errors recorded in the last 24 hours.</p>
              )}
              <p className="mt-3 text-xs text-ink-2">Counted from the day this page shipped. Only where it happened and the kind of error are kept, never the message or who was affected, for 30 days. Full logs are in Vercel.</p>
            </>
          )}
        </Panel>

        <Panel id="deploy-title" title="Deployment" Icon={Rocket}>
          <p>
            This server: <strong>{build.environment}</strong>
            {build.commit && (
              <>
                , commit <code>{build.commit}</code>
              </>
            )}
            {build.branch && <> on {build.branch}</>}
            {build.region && <>, region {build.region}</>}.
          </p>
          {!deployments.configured && (
            <div className="mt-3 text-ink-2">
              <p>To list recent deployments here, add two environment variables in Vercel (Project → Settings → Environment Variables, Production only), then redeploy:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>
                  <code>VERCEL_API_TOKEN</code>: a token from Vercel → Account Settings → Tokens, scoped to this project&apos;s team, with the shortest expiry you&apos;re happy to renew.
                </li>
                <li>
                  <code>VERCEL_PROJECT_ID</code>: from Project → Settings → General (and <code>VERCEL_TEAM_ID</code> if the project belongs to a team).
                </li>
              </ul>
            </div>
          )}
          {deployments.configured && !deployments.ok && <p className="mt-3 font-semibold text-danger">{deployments.problem}</p>}
          {deployments.configured && deployments.ok && (
            <ul className="mt-3 grid gap-2">
              {deployments.deployments.length === 0 && <li className="text-ink-2">Vercel returned no deployments.</li>}
              {deployments.deployments.map((d) => (
                <li key={d.id} className="border-t border-line pt-2">
                  <strong className={d.state === "ERROR" ? "text-danger" : ""}>{d.state.toLowerCase()}</strong> {d.target ? `(${d.target})` : "(preview)"} · {when(d.createdAt)}
                  {d.commit && (
                    <span className="block text-ink-2">
                      <code>{d.commit}</code> {d.message}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel id="vitals-title" title="Core Web Vitals" Icon={Gauge}>
          {!vitals || vitals.metrics.length === 0 ? (
            <p className="text-ink-2">
              No measurements yet. They come from visitors who allow analytics, once the analytics beacon is live, and are shown here only as recorded. Nothing is estimated.
            </p>
          ) : (
            <>
              <p className="text-ink-2">Real visits since {vitals.from}, from visitors who allow analytics.</p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[30rem] text-left">
                  <thead className="text-ink-2">
                    <tr>
                      <th scope="col" className="py-1 pr-3 font-semibold">Measure</th>
                      <th scope="col" className="py-1 pr-3 font-semibold">Visits</th>
                      <th scope="col" className="py-1 pr-3 font-semibold">Good</th>
                      <th scope="col" className="py-1 pr-3 font-semibold">Needs work</th>
                      <th scope="col" className="py-1 pr-3 font-semibold">Poor</th>
                      <th scope="col" className="py-1 font-semibold">75th percentile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitals.metrics.map((m) => (
                      <tr key={m.metric} className="border-t border-line">
                        <th scope="row" className="py-1.5 pr-3 font-normal">
                          <abbr title={METRIC_INFO[m.metric].name}>{m.metric}</abbr>
                        </th>
                        <td className="py-1.5 pr-3">{m.count}</td>
                        <td className="py-1.5 pr-3">{percent(m.good, m.count)}</td>
                        <td className="py-1.5 pr-3">{percent(m.needsImprovement, m.count)}</td>
                        <td className={`py-1.5 pr-3 ${m.poor / m.count > 0.1 ? "font-semibold text-danger" : ""}`}>{percent(m.poor, m.count)}</td>
                        <td className="py-1.5">{m.p75 === undefined ? "–" : `${m.metric === "CLS" ? m.p75.toFixed(2) : Math.round(m.p75)}${METRIC_INFO[m.metric].unit ? ` ${METRIC_INFO[m.metric].unit}` : ""} (${m.p75Day})`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}
