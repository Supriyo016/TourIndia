"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A horizontal carousel: native touch and trackpad scrolling with snap points, arrow buttons on
 * pointer devices, edge fades that show there is more, and keyboard scrolling once focused.
 */
export function ScrollRail({ children, label, className, as: Tag = "ul" }: { children: ReactNode; label: string; className?: string; as?: "ul" | "ol" }) {
  const rail = useRef<HTMLOListElement & HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => {
      const max = element.scrollWidth - element.clientWidth;
      setEdges({ start: element.scrollLeft <= 4, end: element.scrollLeft >= max - 4 });
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const page = (direction: 1 | -1) => {
    const element = rail.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({ left: direction * element.clientWidth * 0.85, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className={cn("rail-wrap relative", className)} data-start={edges.start || undefined} data-end={edges.end || undefined}>
      <Tag ref={rail} className="rail" tabIndex={0} aria-label={label}>
        {children}
      </Tag>
      <button type="button" className="rail-arrow left-0 -translate-x-1/3" onClick={() => page(-1)} aria-label="Scroll back" hidden={edges.start}>
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button type="button" className="rail-arrow right-0 translate-x-1/3" onClick={() => page(1)} aria-label="Scroll forward" hidden={edges.end}>
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </div>
  );
}
