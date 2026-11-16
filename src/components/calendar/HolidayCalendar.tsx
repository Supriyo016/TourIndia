"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { formatLongDate, monthGrid, shiftMonth, todayInIndia } from "@/features/calendar/calendar";
import { CALCULATED_NOTE, FIRST_YEAR, LAST_YEAR } from "@/features/calendar/computed";
import { natureInMonth, OCCASION_KINDS, occasionsForYear, occasionsToIcs, type FestivalDateFact, type Occasion, type OccasionKind } from "@/data/occasions";
import { monthNames } from "@/data/taxonomy";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ALL_KINDS = Object.keys(OCCASION_KINDS) as OccasionKind[];
const subscribeNever = () => () => undefined;
const YEARS = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, index) => FIRST_YEAR + index);
const clampYear = (year: number) => Math.min(LAST_YEAR, Math.max(FIRST_YEAR, year));

/** The "calculated" label shown beside dates worked out from astronomical rules. */
export function CalculatedBadge() {
  return <span className="ml-2 inline-block rounded-full bg-surface-2 px-2 text-xs text-muted">{CALCULATED_NOTE}</span>;
}

/**
 * Occasions for a month, filtered by kind. Shared with the workspace's day panel. Each year
 * is worked out only when it is first shown, then kept.
 */
export function useOccasions(festivalDates: FestivalDateFact[], kinds: Set<OccasionKind>) {
  return useMemo(() => {
    const cache = new Map<number, Occasion[]>();
    const forYear = (year: number) => {
      if (!cache.has(year)) cache.set(year, occasionsForYear(year, festivalDates));
      return cache.get(year)!.filter((item) => kinds.has(item.kind));
    };
    return {
      on: (date: string) => forYear(Number(date.slice(0, 4))).filter((item) => item.date === date),
      inMonth: (year: number, month: number) => forYear(year).filter((item) => Number(item.date.slice(5, 7)) === month),
    };
  }, [festivalDates, kinds]);
}

