"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./yatri.module.css";
import { YatriOrb } from "./YatriOrb";

// The assistant's code is only downloaded when someone opens it.
const YatriPanel = dynamic(() => import("./YatriPanel"), { ssr: false });

export function YatriLauncher() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => button.current?.focus(), 0);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {!open && (
        <button
          ref={button}
          type="button"
          aria-label="Ask Yatri, the Tour India assistant (Alt+Y)"
          onClick={() => setOpen(true)}
          className={`no-print fixed right-4 bottom-4 z-40 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-brand pr-4 pl-2.5 font-semibold text-on-brand shadow-lg ${styles.launcher}`}
        >
          <YatriOrb /> Ask Yatri
        </button>
      )}
      {open && <YatriPanel onClose={close} />}
    </>
  );
}

