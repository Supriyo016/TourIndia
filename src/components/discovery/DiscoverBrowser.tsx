"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { Shuffle } from "lucide-react";
import { CompassCharacter } from "@/components/characters/Characters";
import { EmptyState } from "@/components/ui/EmptyState";
import { monthNames, regions } from "@/data/taxonomy";
import type { CategoryId, RegionId } from "@/types/content";

export interface DiscoverItem {
  slug: string;
  name: string;
  state: string;
  region: RegionId;
  categories: CategoryId[];
  months: number[];
  maxDays: number;
  midCost: number;
}

type Sort = "name" | "short" | "cost";

interface BrowserProps {
  items: DiscoverItem[];
  cards: Record<string, ReactNode>;
  categoryOptions?: { id: CategoryId; name: string }[];
}

/** Keyed on the query string, so a new link to this page applies its filters. */
export function DiscoverBrowser(props: BrowserProps) {
  const params = useSearchParams();
  return <Browser key={params.toString()} {...props} params={params} />;
}

function Browser({ items, cards, categoryOptions, params }: BrowserProps & { params: URLSearchParams }) {
  const router = useRouter();
  const requestedRegion = params.get("region") ?? "";
  const requestedCategory = params.get("category") ?? "";
  const requestedMonth = Number(params.get("month"));
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [region, setRegion] = useState<string>(regions.some(({ id }) => id === requestedRegion) ? requestedRegion : "");
  const [category, setCategory] = useState<string>(categoryOptions?.some(({ id }) => id === requestedCategory) ? requestedCategory : "");
  const [month, setMonth] = useState<string>(Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12 ? String(requestedMonth) : "");
  const [sort, setSort] = useState<Sort>("name");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items
      .filter((item) => !region || item.region === region)
      .filter((item) => !category || item.categories.includes(category as CategoryId))
      .filter((item) => !month || item.months.includes(Number(month)))
      .filter((item) => !needle || `${item.name} ${item.state}`.toLowerCase().includes(needle))
      .sort((a, b) => {
        if (sort === "short") return a.maxDays - b.maxDays || a.name.localeCompare(b.name);
        if (sort === "cost") return a.midCost - b.midCost || a.name.localeCompare(b.name);
        return a.name.localeCompare(b.name);
      });
  }, [items, query, region, category, month, sort]);

  const reset = () => {
    setQuery("");
    setRegion("");
    setCategory("");
    setMonth("");
  };
  const filtered = Boolean(query || region || category || month);

  return (
    <div>
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={(event) => event.preventDefault()} aria-label="Filter destinations">
        <div className="field">
          <label className="field-label" htmlFor="f-q">Name or state</label>
          <input id="f-q" className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="For example, Kerala" />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="f-region">Region</label>
          <select id="f-region" className="input" value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="">All regions</option>
            {regions.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
        {categoryOptions && (
          <div className="field">
            <label className="field-label" htmlFor="f-cat">Travel style</label>
            <select id="f-cat" className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All styles</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label className="field-label" htmlFor="f-month">Travelling in</label>
          <select id="f-month" className="input" value={month} onChange={(event) => setMonth(event.target.value)}>
            <option value="">Any month</option>
            {monthNames.map((name, index) => (
              <option key={name} value={index + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="f-sort">Sort by</label>
          <select id="f-sort" className="input" value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
            <option value="name">Name</option>
            <option value="short">Shortest trip</option>
            <option value="cost">Lowest estimated cost</option>
          </select>
        </div>
      </form>

      <div className="mt-5 mb-5 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-ink-2">
          {visible.length} {visible.length === 1 ? "guide" : "guides"}
          {filtered && (
            <button type="button" onClick={reset} className="link-text ml-3 cursor-pointer">
              Clear filters
            </button>
          )}
        </p>
        <button
          type="button"
          className="btn btn-outline"
          disabled={visible.length === 0}
          onClick={() => {
            const pick = visible[Math.floor(Math.random() * visible.length)];
            if (pick) router.push(`/destinations/${pick.slug}`);
          }}
        >
          <Shuffle className="size-4" aria-hidden /> Surprise me
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No guides match those filters" art={<CompassCharacter className="h-24 w-24" />}>
          <p>Try another month or region, or clear the filters to see every guide.</p>
          <button type="button" className="btn btn-primary mt-3" onClick={reset}>Clear filters</button>
        </EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => (
            <li key={item.slug}>{cards[item.slug]}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
