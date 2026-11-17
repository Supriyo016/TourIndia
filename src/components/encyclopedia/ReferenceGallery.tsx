"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import styles from "./reference-gallery.module.css";

export interface ReferenceItem {
  src: string;
  width: number;
  height: number;
  blur?: string;
  caption: string;
  author: string;
  license: string;
  sourceUrl: string;
}

/** A Wikipedia-style gallery of captioned, credited photographs, with a full-screen viewer. */
export function ReferenceGallery({ title, items }: { title: string; items: ReferenceItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = open === null ? null : items[open];

  useEffect(() => {
    if (open !== null && !dialog.current?.open) dialog.current?.showModal();
    if (open === null && dialog.current?.open) dialog.current.close();
  }, [open]);

  const step = useCallback(
    (delta: number) => setOpen((value) => (value === null ? null : (value + delta + items.length) % items.length)),
    [items.length],
  );

  if (!items.length) return null;
  return (
    <section aria-labelledby="gallery-title" className="mt-8 border-t border-line pt-6">
      <h2 id="gallery-title" className="text-2xl">Gallery</h2>
      <p className="mt-1 text-sm text-muted">Photographs of {title} from Wikimedia Commons. Select one to view it larger.</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.src}>
            <figure className="card h-full overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(index)}
                aria-label={`View larger: ${item.caption}`}
                className="zoom-media relative block aspect-[4/3] w-full cursor-zoom-in"
              >
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 15rem, (min-width: 768px) 30vw, 46vw"
                  placeholder={item.blur ? "blur" : "empty"}
                  blurDataURL={item.blur}
                  className="object-cover"
                />
              </button>
              <figcaption className="px-3 py-2 text-sm text-ink-2">
                <span className={styles.caption}>{item.caption}</span>
                <span className="mt-1 block text-xs text-muted">
                  {item.author},{" "}
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    {item.license}
                  </a>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label="Photograph viewer"
        onClose={() => setOpen(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") step(-1);
          if (event.key === "ArrowRight") step(1);
        }}
        className={`${styles.viewer} m-0 h-dvh max-h-none w-screen max-w-none text-white`}
      >
        {current && (
          <div className="flex h-full flex-col">
            <div className="flex justify-end p-2">
              <button type="button" autoFocus className="icon-btn !text-white hover:!bg-white/20" aria-label="Close viewer" onClick={() => setOpen(null)}>
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <div className="relative min-h-0 flex-1">
              <Image key={current.src} src={current.src} alt={current.caption} fill sizes="100vw" className="object-contain" />
              {items.length > 1 && (
                <>
                  <button type="button" className="icon-btn absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 !text-white hover:!bg-white/25" aria-label="Previous photograph" onClick={() => step(-1)}>
                    <ChevronLeft className="size-7" aria-hidden />
                  </button>
                  <button type="button" className="icon-btn absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 !text-white hover:!bg-white/25" aria-label="Next photograph" onClick={() => step(1)}>
                    <ChevronRight className="size-7" aria-hidden />
                  </button>
                </>
              )}
            </div>
            <div className="p-4 text-center text-sm">
              <p className="font-semibold">{current.caption}</p>
              <p className="text-white/75">
                {current.author},{" "}
                <a href={current.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{current.license}</a>
                {" · "}
                {(open ?? 0) + 1} of {items.length}
              </p>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
