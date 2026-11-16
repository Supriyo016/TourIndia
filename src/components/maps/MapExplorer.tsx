"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { regions } from "@/data/taxonomy";
import { hasMapsKey } from "@/lib/google-maps";
import { cn } from "@/lib/utils";
import { GoogleIndiaMap } from "./GoogleIndiaMap";
import type { RegionId } from "@/types/content";

export interface StatePreview {
  slug: string;
  name: string;
  kind: string;
  capital: string;
  tagline: string;
  region: RegionId;
  season: string;
  days: string;
  guides: number;
  image?: { src: string; alt: string; blur?: string };
}

interface ExplorerProps {
  previews: StatePreview[];
  children: ReactNode;
  markers?: ReactNode;
  initialSlug: string;
}

const toRegion = (value: string | null) => (regions.some((item) => item.id === value) ? value : null);

/**
 * Follows ?region= in the address, so choosing a region from the menu takes effect here too.
 * It is the only part that reads the address, so the map itself renders on the server once.
 */
function RegionFromAddress({ onChange }: { onChange: (region: string | null) => void }) {
  const requested = toRegion(useSearchParams().get("region"));
  useEffect(() => onChange(requested), [requested, onChange]);
  return null;
}

export function MapExplorer({ previews, children, markers, initialSlug }: ExplorerProps) {
  const [region, setRegion] = useState<string | null>(null);
  const [slug, setSlug] = useState(initialSlug);
  const lastSelected = useRef<Element | null>(null);
  const [showPins, setShowPins] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const preview = previews.find((item) => item.slug === slug);
  const cursorLabel = useRef<HTMLDivElement>(null);
  const mapArea = useRef<HTMLDivElement>(null);

  // Written straight to the DOM so moving the mouse never re-renders the map.
  const moveCursorLabel = (event: React.MouseEvent<HTMLDivElement>) => {
    const label = cursorLabel.current;
    const area = mapArea.current;
    if (!label || !area) return;
    const name = (event.target as Element)
      .closest("[data-slug]")
      ?.getAttribute("aria-label");
    if (!name) {
      label.style.opacity = "0";
      return;
    }
    const bounds = area.getBoundingClientRect();
    label.textContent = name;
    label.style.opacity = "1";
    label.style.transform = `translate(${event.clientX - bounds.left + 14}px, ${event.clientY - bounds.top + 14}px)`;
  };

  const onHover = (event: React.SyntheticEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest("[data-slug]");
    const next = link?.getAttribute("data-slug");
    if (!link || !next) return;
    lastSelected.current?.removeAttribute("data-selected");
    link.setAttribute("data-selected", "true");
    lastSelected.current = link;
    setSlug(next);
  };

  return (
    <div>
      <Suspense fallback={null}>
        <RegionFromAddress onChange={setRegion} />
      </Suspense>
      <div
        className="mb-4 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Highlight a region"
      >
        <button
          type="button"
          className="chip"
          aria-pressed={region === null}
          onClick={() => setRegion(null)}
        >
          All India
        </button>
        {regions.map((item) => (
          <button
            key={item.id}
            type="button"
            className="chip"
            aria-pressed={region === item.id}
            onClick={() => setRegion(item.id)}
          >
            {item.name}
          </button>
        ))}
        <label className="inline-flex max-w-full min-w-0 items-center gap-2 text-sm font-medium text-ink-2">
          <span>State</span>
          <select className="input !min-h-9 !w-auto max-w-[min(16rem,70vw)] min-w-0 !py-1 text-sm" value={slug} onChange={(event) => setSlug(event.target.value)}>
            {[...previews]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
          </select>
        </label>
        {markers && !googleReady && (
          <label className="ml-auto inline-flex min-h-9 cursor-pointer items-center gap-2 text-sm font-medium text-ink-2">
            <input
              type="checkbox"
              className="size-4 accent-[var(--brand)]"
              checked={showPins}
              onChange={(event) => setShowPins(event.target.checked)}
            />
            Show guides on map
          </label>
        )}
      </div>

      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div
          ref={mapArea}
          className={cn("relative mx-auto w-full max-w-[46rem]", !googleReady && "map-3d")}
          data-region-filter={region ?? undefined}
          onMouseOver={onHover}
          onFocus={onHover}
          onMouseMove={moveCursorLabel}
          onMouseLeave={() => {
            if (cursorLabel.current) cursorLabel.current.style.opacity = "0";
          }}
        >
          {hasMapsKey && (
            <div className={googleReady ? "" : "absolute inset-0 -z-10 opacity-0"} inert={!googleReady}>
              <GoogleIndiaMap previews={previews} region={region} selected={slug} onHover={setSlug} onReady={() => setGoogleReady(true)} />
            </div>
          )}
          {/* The drawn map: the whole map without a Google key, and until the Google map is ready. */}
          <div className={googleReady ? "hidden" : undefined}>
            {children}
            {showPins && markers}
          </div>
          <div
            ref={cursorLabel}
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 rounded-[var(--radius-sm)] bg-brand-strong px-2 py-1 text-sm font-semibold whitespace-nowrap text-on-brand opacity-0 shadow-md transition-opacity"
          />
        </div>

        <aside
          aria-live="polite"
          className="card sticky top-24 overflow-hidden"
        >
          {preview ? (
            <div key={preview.slug} className="anim-pop">
              {preview.image && (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={preview.image.src}
                    alt={preview.image.alt}
                    fill
                    sizes="22rem"
                    className="object-cover"
                    placeholder={preview.image.blur ? "blur" : "empty"}
                    blurDataURL={preview.image.blur}
                  />
                </div>
              )}
              <div className="p-5">
                <p className="text-sm font-medium text-muted">
                  {preview.kind === "state" ? "State" : "Union Territory"}
                </p>
                <h2 className="mt-0.5 !text-[1.45rem]">{preview.name}</h2>
                <p className="mt-2 text-[0.97rem] text-ink-2">
                  {preview.tagline}
                </p>
                <dl className="mt-4 space-y-2 text-[0.95rem]">
                  <div className="flex justify-between gap-4 border-b border-line pb-2">
                    <dt className="text-muted">Capital</dt>
                    <dd className="text-right font-medium">
                      {preview.capital}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line pb-2">
                    <dt className="text-muted">Best months</dt>
                    <dd className="text-right font-medium">{preview.season}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line pb-2">
                    <dt className="text-muted">Suggested trip</dt>
                    <dd className="text-right font-medium">{preview.days}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Guides here</dt>
                    <dd className="flex items-center gap-1 font-medium">
                      <MapPin className="size-4 text-accent-ink" aria-hidden />{" "}
                      {preview.guides}
                    </dd>
                  </div>
                </dl>
                <Link prefetch={false}
                  href={`/explore/${preview.slug}`}
                  className="btn btn-primary mt-4 w-full"
                >
                  Explore {preview.name}{" "}
                  <ArrowRight className="nudge size-4" aria-hidden />
                </Link>
              </div>
            </div>
          ) : (
            <p className="p-5 text-ink-2">Point to a state to preview it.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
