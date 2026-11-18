import type { ReactNode } from "react";
import type { AnalyticsReport, Ranked, VitalSummary } from "@/features/analytics/report";
import { EVENT_VARIANTS, FEATURE_EVENTS, type EventVariant, type FeatureEvent } from "@/features/analytics/shared";
import styles from "./analytics.module.css";

const number = new Intl.NumberFormat("en-IN");
const n = (value: number) => number.format(value);
const regions = new Intl.DisplayNames(["en-GB"], { type: "region" });
const percent = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "0%");

export const formatDay = (day: string, style: "short" | "long" = "long") =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", style === "long" ? { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" } : { day: "numeric", month: "short", timeZone: "UTC" });

const VARIANT_LABEL: Record<EventVariant, string> = {
  account: "to an account",
  device: "in the browser",
  trip: "saved trip",
  collection: "collection",
  planner: "planner link",
  email: "email code",
};

function eventLabel(key: string) {
  const [name, variant] = key.split(":") as [FeatureEvent, EventVariant | undefined];
  const base = FEATURE_EVENTS[name] ?? name;
  return variant && EVENT_VARIANTS.includes(variant) ? `${base}: ${VARIANT_LABEL[variant]}` : base;
}

function countryLabel(code: string) {
  if (code === "unknown") return "Not known";
  try {
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}

function Section({ id, title, note, children, wide = false }: { id: string; title: string; note?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <section aria-labelledby={`${id}-title`} className={`card p-4 ${wide ? styles.wide : ""}`}>
      <h2 id={`${id}-title`} className="text-lg">
        {title}
      </h2>
      {note && <p className="mt-1 text-sm text-ink-2">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

const Empty = ({ children = "Nothing recorded in this period." }: { children?: ReactNode }) => <p className="text-sm text-muted">{children}</p>;

/** A ranked list as a real table; the bar in each row is decoration, the numbers are the data. */
function RankTable({ rows, label, format = (key) => key, extra }: { rows: Ranked[]; label: string; format?: (key: string) => ReactNode; extra?: { heading: string; value: (row: Ranked) => ReactNode } }) {
  if (!rows.length) return <Empty />;
  const max = Math.max(...rows.map((row) => row.count));
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">{label}</th>
          <th scope="col" className={styles.num}>
            Count
          </th>
          {extra && (
            <th scope="col" className={styles.num}>
              {extra.heading}
            </th>
          )}
          <th scope="col" className={styles.num}>
            Share
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <th scope="row" className={styles.label}>
              <span className={styles.bar} style={{ width: `${Math.max(2, (row.count / max) * 100)}%` }} aria-hidden />
              <span className={styles.labelText}>{format(row.key)}</span>
            </th>
            <td className={styles.num}>{n(row.count)}</td>
            {extra && <td className={styles.num}>{extra.value(row)}</td>}
            <td className={`${styles.num} text-muted`}>{percent(row.count, total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Traffic({ report }: { report: AnalyticsReport }) {
  const max = Math.max(1, ...report.days.map((day) => day.views));
  const busiest = report.days.reduce((best, day) => (day.views > best.views ? day : best), report.days[0]!);
  const summary = report.totals.views
    ? `Page views per day from ${formatDay(report.from)} to ${formatDay(report.to)}: ${n(report.totals.views)} in all, busiest on ${formatDay(busiest.day)} with ${n(busiest.views)}.`
    : `No page views were recorded from ${formatDay(report.from)} to ${formatDay(report.to)}.`;
  return (
    <figure>
      <div className={styles.chart} role="img" aria-label={summary}>
        {report.days.map((day) => (
          <div key={day.day} className={styles.column} title={`${formatDay(day.day, "short")}: ${n(day.views)} views, ${n(day.visitors)} visitors`}>
            <span className={styles.views} style={{ height: `${(day.views / max) * 100}%` }} />
            <span className={styles.visitors} style={{ height: `${(day.visitors / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-2">
        <span>
          {formatDay(report.from, "short")} to {formatDay(report.to, "short")}
        </span>
        <span className="flex gap-3">
          <span className="inline-flex items-center gap-1">
            <span className={`${styles.key} ${styles.views}`} aria-hidden /> Page views
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={`${styles.key} ${styles.visitors}`} aria-hidden /> Unique visitors
          </span>
        </span>
      </figcaption>
      <details className="mt-3">
        <summary className="link-text cursor-pointer text-sm">Show as a table</summary>
        <div className={styles.scroll}>
          <table className={styles.table}>
            <caption className="sr-only">Page views and unique visitors per day</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col" className={styles.num}>
                  Page views
                </th>
                <th scope="col" className={styles.num}>
                  Unique visitors
                </th>
              </tr>
            </thead>
            <tbody>
              {[...report.days].reverse().map((day) => (
                <tr key={day.day}>
                  <th scope="row">{formatDay(day.day)}</th>
                  <td className={styles.num}>{n(day.views)}</td>
                  <td className={styles.num}>{n(day.visitors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

const vitalValue = (vital: VitalSummary, value: number) => (vital.name === "CLS" ? value.toFixed(3) : `${n(value)} ms`);

function Vitals({ vitals }: { vitals: VitalSummary[] }) {
  if (!vitals.some((vital) => vital.count)) return <Empty>No speed measurements in this period.</Empty>;
  return (
    <div className="grid gap-5">
      {vitals.map((vital) => (
        <div key={vital.name}>
          <h3 className="text-base">
            {vital.label} ({vital.name})
          </h3>
          {vital.count ? (
            <>
              <p className="mt-1 text-sm text-ink-2">
                Average {vitalValue(vital, vital.average)} over {n(vital.count)} {vital.count === 1 ? "visit" : "visits"}. Good {percent(vital.good, vital.count)}, needs improvement {percent(vital.ni, vital.count)}, poor {percent(vital.poor, vital.count)}.
              </p>
              <div className={styles.split} aria-hidden>
                <span className={styles.good} style={{ width: percent(vital.good, vital.count) }} />
                <span className={styles.ni} style={{ width: percent(vital.ni, vital.count) }} />
                <span className={styles.poor} style={{ width: percent(vital.poor, vital.count) }} />
              </div>
              <div className={styles.scroll}>
                <table className={`${styles.table} mt-2`}>
                  <thead>
                    <tr>
                      <th scope="col">Page</th>
                      <th scope="col" className={styles.num}>
                        Visits
                      </th>
                      <th scope="col" className={styles.num}>
                        Average
                      </th>
                      <th scope="col" className={styles.num}>
                        Good
                      </th>
                      <th scope="col" className={styles.num}>
                        Poor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vital.pages.map((page) => (
                      <tr key={page.path}>
                        <th scope="row" className={styles.labelText}>
                          {page.path}
                        </th>
                        <td className={styles.num}>{n(page.count)}</td>
                        <td className={styles.num}>{vitalValue(vital, page.average)}</td>
                        <td className={styles.num}>{percent(page.good, page.count)}</td>
                        <td className={styles.num}>{percent(page.poor, page.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <Empty>No measurements in this period.</Empty>
          )}
        </div>
      ))}
    </div>
  );
}

export function AnalyticsDashboard({ report }: { report: AnalyticsReport }) {
  const { totals } = report;
  const started = report.firstDay
    ? `Tracking began on ${formatDay(report.firstDay)}; nothing before then was recorded.`
    : "Nothing has been recorded yet. Tracking began when this feature went live, and earlier visits were never counted, so there is nothing to show from before then.";

  return (
    <div className={styles.grid}>
      <p role="status" className={`card bg-surface-2 p-4 text-sm ${styles.wide}`}>
        {!report.available ? "The database isn't connected, so no figures can be read. " : ""}
        {started} Only visitors who allowed analytics in their cookie choices are counted, so real traffic is higher. Days run on India time.
      </p>

      <Section id="overview" title="Overview" wide>
        <dl className={styles.stats}>
          {(
            [
              ["Page views", n(totals.views)],
              ["Unique visitors", n(totals.visitorDays)],
              ["Feature uses", n(totals.events)],
              ["Searches", n(totals.searches)],
              ["Searches with no results", n(totals.zeroSearches)],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className={styles.stat}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-display text-2xl">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-ink-2">Unique visitors are counted per day and added up, so someone who came on three days counts three times. Visitors can&apos;t be followed from one day to the next.</p>
      </Section>

      <Section id="traffic" title="Traffic over time" wide>
        <Traffic report={report} />
      </Section>

      <Section id="pages" title="Top pages">
        <RankTable rows={report.pages} label="Page" />
      </Section>
      <Section id="entries" title="Where visits start">
        <RankTable rows={report.entries} label="First page" />
      </Section>
      <Section id="referrers" title="Referring sites" note="The site a visit came from, by name only. Many browsers don't say.">
        <RankTable rows={report.referrers} label="Site" />
      </Section>
      <Section id="journeys" title="Journeys" note="The first page of a visit, then the page opened next.">
        <RankTable rows={report.journeys} label="From → to" />
      </Section>
      <Section id="countries" title="Countries">
        <RankTable rows={report.countries} label="Country" format={countryLabel} />
      </Section>
      <Section id="states" title="Indian states and union territories" note="From the network location the hosting service reports. No address or city is kept.">
        <RankTable rows={report.states} label="State" />
      </Section>
      <Section id="devices" title="Devices">
        <RankTable rows={report.devices} label="Device" format={(key) => key.charAt(0).toUpperCase() + key.slice(1)} />
      </Section>
      <Section id="browsers" title="Browsers">
        <RankTable rows={report.browsers} label="Browser" />
      </Section>
      <Section id="features" title="Feature usage" wide>
        <RankTable rows={report.events} label="Feature" format={eventLabel} />
      </Section>
      <Section id="searches" title="What people search for" note="Lowercased words only; anything like an email address or phone number is never kept.">
        <RankTable rows={report.searches} label="Search" extra={{ heading: "No results", value: (row) => n((row as Ranked & { zero: number }).zero) }} />
      </Section>
      <Section id="zero" title="Searches with no results" note="Guides people looked for and didn't find.">
        <RankTable rows={report.zeroSearches} label="Search" />
      </Section>
      <Section id="vitals" title="Page speed (Core Web Vitals)" note="Measured in visitors' browsers on the page where each visit started. Good is at most 2.5 s for LCP, 200 ms for INP and 0.1 for CLS." wide>
        <Vitals vitals={report.vitals} />
      </Section>
    </div>
  );
}
