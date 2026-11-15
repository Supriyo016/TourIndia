"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatLongDate, holidaysInMonth, holidaysOn, monthGrid, shiftMonth, todayInIndia } from "@/features/calendar/calendar";
import { monthNames } from "@/data/taxonomy";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const subscribeNever = () => () => undefined;

export function HolidayCalendar({
  selected,
  onSelect,
  noteDates,
}: {
  selected: string | null;
  onSelect: (date: string) => void;
  noteDates: Set<string>;
}) {
  const today = useSyncExternalStore(subscribeNever, () => todayInIndia(), () => "");
  const [view, setView] = useState<{ year: number; month: number } | null>(null);

  if (!today) return <div className="card h-[26rem] animate-pulse bg-surface-2" aria-hidden />;

  const current = view ?? { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) };
  const weeks = monthGrid(current.year, current.month);
  const holidays = holidaysInMonth(current.year, current.month);
  const label = `${monthNames[current.month - 1]} ${current.year}`;

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl" aria-live="polite">{label}</h2>
        <div className="flex items-center">
          <button type="button" className="btn btn-outline mr-1 !min-h-9 !px-3" onClick={() => setView(null)}>Today</button>
          <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => setView(shiftMonth(current.year, current.month, -1))}>
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button type="button" className="icon-btn" aria-label="Next month" onClick={() => setView(shiftMonth(current.year, current.month, 1))}>
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">Calendar for {label}. Select a day to see holidays and notes.</caption>
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
                const dayHolidays = holidaysOn(date);
                const hasNote = noteDates.has(date);
                const isToday = date === today;
                const isSelected = date === selected;
                const description = [formatLongDate(date), ...dayHolidays.map((holiday) => holiday.name), hasNote ? "has a note" : ""].filter(Boolean).join(", ");
                return (
                  <td key={date} className="p-0.5">
                    <button
                      type="button"
                      aria-label={description}
                      aria-pressed={isSelected}
                      title={dayHolidays.map((holiday) => holiday.name).join(", ") || undefined}
                      onClick={() => onSelect(date)}
                      className={cn(
                        "relative flex h-11 w-full cursor-pointer flex-col items-center justify-center rounded-[var(--radius-sm)] text-[0.95rem] transition-colors",
                        isSelected ? "bg-brand font-semibold text-on-brand" : "hover:bg-surface-2",
                        dayHolidays.length > 0 && !isSelected && "bg-accent/20 font-semibold text-accent-ink",
                        isToday && !isSelected && "ring-2 ring-brand",
                      )}
                    >
                      {Number(date.slice(8))}
                      {hasNote && <span aria-hidden className={cn("absolute bottom-1 size-1.5 rounded-full", isSelected ? "bg-on-brand" : "bg-brand")} />}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 border-t border-line pt-3">
        <h3 className="mb-1.5 text-lg">Holidays in {monthNames[current.month - 1]}</h3>
        {holidays.length === 0 ? (
          <p className="text-[0.95rem] text-ink-2">No holidays are listed for this month.</p>
        ) : (
          <ul className="space-y-1 text-[0.95rem]">
            {holidays.map((holiday) => (
              <li key={holiday.date + holiday.name} className="flex gap-2">
                <span className="w-14 shrink-0 font-semibold tabular-nums">{Number(holiday.date.slice(8))} {monthNames[current.month - 1]?.slice(0, 3)}</span>
                <span className="text-ink-2">
                  {holiday.href ? <Link href={holiday.href} className="link-text">{holiday.name}</Link> : holiday.name}
                  {holiday.kind === "national" && <span className="tag ml-2">National</span>}
                  {holiday.note && <span className="block text-sm text-muted">{holiday.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
