"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Captions, Gauge, Maximize, Minimize, Pause, Play, Settings2, Volume1, Volume2, VolumeX } from "lucide-react";
import { pickRendition, stepDown, tourVideo, type VideoHeight } from "@/data/tour-video";
import { cn } from "@/lib/utils";

type Quality = "auto" | VideoHeight;
type Menu = "speed" | "quality" | null;
type NetworkInfo = { effectiveType?: string; downlink?: number; saveData?: boolean; addEventListener?: (type: "change", listener: () => void) => void; removeEventListener?: (type: "change", listener: () => void) => void };

const STALLS_BEFORE_STEP_DOWN = 2;
const STALL_WINDOW_MS = 20_000;
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const network = () => (navigator as Navigator & { connection?: NetworkInfo }).connection;
const srcFor = (height: VideoHeight) => tourVideo.renditions.find((item) => item.height === height)!.src;
const clock = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

/**
 * The video tour, in a YouTube-style player. It plays when it scrolls into view (with sound where the
 * browser allows, otherwise muted). In Auto it picks a size from the network and steps down if playback
 * stalls; the quality menu lets the viewer choose. "third" is the centred home-page size; "fill" takes its container's width.
 */
export function TourVideo({ size = "third", className }: { size?: "third" | "fill"; className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [quality, setQuality] = useState<Quality>("auto");
  const [height, setHeight] = useState<VideoHeight | null>(null);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [captions, setCaptions] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [menu, setMenu] = useState<Menu>(null);
  const [idle, setIdle] = useState(false);
  // The poster is a large image far down the page, so it's only fetched when the video comes near.
  const [near, setNear] = useState(false);
  const stalls = useRef<number[]>([]);
  const current = useRef<VideoHeight | null>(null);
  const idleTimer = useRef<number | undefined>(undefined);
  const speedRef = useRef(1);

  // Swaps the source and carries on from the same moment.
  const switchTo = useCallback((next: VideoHeight) => {
    const element = video.current;
    if (!element || current.current === next) return;
    const at = element.currentTime;
    const wasPlaying = current.current !== null && !element.paused;
    current.current = next;
    setHeight(next);
    element.src = srcFor(next);
    if (at > 0) {
      // preload="none" would stop the new file before its metadata, so the seek would never happen.
      element.preload = "auto";
      element.addEventListener(
        "loadedmetadata",
        () => {
          element.currentTime = at;
          element.playbackRate = speedRef.current;
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
        element.play().catch(() => {
          element.muted = true;
          void element.play().catch(() => undefined);
        });
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
      stalls.current = [...stalls.current.filter((at) => now - at < STALL_WINDOW_MS), now];
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

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  const wake = () => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2600);
  };

  const togglePlay = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused) void element.play().catch(() => undefined);
    else element.pause();
  };

  const toggleMute = () => {
    const element = video.current;
    if (!element) return;
    element.muted = !element.muted;
    if (!element.muted && element.volume === 0) element.volume = 0.6;
  };

  const seekBy = (seconds: number) => {
    const element = video.current;
    if (element) element.currentTime = Math.min(Math.max(0, element.currentTime + seconds), element.duration || 0);
  };

  const toggleFullscreen = () => {
    const box = frame.current;
    const element = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!box || !element) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (box.requestFullscreen) void box.requestFullscreen().catch(() => undefined);
    else element.webkitEnterFullscreen?.();
  };

  const toggleCaptions = () => {
    const element = video.current;
    const track = element?.textTracks[0];
    if (!element || !track) return;
    const on = track.mode !== "showing";
    element.textTracks[0]!.mode = on ? "showing" : "hidden";
    setCaptions(on);
  };

  const chooseQuality = (next: Quality) => {
    setQuality(next);
    setMenu(null);
    stalls.current = [];
    if (next === "auto") autoPick();
    else switchTo(next);
  };

  const chooseSpeed = (next: number) => {
    speedRef.current = next;
    setSpeed(next);
    setMenu(null);
    if (video.current) video.current.playbackRate = next;
  };

  const onKey = (event: ReactKeyboardEvent) => {
    if ((event.target as HTMLElement).closest("[role=menu]")) return;
    const key = event.key.toLowerCase();
    const isRange = (event.target as HTMLElement).tagName === "INPUT";
    const actions: Record<string, () => void> = {
      k: togglePlay,
      m: toggleMute,
      f: toggleFullscreen,
      c: toggleCaptions,
      j: () => seekBy(-10),
      l: () => seekBy(10),
      ...(isRange ? {} : { " ": togglePlay, arrowleft: () => seekBy(-5), arrowright: () => seekBy(5) }),
    };
    const action = actions[key];
    if (!action || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    action();
    wake();
  };

  const progress = duration ? (time / duration) * 100 : 0;
  const loaded = duration ? (buffered / duration) * 100 : 0;
  const shownVolume = muted ? 0 : volume;
  const VolumeIcon = shownVolume === 0 ? VolumeX : shownVolume < 0.5 ? Volume1 : Volume2;
  const chrome = !playing || !idle || menu !== null;

  return (
    <div
      ref={frame}
      onKeyDown={onKey}
      onPointerMove={wake}
      onPointerLeave={() => playing && setIdle(true)}
      className={cn(
        "yt-player group relative mx-auto aspect-video overflow-hidden bg-black shadow-[0_24px_60px_-20px_rgb(0_0_0/0.55)] ring-1 ring-white/10",
        fullscreen ? "rounded-none" : "rounded-[var(--radius-lg)]",
        size === "third" ? "w-full max-w-3xl lg:w-1/2 lg:max-w-none" : "w-full",
        !chrome && "cursor-none",
        className,
      )}
    >
      <video
        ref={video}
        data-testid="tour-video"
        data-quality={height ?? ""}
        loop
        playsInline
        muted
        preload="none"
        poster={near ? tourVideo.poster : undefined}
        aria-label={tourVideo.title}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          wake();
        }}
        onPause={() => setPlaying(false)}
        onVolumeChange={(event) => {
          setMuted(event.currentTarget.muted);
          setVolume(event.currentTarget.volume);
        }}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onProgress={(event) => {
          const ranges = event.currentTarget.buffered;
          if (ranges.length) setBuffered(ranges.end(ranges.length - 1));
        }}
        className="size-full object-contain"
      >
        {/* The film has music but no speech, so the caption track says so. */}
        <track kind="captions" srcLang="en" label="English" src="/videos/tour-india.en.vtt" />
        Your browser can&apos;t play this video.
      </video>

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={started ? "Resume video" : "Play video"}
          className="absolute inset-0 m-auto grid size-[4.5rem] cursor-pointer place-items-center rounded-full bg-[rgb(220_38_38/0.92)] text-white shadow-xl transition-transform hover:scale-105 focus-visible:scale-105 sm:size-20"
        >
          <Play className="ml-1 size-9 fill-current" aria-hidden />
        </button>
      )}

      {!started && (
        <p className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-4 pt-3 pb-8 text-left text-sm font-semibold text-white sm:text-base">
          {tourVideo.title}
        </p>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2 pt-10 pb-1.5 text-white transition-opacity duration-300 sm:px-3",
          chrome ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(time, duration || 0)}
          aria-valuetext={`${clock(time)} of ${clock(duration)}`}
          onChange={(event) => {
            const element = video.current;
            if (element) element.currentTime = Number(event.target.value);
          }}
          className="yt-range yt-seek w-full"
          style={{ "--fill": `${progress}%`, "--loaded": `${loaded}%` } as CSSProperties}
        />
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button type="button" className="yt-btn" onClick={togglePlay} aria-label={playing ? "Pause (k)" : "Play (k)"}>
            {playing ? <Pause className="size-5 fill-current" aria-hidden /> : <Play className="size-5 fill-current" aria-hidden />}
          </button>
          <div className="group/vol flex items-center">
            <button type="button" className="yt-btn" onClick={toggleMute} aria-label={muted ? "Unmute (m)" : "Mute (m)"} aria-pressed={muted}>
              <VolumeIcon className="size-5" aria-hidden />
            </button>
            <input
              type="range"
              aria-label="Volume"
              min={0}
              max={1}
              step={0.05}
              value={shownVolume}
              onChange={(event) => {
                const element = video.current;
                if (!element) return;
                element.volume = Number(event.target.value);
                element.muted = element.volume === 0;
              }}
              className="yt-range yt-volume w-0 opacity-0 transition-[width,opacity] duration-200 group-hover/vol:w-20 group-hover/vol:opacity-100 focus-visible:w-20 focus-visible:opacity-100 max-sm:hidden"
              style={{ "--fill": `${shownVolume * 100}%` } as CSSProperties}
            />
          </div>
          <span className="ml-1 text-xs tabular-nums text-white/90 sm:text-sm">
            {clock(time)} <span className="text-white/60">/ {clock(duration)}</span>
          </span>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <button type="button" className="yt-btn" onClick={toggleCaptions} aria-label="Captions (c)" aria-pressed={captions}>
              <Captions className={cn("size-5", captions && "text-[rgb(248_113_113)]")} aria-hidden />
            </button>
            <div className="relative">
              <button type="button" className="yt-btn gap-1 px-2 text-xs font-semibold" aria-haspopup="menu" aria-expanded={menu === "speed"} aria-label={`Playback speed ${speed}x`} onClick={() => setMenu(menu === "speed" ? null : "speed")}>
                <Gauge className="size-5" aria-hidden />
                <span className="max-sm:hidden">{speed}x</span>
              </button>
              {menu === "speed" && (
                <div role="menu" aria-label="Playback speed" className="yt-menu">
                  {SPEEDS.map((option) => (
                    <button key={option} type="button" role="menuitemradio" aria-checked={speed === option} onClick={() => chooseSpeed(option)} className="yt-menu-item">
                      {option === 1 ? "Normal" : `${option}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button type="button" className="yt-btn gap-1 px-2 text-xs font-semibold" aria-haspopup="menu" aria-expanded={menu === "quality"} onClick={() => setMenu(menu === "quality" ? null : "quality")}>
                <Settings2 className="size-5" aria-hidden />
                <span>{quality === "auto" ? `Auto${height ? ` (${height}p)` : ""}` : `${quality}p`}</span>
              </button>
              {menu === "quality" && (
                <div role="menu" aria-label="Video quality" className="yt-menu">
                  {(["auto", ...tourVideo.renditions.map((item) => item.height)] as Quality[]).map((option) => (
                    <button key={option} type="button" role="menuitemradio" aria-checked={quality === option} onClick={() => chooseQuality(option)} className="yt-menu-item">
                      {option === "auto" ? "Auto" : `${option}p`}
                      {option === 720 && <sup className="ml-1 text-[0.6rem] font-bold text-[rgb(248_113_113)]">HD</sup>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="yt-btn" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit full screen (f)" : "Full screen (f)"}>
              {fullscreen ? <Minimize className="size-5" aria-hidden /> : <Maximize className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
