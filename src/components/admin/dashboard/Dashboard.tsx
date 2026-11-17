import Link from "next/link";
import type { ReactNode } from "react";
import type { DashboardData } from "@/features/admin/load";
import styles from "./dashboard.module.css";

const number = new Intl.NumberFormat("en-IN");
const n = (value: number) => number.format(value);
const when = (date: Date) => new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const day = (date: Date) => new Date(date).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });

function Card({ id, title, children, wide = false, action }: { id: string; title: string; children: ReactNode; wide?: boolean; action?: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className={`card p-4 ${wide ? styles.wide : ""}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={`${id}-title`} className="text-lg">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Stats({ items }: { items: [label: string, value: ReactNode][] }) {
  return (
    <dl className={styles.stats}>
      {items.map(([label, value]) => (
        <div key={label} className={styles.stat}>
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="font-display text-2xl">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Rows({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold text-muted uppercase">{label}</h3>
      <ul className={`mt-1 ${styles.rows}`}>{children}</ul>
    </div>
  );
}

function OnOff({ on }: { on: boolean }) {
  return <span className={`${styles.state} ${on ? styles.on : styles.off}`}>{on ? "On" : "Off"}</span>;
}

function Unavailable({ note }: { note: string }) {
  return <p className="text-sm text-muted">{note}</p>;
}

const KIND_LABEL = { edit: "Suggested edit", held: "Held comment", hidden: "Hidden comment" } as const;

export function Dashboard({ data }: { data: DashboardData }) {
  const { accounts, community, requests, yatri, integrations, content, site, storeNote } = data;
  const note = storeNote ?? "";
  const moderate = (
    <Link prefetch={false} href="/admin" className="link-text text-sm">
      Open moderation
    </Link>
  );

  return (
    <div className={styles.grid}>
      {storeNote ? (
        <p role="status" className={`card bg-surface-2 p-4 text-sm ${styles.wide}`}>
          {storeNote}
        </p>
      ) : null}

      <Card id="accounts" title="Accounts">
        {accounts ? (
          <Stats
            items={[
              ["Total", n(accounts.total)],
              ["New, 7 days", n(accounts.new7)],
              ["New, 30 days", n(accounts.new30)],
              ["Blocked", n(accounts.blocked)],
              ["With Google", n(accounts.google)],
            ]}
          />
        ) : (
          <Unavailable note={note} />
        )}
      </Card>

      <Card id="community" title="Community" action={moderate}>
        {community ? (
          <>
            <Stats
              items={[
                ["Comments", n(community.comments.total)],
                ["Held", n(community.comments.pending)],
                ["Hidden by reports", n(community.comments.hidden)],
                ["Reported, live", n(community.comments.reported)],
                ["Loves", n(community.loves)],
                ["Ratings", n(community.ratings.count)],
                ["Average rating", community.ratings.average === null ? "–" : `${community.ratings.average.toFixed(1)}/5`],
              ]}
            />
            <Rows label="Suggested edits">
              <li className={styles.row}>
                <span>Pending</span>
                <span>{n(community.edits.pending)}</span>
              </li>
              <li className={styles.row}>
                <span>Approved</span>
                <span>{n(community.edits.approved)}</span>
              </li>
              <li className={styles.row}>
                <span>Rejected</span>
                <span>{n(community.edits.rejected)}</span>
              </li>
            </Rows>
          </>
        ) : (
          <Unavailable note={note} />
        )}
      </Card>

      <Card id="action" title="Needs action" action={moderate}>
        {community ? (
          community.needsAction.length ? (
            <ul className={styles.rows}>
              {community.needsAction.map((item) => (
                <li key={`${item.kind}-${item.id}`} className={styles.row}>
                  <span className={styles.truncate}>
                    <Link prefetch={false} href={item.href} className="link-text font-semibold">
                      {KIND_LABEL[item.kind]}
                    </Link>{" "}
                    <span className="text-ink-2">{item.label}</span>
                    {item.detail ? <span className="block text-muted">{item.detail}</span> : null}
                  </span>
                  <span className="text-muted">{day(item.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nothing waiting.</p>
          )
        ) : (
          <Unavailable note={note} />
        )}
      </Card>

      <Card id="requests" title="Requests" wide>
        {requests ? (
          <>
            <Stats
              items={[
                ["Planning requests", n(requests.bookings.total)],
                ["Requests, 7 days", n(requests.bookings.last7)],
                ["Contact messages", n(requests.contact.total)],
                ["Unread messages", n(requests.contact.unread)],
                ["Messages, 7 days", n(requests.contact.last7)],
                ["Newsletter sign-ups", n(requests.newsletter)],
                ["Stories pending", n(requests.stories.pending)],
                ["Stories published", n(requests.stories.approved)],
              ]}
            />
            <Rows label="Latest planning requests">
              {requests.bookings.recent.length ? (
                requests.bookings.recent.map((row) => (
                  <li key={row.reference} className={styles.row}>
                    <span className={styles.truncate}>
                      <span className="font-mono font-semibold">{row.reference}</span> · {row.destination} · {row.firstName}
                    </span>
                    <span className="text-muted">
                      {day(row.createdAt)} · {row.status}
                    </span>
                  </li>
                ))
              ) : (
                <li className={`${styles.row} text-muted`}>No requests yet.</li>
              )}
            </Rows>
            {data.storage !== "mongodb" ? <p className="mt-3 text-xs text-muted">Contact, newsletter and story forms are saved only when MongoDB is connected.</p> : null}
          </>
        ) : (
          <Unavailable note={note} />
        )}
      </Card>

      <Card id="yatri" title="Yatri">
        <ul className={styles.rows}>
          <li className={styles.row}>
            <span>AI replies</span>
            <OnOff on={yatri.connected} />
          </li>
          <li className={styles.row}>
            <span>Provider</span>
            <span>{yatri.provider ?? "None (answers from the guides)"}</span>
          </li>
          <li className={styles.row}>
            <span>AI replies today (UTC)</span>
            <span>{yatri.repliesToday === null ? "Not tracked" : `${n(yatri.repliesToday)} of ${n(yatri.dailyLimit)}`}</span>
          </li>
          <li className={styles.row}>
            <span>Daily limit</span>
            <span>{n(yatri.dailyLimit)}</span>
          </li>
        </ul>
        {yatri.repliesToday === null ? <p className="mt-2 text-xs text-muted">Replies are counted only when MongoDB is connected.</p> : null}
      </Card>

      <Card id="integrations" title="Integrations">
        <ul className={styles.rows}>
          {integrations.map((item) => (
            <li key={item.id} className={styles.row} title={item.on ? undefined : `Set ${item.hint}`}>
              <span>{item.label}</span>
              <OnOff on={item.on} />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">Shows only whether each setting is present.{data.storage === "memory" ? " Data is in development memory and resets on restart." : ""}</p>
      </Card>

      <Card id="content" title="Content">
        <ul className={styles.rows}>
          {content.map((item) => (
            <li key={item.label} className={styles.row}>
              <span>{item.label}</span>
              <span className="font-semibold">{n(item.value)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card id="site" title="Site">
        <ul className={styles.rows}>
          <li className={styles.row}>
            <span>Environment</span>
            <span>{site.environment}</span>
          </li>
          <li className={styles.row}>
            <span>Hosting</span>
            <span>{site.hosted}</span>
          </li>
          <li className={styles.row}>
            <span>Commit</span>
            <span className="font-mono">{site.commit ?? "Not available"}</span>
          </li>
          {site.branch ? (
            <li className={styles.row}>
              <span>Branch</span>
              <span className={styles.truncate}>{site.branch}</span>
            </li>
          ) : null}
          {site.region ? (
            <li className={styles.row}>
              <span>Region</span>
              <span>{site.region}</span>
            </li>
          ) : null}
          <li className={styles.row}>
            <span>Figures as of</span>
            <span>{when(data.generatedAt)}</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
