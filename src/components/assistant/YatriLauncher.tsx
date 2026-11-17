"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { MessageCircle } from "lucide-react";
import styles from "./yatri.module.css";

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

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => button.current?.focus(), 0);
  }, []);

  const warmUp = useCallback(() => {
    void loadPanel();
    void loadFace().then((face) => setFace(() => face));
  }, []);

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
          className={`no-print fixed right-4 bottom-4 z-40 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-brand pr-4 pl-1.5 font-semibold text-on-brand shadow-lg ${styles.launcher}`}
        >
          <span className={`grid size-9 place-items-center overflow-hidden rounded-full bg-white ${styles.launcherFace}`} aria-hidden>
            {Face ? <Face className="size-full" /> : <MessageCircle className="size-5 text-brand" />}
          </span>
          Ask Yatri
        </button>
      )}
      {open && <YatriPanel onClose={close} />}
    </>
  );
}
