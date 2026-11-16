"use client";

import { useMemo, useState, type ReactNode } from "react";
import { DiyaCharacter } from "@/components/characters/Characters";
import { EmptyState } from "@/components/ui/EmptyState";
import { monthNames } from "@/data/taxonomy";

export interface FestivalMeta {
  slug: string;
  months: number[];
  stateSlugs: string[];
  panIndian: boolean;
}

export function FestivalBrowser({
  items,
  cards,
  stateOptions,
}: {
  items: FestivalMeta[];
  cards: Record<string, ReactNode>;
  stateOptions: { slug: string; name: string }[];
}) {
  const [month, setMonth] = useState(0);
  const [state, setState] = useState("");

  const visible = useMemo(
    () =>
      items
        .filter((item) => !month || item.months.includes(month))
        .filter((item) => !state || item.panIndian || item.stateSlugs.includes(state)),
    [items, month, state],
  );

  return (
    <div>
      <div role="group" aria-label="Filter by month" className="flex flex-wrap gap-2">
        <button type="button" className="chip" aria-pressed={month === 0} onClick={() => setMonth(0)}>All months</button>
        {monthNames.map((name, index) => (
          <button key={name} type="button" className="chip" aria-pressed={month === index + 1} onClick={() => setMonth(index + 1)}>
            {name.slice(0, 3)}
            <span className="sr-only">{name.slice(3)}</span>
          </button>
        ))}
      </div>
      <div className="field mt-4 max-w-xs">
        <label className="field-label" htmlFor="fest-state">State</label>
        <select id="fest-state" className="input" value={state} onChange={(event) => setState(event.target.value)}>
          <option value="">All of India</option>
          {stateOptions.map((option) => (
            <option key={option.slug} value={option.slug}>{option.name}</option>
          ))}
        </select>
      </div>
      <p aria-live="polite" className="my-4 text-ink-2">{visible.length} {visible.length === 1 ? "festival" : "festivals"}</p>
      {visible.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <li key={item.slug}>{cards[item.slug]}</li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No festivals match" art={<DiyaCharacter className="h-20 w-auto" />}>
          <p>Try another month, or choose All of India.</p>
        </EmptyState>
      )}
    </div>
  );
}
