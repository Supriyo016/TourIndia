"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CloudRain, Copy, Link2, Share2 } from "lucide-react";
import { isStringList, STORAGE_KEYS, useStoredValue } from "@/hooks/use-stored-value";
import { hasPreferenceConsent } from "@/lib/consent";

interface ForecastDay {
  date: string;
  max: number;
  min: number;
  rain: number | null;
}

export function WeatherPanel({ slug }: { slug: string }) {
  const [days, setDays] = useState<ForecastDay[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/weather?slug=${encodeURIComponent(slug)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("failed"))))
      .then((data: { days: ForecastDay[] }) => live && setDays(data.days))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [slug]);

  if (failed) {
    return <p className="text-ink-2">The forecast is unavailable right now. The seasonal guidance above still applies.</p>;
  }
  if (!days) {
    return (
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-busy="true" aria-label="Loading forecast">
        {Array.from({ length: 5 }, (_, index) => (
          <li key={index} className="h-[5.5rem] animate-pulse rounded-[var(--radius-md)] bg-surface-2" />
        ))}
      </ul>
    );
  }
  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {days.map((day) => (
          <li key={day.date} className="rounded-[var(--radius-md)] border border-line bg-surface p-3">
            <p className="text-sm font-semibold">
              {new Date(`${day.date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
            </p>
            <p className="text-lg font-semibold">
              {Math.round(day.max)}° <span className="text-base font-normal text-muted">/ {Math.round(day.min)}°</span>
            </p>
            {day.rain !== null && (
              <p className="flex items-center gap-1 text-sm text-muted">
                <CloudRain className="size-3.5" aria-hidden /> {day.rain}% rain
              </p>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">
        Live forecast from{" "}
        <a className="underline" href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
          Open-Meteo
        </a>{" "}
        (CC BY 4.0), in °C, refreshed hourly.
      </p>
    </>
  );
}

const EMPTY: string[] = [];

/** Records the visit for the Recently Viewed list. Stays on this device. */
export function TrackRecentlyViewed({ slug }: { slug: string }) {
  const [, setRecent] = useStoredValue<string[]>(STORAGE_KEYS.recent, EMPTY, isStringList);
  useEffect(() => {
    if (hasPreferenceConsent()) setRecent((current) => [slug, ...current.filter((item) => item !== slug)].slice(0, 12));
  }, [slug, setRecent]);
  return null;
}

const subscribeNever = () => () => undefined;

export function ShareBar({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(subscribeNever, () => window.location.origin, () => "");
  const canShare = useSyncExternalStore(subscribeNever, () => typeof navigator.share === "function", () => false);
  const url = `${origin}${path}`;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { label: "X", href: `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn btn-outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          } catch {
            window.prompt("Copy this link", url);
          }
        }}
      >
        {copied ? <Link2 className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      </button>
      {canShare && (
        <button type="button" className="btn btn-outline" onClick={() => navigator.share({ title, url }).catch(() => undefined)}>
          <Share2 className="size-4" aria-hidden /> Share
        </button>
      )}
      {targets.map((target) => (
        <a key={target.label} href={target.href} target="_blank" rel="noopener noreferrer" className="chip">
          {target.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
    </div>
  );
}
