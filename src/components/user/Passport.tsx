"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Award, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  EARLIEST_YEAR,
  MONTH_NAMES,
  PASSPORT_STATUSES,
  passportCounts,
  passportMapCss,
  STATUS_COLOUR,
  STATUS_LABEL,
  type PassportEntry,
  type PassportStatus,
} from "@/features/saved/passport";
import { computeBadges } from "@/features/user/badges";
import { usePassport } from "@/hooks/use-stored-value";
import { cn } from "@/lib/utils";
import type { RegionId } from "@/types/content";
import { PassportStamp } from "./PassportStamp";

type StateItem = { slug: string; name: string; region: RegionId };
type Filter = "all" | PassportStatus | "none";

export function PassportLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-2", className)} aria-label="Map colours">
      {(["visited", "exploring", "want"] as const).map((status) => (
        <li key={status} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-3.5 rounded-sm" style={{ background: STATUS_COLOUR[status] }} />
          {STATUS_LABEL[status]}
        </li>
      ))}
      <li className="inline-flex items-center gap-1.5">
        <span aria-hidden className="size-3.5 rounded-sm border border-line" style={{ background: "var(--map-fill)" }} />
        Not yet
      </li>
    </ul>
  );
}

/** The map, coloured by a scoped style sheet (the map itself is server-rendered SVG). */
export function PassportMap({ scope, entries, map, className }: { scope: string; entries: PassportEntry[]; map: ReactNode; className?: string }) {
  return (
    <div data-passport={scope} className={className}>
      <style>{passportMapCss(scope, entries)}</style>
      {map}
    </div>
  );
}

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear - EARLIEST_YEAR + 1 }, (_, i) => thisYear - i);

function VisitMonth({ state, name, month, onChange }: { state: string; name: string; month?: string; onChange: (month: string | null) => void }) {
  const [year, setYear] = useState(month?.slice(0, 4) ?? "");
  const [mon, setMon] = useState(month?.slice(5, 7) ?? "");
  const update = (nextYear: string, nextMonth: string) => {
    setYear(nextYear);
    setMon(nextMonth);
    if (!nextYear || !nextMonth) {
      if (month) onChange(null);
      return;
    }
    const value = `${nextYear}-${nextMonth}`;
    const now = new Date();
    // A visit can't be in the future.
    if (value > `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`) return;
    onChange(value);
  };
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <select aria-label={`Month you visited ${name}`} className="input !min-h-11 !py-1 text-sm" value={mon} onChange={(event) => update(year, event.target.value)} id={`month-${state}`}>
        <option value="">Month</option>
        {MONTH_NAMES.map((label, index) => (
          <option key={label} value={String(index + 1).padStart(2, "0")}>
            {label}
          </option>
        ))}
      </select>
      <select aria-label={`Year you visited ${name}`} className="input !min-h-11 !py-1 text-sm" value={year} onChange={(event) => update(event.target.value, mon)}>
        <option value="">Year</option>
        {YEARS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * The travel passport: every state and Union Territory with the traveller's own status, a map
 * coloured to match, progress, badges and a stamp for each visit. Saved in this browser, and in
 * the account once signed in.
 */
export function Passport({ stateList, map }: { stateList: StateItem[]; map: ReactNode }) {
  const { entries, stamps, set, ready } = usePassport();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const byState = useMemo(() => new Map(entries.map((entry) => [entry.state, entry])), [entries]);
  const counts = passportCounts(entries.filter((entry) => stateList.some((state) => state.slug === entry.state)));
  const total = stateList.length;
  const regionOf = (slug: string) => stateList.find((state) => state.slug === slug)?.region;
  const badges = computeBadges(stamps, regionOf);
  const earned = badges.filter((badge) => badge.earned).length;
  const visited = stateList.filter((state) => byState.get(state.slug)?.status === "visited");
  const shown = stateList.filter((state) => {
    const status = byState.get(state.slug)?.status;
    return filter === "all" || (filter === "none" ? !status : status === filter);
  });
  const percent = total ? Math.round((counts.visited / total) * 100) : 0;

  return (
    <section aria-labelledby="passport">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">My India travel passport</p>
          <h2 id="passport">
            {counts.visited} of {total} visited
          </h2>
          <p className="mt-1 text-ink-2">
            {counts.exploring} exploring now · {counts.want} on your wish list
          </p>
        </div>
        <p className="text-ink-2">
          {earned} of {badges.length} badges earned
        </p>
      </div>

      <div className="mb-7 h-2.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: STATUS_COLOUR.visited }} />
      </div>

      <div className="mb-8 grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <figure className="card p-4">
          <PassportMap scope="saved" entries={ready ? entries : []} map={map} className="mx-auto max-w-md" />
          <figcaption className="mt-3">
            <PassportLegend />
            <p className="mt-2 text-sm text-muted">
              Only what you mark yourself. Nothing is worked out from where you are or what you read. {user ? "Kept in your account." : "Kept in this browser until you sign in."}
            </p>
          </figcaption>
        </figure>

        <div>
          <h3 className="mb-3 text-lg">Your stamps</h3>
          {ready && visited.length === 0 ? (
            <p className="text-ink-2">Mark a state as visited and its stamp appears here. Each region has its own design.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-5">
              {visited.map((state) => (
                <li key={state.slug}>
                  <PassportStamp slug={state.slug} name={state.name} region={state.region} month={byState.get(state.slug)?.month} className="h-auto w-full" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ul className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <li key={badge.id} className={cn("card flex gap-3 p-3.5", !badge.earned && "!border-dashed !bg-transparent")}>
            {badge.earned ? <Award className="size-6 shrink-0 text-accent-ink" aria-hidden /> : <Lock className="size-5 shrink-0 text-muted" aria-hidden />}
            <div>
              <p className="font-semibold">
                {badge.name}
                <span className="sr-only">{badge.earned ? " (earned)" : " (not yet earned)"}</span>
              </p>
              <p className="text-sm leading-snug text-muted">{badge.description}</p>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mb-3 text-lg">Every state and Union Territory</h3>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Show states">
        {(["all", "visited", "exploring", "want", "none"] as const).map((value) => (
          <button key={value} type="button" className="chip min-h-11" aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {value === "all" ? `All (${total})` : value === "none" ? `Not yet (${total - counts.visited - counts.exploring - counts.want})` : `${STATUS_LABEL[value]} (${counts[value]})`}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="text-ink-2">None yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((state) => {
            const entry = byState.get(state.slug);
            return (
              <li key={state.slug} className="rounded-[var(--radius-md)] border border-line bg-surface p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: entry ? STATUS_COLOUR[entry.status] : "var(--map-fill)" }} />
                    {state.name}
                  </span>
                  <select
                    aria-label={`Status for ${state.name}`}
                    className="input !min-h-11 !w-auto !py-1 text-sm"
                    value={entry?.status ?? ""}
                    onChange={(event) => set(state.slug, (event.target.value || null) as PassportStatus | null, event.target.value === "visited" ? (entry?.month ?? null) : null)}
                  >
                    <option value="">Not yet</option>
                    {PASSPORT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                </div>
                {entry?.status === "visited" && <VisitMonth key={entry.month ?? "none"} state={state.slug} name={state.name} month={entry.month} onChange={(month) => set(state.slug, "visited", month)} />}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
