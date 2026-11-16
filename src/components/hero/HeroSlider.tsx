"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { SearchBox } from "@/components/search/SearchBox";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  blur?: string;
  alt: string;
  place: string;
  region: string;
  href: string;
  credit: string;
  /** Changes with the slide. */
  tagline: string;
}

const INTERVAL = 7000;
const SWIPE_PX = 50;
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(listener: () => void) {
  const media = window.matchMedia(MOTION_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

const prefersReducedMotion = () => window.matchMedia(MOTION_QUERY).matches;
const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Full-bleed photo slider. The height is fixed by the viewport, never by the photo,
 * so every slide has the same frame. Slides change with a 3D turn, and the photo
 * follows the pointer slightly for depth.
 */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [{ index, previous }, setSlide] = useState<{ index: number; previous: number | null }>({ index: 0, previous: null });
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => false);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [warm, setWarm] = useState(false);
  const swipeStart = useRef<number | null>(null);
  const frame = useRef<number>(0);
  const paused = userPaused ?? reducedMotion;
  // Holds still while the pointer or keyboard focus is inside, so nothing moves while someone reads or types.
  const running = !paused && !hovering && !focused && slides.length > 1;

  useEffect(() => {
    const timer = window.setTimeout(() => setWarm(true), 1500);
    const pending = frame;
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(pending.current);
    };
  }, []);

  const show = useCallback(
    (next: number) =>
      setSlide((state) => {
        const target = (next + slides.length) % slides.length;
        return target === state.index ? state : { index: target, previous: state.index };
      }),
    [slides.length],
  );
  const go = useCallback((delta: number) => setSlide((state) => ({ index: (state.index + delta + slides.length) % slides.length, previous: state.index })), [slides.length]);

  // Restarts on every slide change, so a manual change gets a full interval too.
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => go(1), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [running, index, go]);

  const current = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Destinations across India"
      className="hero-stage relative isolate -mt-[var(--header-h,4.5rem)] h-[clamp(34rem,100svh,60rem)] overflow-hidden bg-[#0e3c46] text-white"
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={(event) => {
        setHovering(false);
        event.currentTarget.style.setProperty("--px", "0");
        event.currentTarget.style.setProperty("--py", "0");
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || reducedMotion) return;
        const target = event.currentTarget;
        const { left, top, width, height } = target.getBoundingClientRect();
        const x = (event.clientX - left) / width - 0.5;
        const y = (event.clientY - top) / height - 0.5;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
          target.style.setProperty("--px", x.toFixed(3));
          target.style.setProperty("--py", y.toFixed(3));
        });
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") swipeStart.current = event.clientX;
      }}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      onPointerCancel={() => {
        swipeStart.current = null;
      }}
      onPointerUp={(event) => {
        if (swipeStart.current === null) return;
        const distance = event.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(distance) > SWIPE_PX) go(distance < 0 ? 1 : -1);
      }}
      onKeyDown={(event) => {
        if ((event.target as HTMLElement).closest("input, textarea")) return;
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
    >
      <div className="hero-scene absolute inset-0 -z-20">
        {slides.map((slide, position) => {
          // Only the photos in play are fetched: the current one, the one leaving, and (once the page has settled) the next.
          const next = (index + 1) % slides.length;
          if (!(position === 0 || position === index || position === previous || (warm && position === next))) return null;
          const state = position === index ? "active" : position === previous ? "leaving" : "idle";
          return (
            <div key={slide.src} aria-hidden={state !== "active"} className="hero-slide" data-state={state}>
              <div className="hero-photo">
                <Image
                  src={slide.src}
                  alt={state === "active" ? slide.alt : ""}
                  fill
                  sizes="100vw"
                  priority={position === 0}
                  placeholder={slide.blur ? "blur" : "empty"}
                  blurDataURL={slide.blur}
                  className={cn("object-cover", state === "active" && running && "ken-burns")}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Shade only where the text sits, so the photo stays the subject. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(6_24_30/0.78)_0%,rgb(6_24_30/0.35)_32%,transparent_58%),linear-gradient(90deg,rgb(6_24_30/0.45)_0%,transparent_45%)]" />
      <div aria-hidden className="hero-motes -z-10" />

      <div className="container-x absolute inset-x-0 bottom-0 pb-6 sm:pb-8">
        <div className="grid items-end gap-5 lg:grid-cols-[minmax(0,34rem)_1fr]">
          <div>
            {current && (
              <p key={index} className="hero-tagline line-clamp-2 min-h-[2.3em] font-display text-[clamp(1.55rem,3.4vw,2.75rem)] leading-[1.12] font-semibold text-balance text-white [text-shadow:0_2px_18px_rgb(0_0_0/0.45)]">
                {current.tagline}
              </p>
            )}
            <h1 className="mt-1.5 !font-sans !text-[clamp(0.95rem,1.5vw,1.1rem)] !leading-snug !font-medium !text-white/90">
              Explore <span className="text-[#f2c84b]">India</span> state by state, and plan the trip that fits you
            </h1>
            <div className="mt-4">
              <SearchBox variant="hero" placeholder="Search a place, state, festival or dish" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/explore" className="btn btn-accent">Explore the map</Link>
              <Link href="/planner" className="btn btn-on-photo">Plan a trip</Link>
            </div>
          </div>

          {current && (
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <div aria-live={paused ? "polite" : "off"} className="text-sm lg:text-right">
                <Link href={current.href} className="link-u font-semibold">{current.place}</Link>
                <span className="text-white/85">, {current.region}</span>
                <p className="max-w-xs truncate text-xs text-white/75">Photo: {current.credit}</p>
              </div>
              <div className="hero-controls flex items-center gap-1 rounded-full border border-white/20 bg-black/30 p-1 backdrop-blur-md">
                <span className="px-2 text-sm font-semibold tabular-nums" aria-label={`Slide ${index + 1} of ${slides.length}`}>
                  {pad(index + 1)}
                  <span className="text-white/60"> / {pad(slides.length)}</span>
                </span>
                <button type="button" className="hero-btn" aria-label="Previous photo" onClick={() => go(-1)}>
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button type="button" className="hero-btn relative" aria-label={paused ? "Resume slideshow" : "Pause slideshow"} onClick={() => setUserPaused(!paused)}>
                  {/* Fills over the interval until the next slide. */}
                  <svg aria-hidden viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
                    <circle cx="22" cy="22" r="19" fill="none" stroke="rgb(255 255 255 / 0.2)" strokeWidth="2.5" />
                    {running && (
                      <circle key={index} cx="22" cy="22" r="19" fill="none" stroke="#f2a33c" strokeWidth="2.5" strokeLinecap="round" pathLength={1} className="hero-ring" style={{ animationDuration: `${INTERVAL}ms` }} />
                    )}
                  </svg>
                  {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
                </button>
                <button type="button" className="hero-btn" aria-label="Next photo" onClick={() => go(1)}>
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </div>
              <div className="flex gap-1" role="group" aria-label="Choose a photo">
                {slides.map((slide, position) => (
                  <button
                    key={slide.src}
                    type="button"
                    aria-label={`${slide.place}, ${slide.region}`}
                    aria-current={position === index}
                    onClick={() => show(position)}
                    className="group flex h-6 items-center"
                  >
                    <span className={cn("block h-1 rounded-full bg-white/40 transition-[width,background-color] duration-300 group-hover:bg-white/80", position === index ? "w-7 bg-[#f2a33c]" : "w-2.5")} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
