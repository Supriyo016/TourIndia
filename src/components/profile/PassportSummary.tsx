import Link from "next/link";
import { IndiaMap } from "@/components/maps/IndiaMap";
import { PassportLegend } from "@/components/user/Passport";
import { PassportStamp } from "@/components/user/PassportStamp";
import { getState, states } from "@/data";
import { passportCounts, passportMapCss, type PassportEntry } from "@/features/saved/passport";

/** The profile overview's view of the passport: progress, the coloured map and the latest stamps. */
export function PassportSummary({ entries }: { entries: PassportEntry[] }) {
  const counts = passportCounts(entries);
  const visits = entries.filter((entry) => entry.status === "visited");
  // Newest visits first: those with a month by date, then the rest in the order they were marked.
  const latest = [...visits]
    .reverse()
    .sort((a, b) => (b.month ?? "").localeCompare(a.month ?? ""))
    .slice(0, 6);
  return (
    <section aria-labelledby="passport-summary-title" className="card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="passport-summary-title" className="text-xl">
          Travel passport
        </h2>
        <Link prefetch={false} href="/saved#passport" className="link-text text-sm font-semibold">
          Open your passport
        </Link>
      </div>
      <div className="mt-4 grid items-center gap-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div data-passport="overview" className="mx-auto w-full max-w-60">
          <style>{passportMapCss("overview", entries)}</style>
          <IndiaMap className="h-auto w-full" linked={false} />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">
            {counts.visited} of {states.length} visited
          </p>
          <p className="mt-1 text-ink-2">
            {counts.exploring} exploring now · {counts.want} on your wish list
          </p>
          <PassportLegend className="mt-3" />
          {latest.length > 0 ? (
            <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Latest stamps">
              {latest.map((entry) => {
                const state = getState(entry.state);
                return state ? (
                  <li key={entry.state}>
                    <PassportStamp slug={state.slug} name={state.name} region={state.region} month={entry.month} className="h-auto w-full" />
                  </li>
                ) : null;
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Mark the states you&apos;ve been to, the ones you&apos;re exploring and the ones you&apos;d love to see.</p>
          )}
        </div>
      </div>
    </section>
  );
}
