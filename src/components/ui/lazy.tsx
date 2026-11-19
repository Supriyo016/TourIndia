"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import type { DestinationGlobe as Globe } from "@/components/maps/DestinationGlobe";
import type { TourVideo as Video } from "@/components/ui/TourVideo";
import { cn } from "@/lib/utils";

/**
 * Heavy interactive pieces that sit below the fold. Their code is split into separate files and only
 * downloaded when the visitor scrolls near them, so the first screen loads and becomes usable sooner.
 * Each reserves its final size while it waits, so nothing on the page moves when it arrives.
 */

/** True once the element comes within `margin` of the screen. */
function useNear<T extends Element>(margin = "600px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setNear(true);
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [margin, near]);
  return [ref, near] as const;
}

const TourVideo = dynamic(() => import("@/components/ui/TourVideo").then((module) => module.TourVideo), { ssr: false });
const DestinationGlobe = dynamic(() => import("@/components/maps/DestinationGlobe").then((module) => module.DestinationGlobe), { ssr: false });

export function LazyTourVideo(props: ComponentProps<typeof Video>) {
  const [ref, near] = useNear<HTMLDivElement>();
  return (
    <div ref={ref} data-lazy="tour-video">
      {near ? (
        <TourVideo {...props} />
      ) : (
        <div aria-hidden className={cn("mx-auto aspect-video rounded-[var(--radius-lg)] bg-black/80", props.size === "fill" ? "w-full" : "w-full max-w-3xl lg:w-1/2 lg:max-w-none", props.className)} />
      )}
    </div>
  );
}

export function LazyDestinationGlobe(props: ComponentProps<typeof Globe>) {
  const [ref, near] = useNear<HTMLDivElement>();
  return (
    <div ref={ref} className="min-h-[min(30rem,92vw)]">
      {near && <DestinationGlobe {...props} />}
    </div>
  );
}
