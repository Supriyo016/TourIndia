"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { GlobePin } from "./Globe3D";

// three.js loads only when the globe scrolls near the screen.
const Globe3D = dynamic(() => import("./Globe3D"), { ssr: false });

function canRender3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // Skips WebGL on devices that report very little memory or few cores.
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.deviceMemory ?? 8) < 3 || (navigator.hardwareConcurrency ?? 8) < 4) return false;
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

/** Shows the 3D globe when the device can handle it, otherwise a still, styled sphere. */
export function GlobeStage({ pins, className }: { pins: GlobePin[]; className?: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const element = stage.current;
    if (!element || !canRender3D()) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={stage} data-testid="globe-stage" data-3d={show} className={className}>
      {show ? (
        <Globe3D pins={pins} className="size-full" />
      ) : (
        <div aria-hidden className="globe-fallback mx-auto aspect-square h-full max-w-full rounded-full" />
      )}
    </div>
  );
}