export function HolidayCalendar({
  selected,
  onSelect,
  noteDates,
  festivalDates,
  kinds,
  onKindsChange,
}: {
  selected: string | null;
  onSelect: (date: string) => void;
  noteDates: Set<string>;
  festivalDates: FestivalDateFact[];
  kinds: Set<OccasionKind>;
  onKindsChange: (kinds: Set<OccasionKind>) => void;
}) {
  const today = useSyncExternalStore(subscribeNever, () => todayInIndia(), () => "");
  const [view, setView] = useState<{ year: number; month: number } | null>(null);
  const [mode, setMode] = useState<"month" | "agenda">("month");
  const occasions = useOccasions(festivalDates, kinds);

  if (!today) return <div className="card h-[26rem] animate-pulse bg-surface-2" aria-hidden />;

  const current = view ?? { year: clampYear(Number(today.slice(0, 4))), month: Number(today.slice(5, 7)) };
  const atStart = current.year === FIRST_YEAR && current.month === 1;
  const atEnd = current.year === LAST_YEAR && current.month === 12;
  const weeks = monthGrid(current.year, current.month);
  const list = occasions.inMonth(current.year, current.month);
  const nature = natureInMonth(current.month);
  const label = `${monthNames[current.month - 1]} ${current.year}`;

  const exportMonth = () => {
    const blob = new Blob([occasionsToIcs(list, window.location.origin)], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tour-india-${current.year}-${String(current.month).padStart(2, "0")}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl" aria-live="polite">{label}</h2>
        <div className="flex items-center">
          <label className="mr-1">
            <span className="sr-only">Year</span>
            <select
              className="chip !min-h-9 cursor-pointer text-sm"
              value={current.year}
              onChange={(event) => setView({ year: Number(event.target.value), month: current.month })}
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn-outline mr-1 !min-h-9 !px-3" onClick={() => setView(null)}>Today</button>
          <button type="button" className="icon-btn" aria-label="Previous month" disabled={atStart} onClick={() => setView(shiftMonth(current.year, current.month, -1))}>
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button type="button" className="icon-btn" aria-label="Next month" disabled={atEnd} onClick={() => setView(shiftMonth(current.year, current.month, 1))}>
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Show on the calendar">
        {ALL_KINDS.map((kind) => {
          const on = kinds.has(kind);
          return (
            <button
              key={kind}
              type="button"
              className="chip !min-h-9 text-sm"
              aria-pressed={on}
              onClick={() => {
                const next = new Set(kinds);
                if (on) next.delete(kind);
                else next.add(kind);
                onKindsChange(next);
              }}
            >
              <span aria-hidden className={cn("size-2.5 rounded-full", OCCASION_KINDS[kind].className)} />
              {OCCASION_KINDS[kind].label}
            </button>
          );
        })}
      </div>

      <div className="mb-3 flex gap-1" role="tablist" aria-label="View">
        {(["month", "agenda"] as const).map((value) => (
          <button key={value} type="button" role="tab" aria-selected={mode === value} className="chip !min-h-9 text-sm aria-selected:!border-brand aria-selected:!bg-brand-soft aria-selected:!text-brand" onClick={() => setMode(value)}>
            {value === "month" ? "Month" : "List"}
          </button>
        ))}
      </div>

      {mode === "month" ? (
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">Calendar for {label}. Select a day to see its occasions and notes.</caption>
          <thead>
            <tr>
              {WEEKDAYS.map((day) => (
                <th key={day} scope="col" className="pb-2 text-center text-xs font-semibold text-muted">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, row) => (
              <tr key={row}>
                {week.map((date, column) => {
                  if (!date) return <td key={column} />;
                  const day = occasions.on(date);
                  const holiday = day.some((item) => item.kind === "national" || item.kind === "listed");
                  const hasNote = noteDates.has(date);
                  const isToday = date === today;
                  const isSelected = date === selected;
                  const description = [formatLongDate(date), ...day.map((item) => item.name), hasNote ? "has a note" : ""].filter(Boolean).join(", ");
                  return (
                    <td key={date} className="p-0.5">
                      <button
                        type="button"
                        aria-label={description}
                        aria-pressed={isSelected}
                        title={day.map((item) => item.name).join(", ") || undefined}
                        onClick={() => onSelect(date)}
                        className={cn(
                          "relative flex h-12 w-full cursor-pointer flex-col items-center justify-start rounded-[var(--radius-sm)] pt-1.5 text-[0.95rem] transition-colors",
                          isSelected ? "bg-brand font-semibold text-on-brand" : "hover:bg-surface-2",
                          holiday && !isSelected && "bg-accent/20 font-semibold text-accent-ink",
                          isToday && !isSelected && "ring-2 ring-brand",
                        )}
                      >
                        {Number(date.slice(8))}
                        <span aria-hidden className="mt-1 flex gap-0.5">
                          {[...new Set(day.map((item) => item.kind))].slice(0, 4).map((kind) => (
                            <span key={kind} className={cn("size-1.5 rounded-full", OCCASION_KINDS[kind].className)} />
                          ))}
                          {hasNote && <span className={cn("size-1.5 rounded-sm", isSelected ? "bg-on-brand" : "bg-ink")} />}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {nature.length > 0 && (
        <div className="mt-4 rounded-[var(--radius-md)] bg-forest/10 p-3">
          <h3 className="flex items-center gap-1.5 text-base font-semibold text-forest">
            <Leaf className="size-4" aria-hidden /> Nature this month
          </h3>
          <ul className="mt-1.5 space-y-1 text-sm text-ink-2">
            {nature.map((season) => (
              <li key={season.name}>
                <strong className="text-ink">{season.href ? <Link prefetch={false} href={season.href} className="link-text">{season.name}</Link> : season.name}:</strong> {season.detail}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-muted">Typical patterns; each year&apos;s weather shifts them.</p>
        </div>
      )}

      <div className={cn("border-line", mode === "month" ? "mt-4 border-t pt-3" : "")}>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg">In {monthNames[current.month - 1]}</h3>
          <button type="button" className="chip !min-h-9 text-sm" onClick={exportMonth} disabled={!list.length}>
            <CalendarPlus className="size-4" aria-hidden /> Add to my calendar (.ics)
          </button>
        </div>
        {list.length === 0 ? (
          <p className="text-[0.95rem] text-ink-2">Nothing listed for this month with the current filters.</p>
        ) : (
          <ul className={cn("space-y-2 text-[0.95rem]", mode === "agenda" && "scroll-thin max-h-[32rem] overflow-y-auto pr-1")}>
            {list.map((item) => (
              <li key={item.date + item.name} className="flex gap-3">
                <span className="w-14 shrink-0 font-semibold tabular-nums">
                  {Number(item.date.slice(8))} {monthNames[current.month - 1]?.slice(0, 3)}
                </span>
                <span className="text-ink-2">
                  <span aria-hidden className={cn("mr-1.5 inline-block size-2 rounded-full", OCCASION_KINDS[item.kind].className)} />
                  {item.href ? <Link prefetch={false} href={item.href} className="link-text">{item.name}</Link> : <span className="text-ink">{item.name}</span>}
                  <span className="ml-2 text-xs text-muted">{OCCASION_KINDS[item.kind].label}</span>
                  {item.calculated && <CalculatedBadge />}
                  {mode === "agenda" && item.detail && <span className="block text-sm">{item.detail}</span>}
                  {item.note && !item.calculated && <span className="block text-sm text-muted">{item.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
