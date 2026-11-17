"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { YatriGuide } from "@/components/characters/YatriGuide";
import styles from "./yatri.module.css";

const loadPanel = () => import("./YatriPanel");
const YatriPanel = dynamic(loadPanel, { ssr: false });

/**
 * The "Ask Yatri" button. The chat's code is fetched quietly once the page is idle,
 * and again on hover or focus, so the panel opens the moment it is clicked.
 */
export function YatriLauncher() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => button.current?.focus(), 0);
  }, []);

  useEffect(() => {
    const preload = () => void loadPanel();
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(preload, { timeout: 4000 }) : globalThis.setTimeout(preload, 2500);
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else globalThis.clearTimeout(idle);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {!open && (
        <button
          ref={button}
          type="button"
          aria-label="Ask Yatri, the Tour India assistant (Alt+Y)"
          onClick={() => setOpen(true)}
          onPointerEnter={() => void loadPanel()}
          onFocus={() => void loadPanel()}
          className={`no-print fixed right-4 bottom-4 z-40 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-brand pr-4 pl-1.5 font-semibold text-on-brand shadow-lg ${styles.launcher}`}
        >
          <span className={`grid size-9 place-items-center overflow-hidden rounded-full bg-white ${styles.launcherFace}`} aria-hidden>
            <YatriGuide className="size-full" />
          </span>
          Ask Yatri
        </button>
      )}
      {open && <YatriPanel onClose={close} />}
    </>
  );
}
