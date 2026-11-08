"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
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
}

const INTERVAL = 7000;
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(listener: () => void) {
  const media = window.matchMedia(MOTION_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

const prefersReducedMotion = () => window.matchMedia(MOTION_QUERY).matches;

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => false);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reducedMotion;
  const [hovering, setHovering] = useState(false);
  const [loadAll, setLoadAll] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadAll(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const go = useCallback((delta: number) => setIndex((current) => (current + delta + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || hovering || slides.length < 2) return;
    const timer = window.setInterval(() => go(1), INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, hovering, go, slides.length]);

  const current = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Destinations across India"
      className="relative isolate flex min-h-[calc(100svh-4.5rem)] flex-col justify-center overflow-hidden bg-[#0e3c46] py-12"
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      {slides.map((slide, position) => {
        const shouldLoad = position === 0 || loadAll || position === index;
        if (!shouldLoad) return null;
        return (
          <div
            key={slide.src}
            aria-hidden={position !== index}
            className={cn("absolute inset-0 -z-20 transition-opacity duration-1000", position === index ? "opacity-100" : "opacity-0")}
          >
            <Image
              src={slide.src}
              alt={position === index ? slide.alt : ""}
              fill
              sizes="100vw"
              priority={position === 0}
              placeholder={slide.blur ? "blur" : "empty"}
              blurDataURL={slide.blur}
              className="object-cover"
            />
          </div>
        );
      })}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(8_30_38/0.82)_0%,rgb(8_30_38/0.5)_55%,rgb(8_30_38/0.25)_100%)]" />

      <div className="container-x">
        <div className="hero-text max-w-2xl text-white">
          <p className="eyebrow !text-[#f7c26b]">India, state by state</p>
          <h1 className="!text-white">
            Explore our <span className="text-[#e6c61a]">India</span>, and plan the trip that fits you
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Guides to every state and Union Territory, a festival calendar, and a planner that shows how it reaches its estimates.
          </p>
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
        <div className="container-x absolute inset-x-0 bottom-4 flex flex-wrap items-end justify-between gap-3 text-white">
          <div aria-live={paused ? "polite" : "off"} className="min-w-0">
            <Link href={current.href} className="link-u font-semibold">
              {current.place}
            </Link>
            <span className="text-white/80">, {current.region}</span>
            <p className="max-w-md truncate text-xs text-white/70">Photo: {current.credit}</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className="icon-btn !text-white hover:!bg-white/20" aria-label="Previous photo" onClick={() => go(-1)}>
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <button
              type="button"
              className="icon-btn !text-white hover:!bg-white/20"
              aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
              onClick={() => setUserPaused(!paused)}
            >
              {paused ? <Play className="size-5" aria-hidden /> : <Pause className="size-5" aria-hidden />}
            </button>
            <button type="button" className="icon-btn !text-white hover:!bg-white/20" aria-label="Next photo" onClick={() => go(1)}>
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
