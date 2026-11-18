"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { adminPost } from "../adminFetch";

export interface PickerImage {
  key: string;
  src: string;
  alt: string;
  credit: string;
}

/** Choose the photo a page uses from the licensed images that suit it, or type any library key. */
export function ImagePicker({ target, current, fallback, options }: { target: { type: string; id: string }; current: string; fallback: string; options: PickerImage[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [typed, setTyped] = useState("");

  const choose = async (key: string | null) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminPost("/api/admin/media", { action: "assign", target, key });
      setNotice(key && key !== fallback ? `The page now uses ${key}.` : "The page uses its own image again.");
      startTransition(() => router.refresh());
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const disabled = busy || pending;

  return (
    <div className="mt-6 grid gap-5">
      <p aria-live="polite" className={notice ? "text-sm" : "sr-only"}>
        {notice}
      </p>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {options.map((image) => {
          const selected = image.key === current;
          return (
            <li key={image.key} className={`card overflow-hidden ${selected ? "ring-2 ring-[var(--accent)]" : ""}`}>
              <div className="relative aspect-[4/3] bg-surface-2">
                <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 14rem, 45vw" className="object-cover" />
              </div>
              <div className="grid gap-1.5 p-2.5 text-xs">
                <p className="font-semibold break-all">{image.key}</p>
                <p className="text-ink-2">{image.credit}</p>
                <button type="button" className="chip justify-self-start" aria-pressed={selected} disabled={disabled || selected} onClick={() => void choose(image.key)}>
                  {selected ? (
                    <>
                      <Check className="size-3.5" aria-hidden /> In use
                    </>
                  ) : (
                    "Use this image"
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (typed.trim()) void choose(typed.trim());
        }}
      >
        <div className="grid gap-1.5">
          <label htmlFor="image-key" className="text-sm font-semibold">
            Or any image from the library, by key
          </label>
          <input id="image-key" className="input" placeholder="gallery:goa-2" value={typed} maxLength={140} onChange={(event) => setTyped(event.target.value)} />
        </div>
        <button className="btn btn-outline" disabled={disabled}>
          Use it
        </button>
        {current !== fallback && (
          <button type="button" className="btn btn-outline" disabled={disabled} onClick={() => void choose(null)}>
            Go back to the page&apos;s own image
          </button>
        )}
      </form>
    </div>
  );
}
