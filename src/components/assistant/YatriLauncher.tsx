"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { MessageCircle } from "lucide-react";
import styles from "./yatri.module.css";
import { track } from "@/lib/analytics/track";

const loadPanel = () => import("./YatriPanel");
const YatriPanel = dynamic(loadPanel, { ssr: false });
const loadFace = () => import("@/components/characters/YatriGuide").then((module) => module.YatriGuide);

/** Runs `task` once the page has fully loaded and the browser is idle, so it never competes with the page itself. */
function afterLoad(task: () => void): () => void {
  let cancelled = false;
  let idle = 0;
  const schedule = () => {
    if (cancelled) return;
    if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(task, { timeout: 3000 });
    else idle = window.setTimeout(task, 1500);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    else window.clearTimeout(idle);
  };
}

/**
 * The "Ask Yatri" button. It starts with a chat icon; once the page has loaded, Yatri's face and
 * the chat's code are fetched quietly (and again on hover or focus), so the panel opens the moment
 * it is clicked without slowing the page's first paint.
 */
export function YatriLauncher() {
  const [open, setOpen] = useState(false);
  const [Face, setFace] = useState<ComponentType<{ className?: string }> | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  // Over the home slider the launcher shrinks to a round button and lifts above the slider's controls.
  const [overHero, setOverHero] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => button.current?.focus(), 0);
  }, []);

  const warmUp = useCallback(() => {
    void loadPanel();
    void loadFace().then((face) => setFace(() => face));
  }, []);

  useEffect(() => {
    if (open) track("yatri_open");
  }, [open]);

  useEffect(() => {
    const hero = document.querySelector(".hero-stage");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setOverHero(Boolean(entry?.isIntersecting)), { rootMargin: "-78% 0px 0px 0px" });
    observer.observe(hero);
    return () => {
      observer.disconnect();
      setOverHero(false);
    };
  }, [pathname]);

  useEffect(() => {
    const cancel = afterLoad(warmUp);
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancel();
      window.removeEventListener("keydown", onKey);
    };
  }, [warmUp]);

  return (
    <>
      {!open && (
        <button
          ref={button}
          type="button"
          aria-label="Ask Yatri, the Tour India assistant (Alt+Y)"
          onClick={() => setOpen(true)}
          onPointerEnter={warmUp}
          onFocus={warmUp}
          data-compact={overHero || undefined}
          className={`no-print group fixed right-4 bottom-20 z-40 inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full bg-brand pr-3.5 pl-1.5 text-sm font-semibold text-on-brand shadow-lg ring-1 ring-white/15 transition-[bottom,padding] duration-300 sm:bottom-5 sm:h-12 sm:gap-2 sm:pr-4 sm:text-base data-[compact]:pr-1.5 sm:data-[compact]:pr-1.5 lg:data-[compact]:bottom-44 ${styles.launcher}`}
        >
          <span className={`grid size-8 place-items-center overflow-hidden rounded-full bg-white sm:size-9 ${styles.launcherFace}`} aria-hidden>
            {Face ? <Face className="size-full" /> : <MessageCircle className="size-5 text-brand" />}
          </span>
          <span className={overHero ? "sr-only" : undefined}>Ask Yatri</span>
        </button>
      )}
      {open && <YatriPanel onClose={close} />}
    </>
  );
}
