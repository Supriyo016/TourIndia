"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

/** Fetches and shows the skyline's moving layer once the footer is within 400px of the screen. */
export function LazySkylineActors() {
  const anchor = useRef<HTMLSpanElement>(null);
  const [Actors, setActors] = useState<ComponentType | null>(null);

  useEffect(() => {
    const element = anchor.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void import("./SkylineActors").then((module) => setActors(() => module.SkylineActors));
      },
      { rootMargin: "400px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return Actors ? <Actors /> : <span ref={anchor} aria-hidden className="absolute inset-0" />;
}
