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

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => false);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [hovering, setHovering] = useState(false);
  const [loadAll, setLoadAll] = useState(false);
  const swipeStart = useRef<number | null>(null);
  const paused = userPaused ?? reducedMotion;
  const running = !paused && !hovering && slides.length > 1;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadAll(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const go = useCallback((delta: number) => setIndex((current) => (current + delta + slides.length) % slides.length), [slides.length]);

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
      className="hero-3d relative isolate -mt-[var(--header-h,6.5rem)] flex min-h-svh flex-col justify-center overflow-hidden bg-[#0e3c46] pt-[calc(var(--header-h,6.5rem)+3rem)] pb-40"
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") swipeStart.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (swipeStart.current === null) return;
        const distance = event.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(distance) > SWIPE_PX) go(distance < 0 ? 1 : -1);
      }}
      onKeyDown={(event) => {
        const typing = (event.target as HTMLElement).closest("input, textarea");
        if (typing) return;
        if (event.key === "ArrowRight") go(1);
        if (event.key === "ArrowLeft") go(-1);
      }}
    >
      {slides.map((slide, position) => {
        if (!(position === 0 || loadAll || position === index)) return null;
        const active = position === index;
        return (
          <div
            key={slide.src}
            aria-hidden={!active}
            className={cn("absolute inset-0 -z-20 transition-opacity duration-1000", active ? "opacity-100" : "opacity-0")}
          >
            <Image
              src={slide.src}
              alt={active ? slide.alt : ""}
              fill
              sizes="100vw"
              priority={position === 0}
              placeholder={slide.blur ? "blur" : "empty"}
              blurDataURL={slide.blur}
              className={cn("object-cover", active && running && "ken-burns")}
            />
          </div>
        );
      })}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(8_30_38/0.85)_0%,rgb(8_30_38/0.5)_55%,rgb(8_30_38/0.2)_100%),linear-gradient(0deg,rgb(8_30_38/0.6),transparent_35%)]" />
      <div aria-hidden className="hero-motes -z-10" />

      <div className="container-x">
        <div className="max-w-2xl text-white">
          {current && (
            <p key={index} className="hero-tagline font-display text-[clamp(2.2rem,6vw,4.6rem)] leading-[1.02] font-semibold text-balance text-white">
              {current.tagline}
            </p>
          )}
          <h1 className="mt-4 !font-sans !text-[clamp(1.05rem,2vw,1.3rem)] !leading-snug !font-medium !text-white/90">
            Explore <span className="text-[#f2c84b]">India</span> state by state, and plan the trip that fits you
          </h1>
        </div>

        <div className="mt-7 max-w-2xl">
          <SearchBox variant="hero" placeholder="Search a place, state, festival or dish" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/explore" className="btn btn-accent">Explore the map</Link>
            <Link href="/planner" className="btn btn-on-photo">Plan a trip</Link>
          </div>
        </div>
      </div>

      {current && (
        <div className="container-x absolute inset-x-0 bottom-20 flex flex-wrap items-end justify-between gap-3 text-white">
          <div aria-live={paused ? "polite" : "off"} className="max-w-[60%] text-sm sm:max-w-md">
            <Link href={current.href} className="link-u font-semibold">
              {current.place}
            </Link>
            <span className="text-white/85">, {current.region}</span>
            <p className="truncate text-xs text-white/75">Photo: {current.credit}</p>
          </div>

          <div className="hero-controls ml-auto flex items-center gap-1 rounded-full border border-white/20 bg-black/30 p-1 backdrop-blur-md">
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

          <div className="flex w-full justify-end gap-1.5" role="group" aria-label="Choose a photo">
            {slides.map((slide, position) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`${slide.place}, ${slide.region}`}
                aria-current={position === index}
                onClick={() => setIndex(position)}
                className="group flex h-6 items-center"
              >
                <span className={cn("block h-1 rounded-full bg-white/40 transition-all duration-300 group-hover:bg-white/80", position === index ? "w-8 bg-[#f2a33c]" : "w-3")} />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
