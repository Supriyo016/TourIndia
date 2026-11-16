"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface GalleryItem {
  src: string;
  width: number;
  height: number;
  blur?: string;
  alt: string;
  state: string;
  stateSlug: string;
  category: string;
  author: string;
  license: string;
  sourceUrl: string;
  href?: string;
}

export function GalleryBrowser({
  items,
  categories,
  stateOptions,
}: {
  items: GalleryItem[];
  categories: string[];
  stateOptions: { slug: string; name: string }[];
}) {
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);

  const visible = useMemo(
    () => items.filter((item) => (!category || item.category === category) && (!state || item.stateSlug === state)),
    [items, category, state],
  );
  const current = open === null ? null : visible[open];

  useEffect(() => {
    if (open !== null) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  const step = useCallback(
    (delta: number) => setOpen((value) => (value === null ? null : (value + delta + visible.length) % visible.length)),
    [visible.length],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <div role="group" aria-label="Filter by subject" className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={category === ""} onClick={() => setCategory("")}>All</button>
          {categories.map((name) => (
            <button key={name} type="button" className="chip" aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>
          ))}
        </div>
        <div className="field min-w-52">
          <label className="field-label" htmlFor="g-state">State</label>
          <select id="g-state" className="input" value={state} onChange={(event) => setState(event.target.value)}>
            <option value="">All of India</option>
            {stateOptions.map((option) => (
              <option key={option.slug} value={option.slug}>{option.name}</option>
            ))}
          </select>
        </div>
      </div>
      <p aria-live="polite" className="my-4 text-ink-2">{visible.length} photographs</p>

      {visible.length === 0 ? (
        <p className="text-ink-2">No photographs match. Try another state or subject.</p>
      ) : (
        <ul className="columns-2 gap-3 md:columns-3 xl:columns-4">
          {visible.map((item, index) => (
            <li key={item.src} className="mb-3 break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpen(index)}
                aria-label={`View larger: ${item.alt}`}
                className="zoom-media block w-full cursor-zoom-in rounded-[var(--radius-md)]"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 48vw"
                  placeholder={item.blur ? "blur" : "empty"}
                  blurDataURL={item.blur}
                  className="h-auto w-full"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        aria-label="Photograph viewer"
        onClose={() => setOpen(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") step(-1);
          if (event.key === "ArrowRight") step(1);
        }}
        onTouchStart={(event) => (touchStart.current = event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const end = event.changedTouches[0]?.clientX;
          if (start != null && end != null && Math.abs(end - start) > 50) step(end < start ? 1 : -1);
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-[rgb(6_14_18/0.95)] text-white backdrop:bg-transparent"
      >
        {current && (
          <div className="flex h-full flex-col">
            <div className="flex justify-end p-2">
              <button type="button" autoFocus className="icon-btn !text-white hover:!bg-white/20" aria-label="Close viewer" onClick={() => setOpen(null)}>
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              <Image key={current.src} src={current.src} alt={current.alt} fill sizes="100vw" className="anim-pop object-contain" />
              <button type="button" className="icon-btn absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 !text-white hover:!bg-white/25" aria-label="Previous photograph" onClick={() => step(-1)}>
                <ChevronLeft className="size-7" aria-hidden />
              </button>
              <button type="button" className="icon-btn absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 !text-white hover:!bg-white/25" aria-label="Next photograph" onClick={() => step(1)}>
                <ChevronRight className="size-7" aria-hidden />
              </button>
            </div>
            <div className="p-4 text-center text-sm">
              <p className="font-semibold">
                {current.href ? <Link href={current.href} className="underline">{current.alt}</Link> : current.alt}
              </p>
              <p className="text-white/75">
                {current.author},{" "}
                <a href={current.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{current.license}</a>
              </p>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
