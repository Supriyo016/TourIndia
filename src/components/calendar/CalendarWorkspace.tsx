"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlanNotes, usePlanNotes } from "@/components/notes/PlanNotes";
import { OCCASION_KINDS, type FestivalDateFact, type OccasionKind } from "@/data/occasions";
import { formatLongDate } from "@/features/calendar/calendar";
import { CalculatedBadge, HolidayCalendar, useOccasions } from "./HolidayCalendar";

const ALL = new Set(Object.keys(OCCASION_KINDS) as OccasionKind[]);

export function CalendarWorkspace({ festivalDates }: { festivalDates: FestivalDateFact[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [kinds, setKinds] = useState<Set<OccasionKind>>(ALL);
  const [notes] = usePlanNotes();
  const noteDates = useMemo(() => new Set(notes.flatMap((note) => (note.date ? [note.date] : []))), [notes]);
  const occasions = useOccasions(festivalDates, kinds);
  const day = selected ? occasions.on(selected) : [];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div>
        <HolidayCalendar
          selected={selected}
          onSelect={(date) => setSelected(date === selected ? null : date)}
          noteDates={noteDates}
          festivalDates={festivalDates}
          kinds={kinds}
          onKindsChange={setKinds}
        />
        {selected && (
          <div className="anim-pop mt-3 rounded-[var(--radius-md)] bg-surface-2 p-4 text-[0.97rem]" aria-live="polite">
            <p className="font-semibold">{formatLongDate(selected)}</p>
            {day.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {day.map((item) => (
                  <li key={item.name}>
                    <span className="text-xs font-semibold text-muted uppercase">{OCCASION_KINDS[item.kind].label}</span>
                    <span className="block font-medium">
                      {item.href ? <Link prefetch={false} href={item.href} className="link-text">{item.name}</Link> : item.name}
                      {item.calculated && <CalculatedBadge />}
                    </span>
                    {item.detail && <span className="block text-sm text-ink-2">{item.detail}</span>}
                    {item.note && !item.calculated && <span className="block text-sm text-muted">{item.note}</span>}
                    {item.source && (
                      <span className="block text-xs text-muted">
                        Source: <a href={item.source.url} target="_blank" rel="noopener noreferrer" className="underline">{item.source.label}</a>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-2">Nothing listed for this day.</p>
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
