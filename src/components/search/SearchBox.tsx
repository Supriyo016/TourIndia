"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { searchEntries, type SearchEntry } from "@/features/discovery/search";
import { cn } from "@/lib/utils";

let indexPromise: Promise<SearchEntry[]> | null = null;

function loadIndex() {
  indexPromise ??= fetch("/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error("Search index unavailable");
      return response.json() as Promise<SearchEntry[]>;
    })
    .catch((error) => {
      indexPromise = null;
      throw error;
    });
  return indexPromise;
}

const SUGGESTIONS = ["Hampi", "Kerala", "Northeast India", "Beaches", "Diwali", "Biryani"];

export function SearchBox({
  autoFocus,
  onNavigate,
  placeholder = "Search places, states, festivals or food",
  variant = "plain",
}: {
  autoFocus?: boolean;
  onNavigate?: () => void;
  placeholder?: string;
  variant?: "plain" | "hero";
}) {
  const router = useRouter();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const ensureIndex = () => {
    if (entries) return;
    setFailed(false);
    loadIndex().then(setEntries, () => setFailed(true));
  };

  const results = useMemo(() => (entries ? searchEntries(entries, query) : []), [entries, query]);
  const showPanel = open && (query.trim().length > 0 || variant === "plain");

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (results.length ? (current + 1) % results.length : -1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (results.length ? (current <= 0 ? results.length - 1 : current - 1) : -1));
    } else if (event.key === "Enter") {
      const target = results[active] ?? results[0];
      if (target) {
        event.preventDefault();
        go(target.href);
      }
    } else if (event.key === "Escape" && open && variant === "hero") {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full" role="search">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
          aria-label="Search Tour India"
          autoComplete="off"
          className={cn("input pl-11", variant === "hero" && "min-h-14 border-transparent text-[1.05rem] shadow-lg")}
          placeholder={placeholder}
          value={query}
          onFocus={() => {
            ensureIndex();
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 140)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
            setOpen(true);
            ensureIndex();
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {showPanel && (
        <div
          className={cn(
            "anim-menu z-30 mt-2 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface text-left text-ink shadow-lg",
            variant === "hero" && "absolute inset-x-0",
          )}
        >
          <ul id={`${id}-list`} role="listbox" aria-label="Search results" className="max-h-[52vh] overflow-y-auto py-1">
            {results.map((result, index) => (
              <li
                key={result.href + result.title}
                id={`${id}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => {
                  event.preventDefault();
                  go(result.href);
                }}
                onMouseEnter={() => setActive(index)}
                className={cn("flex cursor-pointer items-center gap-3 px-4 py-2.5", index === active && "bg-surface-2")}
              >
                <MapPin className="size-4 shrink-0 text-accent-ink" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{result.title}</span>
                  <span className="block truncate text-sm text-muted">{result.subtitle}</span>
                </span>
                <span className="tag shrink-0">{result.type}</span>
              </li>
            ))}
          </ul>

          {failed && (
            <p className="px-4 py-3 text-sm text-danger">
              Search could not load. Check your connection and try again.
            </p>
          )}
          {!failed && !entries && query.trim() && (
            <p className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Loading search
            </p>
          )}
          {entries && query.trim() && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-ink-2">
              Nothing matches &ldquo;{query.trim()}&rdquo;. Try a state, a town or a festival name.
            </p>
          )}
          {!query.trim() && (
            <div className="px-4 py-3">
              <p className="mb-2 text-sm font-semibold text-ink-2">Try searching for</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="chip"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setQuery(suggestion);
                      ensureIndex();
                      inputRef.current?.focus();
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
