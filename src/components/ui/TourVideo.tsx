"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Settings2, Volume2, VolumeX } from "lucide-react";
import { pickRendition, stepDown, tourVideo, type VideoHeight } from "@/data/tour-video";
import { cn } from "@/lib/utils";

type Quality = "auto" | VideoHeight;
type NetworkInfo = { effectiveType?: string; downlink?: number; saveData?: boolean; addEventListener?: (type: "change", listener: () => void) => void; removeEventListener?: (type: "change", listener: () => void) => void };

const STALLS_BEFORE_STEP_DOWN = 2;
const STALL_WINDOW_MS = 20_000;
const network = () => (navigator as Navigator & { connection?: NetworkInfo }).connection;
const srcFor = (height: VideoHeight) => tourVideo.renditions.find((item) => item.height === height)!.src;

/**
 * The video tour. Plays when it scrolls into view, with sound where the browser allows it
 * (otherwise muted, with a "Sound on" button). In Auto it picks a size from the network and
 * steps down if playback stalls; the menu lets the viewer choose a size instead.
 */
/** "third": centred, a third of the screen tall (the video tour section). "fill": the width of its container. */
export function TourVideo({ size = "third", className }: { size?: "third" | "fill"; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [quality, setQuality] = useState<Quality>("auto");
  const [height, setHeight] = useState<VideoHeight | null>(null);
  const [muted, setMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  // The poster is a large image far down the page, so it's only fetched when the video comes near.
  const [near, setNear] = useState(false);
  const stalls = useRef<number[]>([]);
  const current = useRef<VideoHeight | null>(null);

  // Swaps the source and carries on from the same moment.
  const switchTo = useCallback((next: VideoHeight) => {
    const element = video.current;
    if (!element) return;
    if (current.current === next) return;
    const time = element.currentTime;
    const wasPlaying = current.current !== null && !element.paused;
    current.current = next;
    setHeight(next);
    element.src = srcFor(next);
    if (time > 0) {
      // preload="none" would stop the new file before its metadata, so the seek would never happen.
      element.preload = "auto";
      element.addEventListener(
        "loadedmetadata",
        () => {
          element.currentTime = time;
          if (wasPlaying) void element.play().catch(() => undefined);
        },
        { once: true },
      );
      element.load();
    }
  }, []);

  const autoPick = useCallback(() => {
    const element = video.current;
    if (element) switchTo(pickRendition(network(), element.clientHeight * window.devicePixelRatio));
  }, [switchTo]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setNear(true);
      },
      { rootMargin: "800px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Plays in view, pauses out of view. Tries sound first, then falls back to muted.
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    // Sets a source straight away so the play button works; preload="none" means nothing downloads yet.
    autoPick();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          element.pause();
          return;
        }
        if (reduced) return;
        element.muted = false;
        element.play().then(
          () => setMuted(false),
          () => {
            element.muted = true;
            setMuted(true);
            void element.play().catch(() => undefined);
          },
        );
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [autoPick]);

  // Auto quality: re-pick when the network changes; step down after repeated stalls.
  useEffect(() => {
    const element = video.current;
    if (!element || quality !== "auto") return;
    const connection = network();
    const onWaiting = () => {
      if (element.currentTime < 0.5) return;
      const now = performance.now();
      stalls.current = [...stalls.current.filter((time) => now - time < STALL_WINDOW_MS), now];
      if (stalls.current.length >= STALLS_BEFORE_STEP_DOWN) {
        stalls.current = [];
        if (current.current && current.current !== 360) switchTo(stepDown(current.current));
      }
    };
    element.addEventListener("waiting", onWaiting);
    connection?.addEventListener?.("change", autoPick);
    return () => {
      element.removeEventListener("waiting", onWaiting);
      connection?.removeEventListener?.("change", autoPick);
    };
  }, [quality, autoPick, switchTo]);

  const choose = (next: Quality) => {
    setQuality(next);
    setMenuOpen(false);
    stalls.current = [];
    if (next === "auto") autoPick();
    else switchTo(next);
  };

  const toggleSound = () => {
    const element = video.current;
    if (!element) return;
    element.muted = !element.muted;
    setMuted(element.muted);
    if (element.paused) void element.play().catch(() => undefined);
  };

  return (
    <div className={cn("relative mx-auto aspect-video", size === "third" ? "w-full max-w-3xl lg:w-[50%]" : "w-full", className)}>
      <video
        ref={video}
        data-testid="tour-video"
        data-quality={height ?? ""}
        controls
        loop
        playsInline
        muted
        preload="none"
        poster={near ? tourVideo.poster : undefined}
        aria-label={tourVideo.title}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        className="size-full rounded-[var(--radius-lg)] bg-black object-contain shadow-lg"
      >
        {/* The film has music but no speech, so the caption track says so. */}
        <track kind="captions" srcLang="en" label="English" src="/videos/tour-india.en.vtt" />
        Your browser can&apos;t play this video.
      </video>

      <div className="absolute top-2 right-2 flex gap-1.5">
        <button type="button" onClick={toggleSound} className="glass-chip" aria-pressed={!muted}>
          {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
          {muted ? "Sound on" : "Mute"}
        </button>
        <div className="relative">
          <button type="button" className="glass-chip" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <Settings2 className="size-4" aria-hidden />
            <span>{quality === "auto" ? `Auto${height ? ` (${height}p)` : ""}` : `${quality}p`}</span>
          </button>
          {menuOpen && (
            <div role="menu" aria-label="Video quality" className="glass-panel anim-menu absolute right-0 top-full z-10 mt-1 w-36 p-1">
              {(["auto", ...tourVideo.renditions.map((item) => item.height)] as Quality[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="menuitemradio"
                  aria-checked={quality === option}
                  onClick={() => choose(option)}
                  className="flex min-h-10 w-full items-center rounded-[var(--radius-md)] px-3 text-left text-sm text-ink hover:bg-surface-2 aria-checked:font-semibold aria-checked:text-brand"
                >
                  {option === "auto" ? "Auto" : `${option}p`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
