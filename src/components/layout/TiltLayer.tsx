"use client";

import { useEffect } from "react";

const MAX_DEG = 6;

/**
 * One listener for the whole page: any element marked `data-tilt` leans towards a mouse pointer in 3D.
 * Off for touch and for reduced motion. The styles live in globals.css.
 */
export function TiltLayer() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(hover: hover)").matches) return;
    let current: HTMLElement | null = null;
    let frame = 0;

    const reset = (element: HTMLElement | null) => {
      element?.style.removeProperty("--rx");
      element?.style.removeProperty("--ry");
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = (event.target as Element | null)?.closest?.<HTMLElement>("[data-tilt]") ?? null;
      if (target !== current) {
        reset(current);
        current = target;
      }
      if (!target) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = target.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        target.style.setProperty("--rx", `${(-y * MAX_DEG).toFixed(2)}deg`);
        target.style.setProperty("--ry", `${(x * MAX_DEG).toFixed(2)}deg`);
      });
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      reset(current);
    };
  }, []);

  return null;
}
