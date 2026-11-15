"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlanNotes, usePlanNotes } from "@/components/notes/PlanNotes";
import { formatLongDate, holidaysOn } from "@/features/calendar/calendar";
import { HolidayCalendar } from "./HolidayCalendar";

export function CalendarWorkspace() {
  const [selected, setSelected] = useState<string | null>(null);
  const [notes] = usePlanNotes();
  const noteDates = useMemo(() => new Set(notes.flatMap((note) => (note.date ? [note.date] : []))), [notes]);
  const dayHolidays = selected ? holidaysOn(selected) : [];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div>
        <HolidayCalendar selected={selected} onSelect={(date) => setSelected(date === selected ? null : date)} noteDates={noteDates} />
        {selected && (
          <div className="anim-pop mt-3 rounded-[var(--radius-md)] bg-surface-2 p-3 text-[0.97rem]" aria-live="polite">
            <p className="font-semibold">{formatLongDate(selected)}</p>
            {dayHolidays.length > 0 ? (
              <ul>
                {dayHolidays.map((holiday) => (
                  <li key={holiday.name}>
                    {holiday.href ? <Link href={holiday.href} className="link-text">{holiday.name}</Link> : holiday.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-2">No holiday listed.</p>
            )}
          </div>
        )}
      </div>
      <section id="notes" aria-labelledby="notes-title">
        <h2 id="notes-title" className="mb-3">Plan notes</h2>
        <PlanNotes selectedDate={selected} />
      </section>
    </div>
  );
}
