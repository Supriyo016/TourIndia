"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";

/**
 * The animated characters are decoration, so pages don't carry them. Each one starts as an empty
 * box of the same size and shape; the drawings and their styles download as one small file when
 * the first character comes near the screen. This keeps them out of the HTML, the page data and the
 * inlined styles, which matters most on slow phones.
 *
 * Use these exports exactly like the ones in ./Characters.
 */

type Props = { className?: string; animated?: boolean };
type Module = typeof import("./Characters");
type Name = { [K in keyof Module]: Module[K] extends ComponentType<Props> ? K : never }[keyof Module];

let loaded: Module | null = null;
let loading: Promise<Module> | null = null;
const load = () => (loading ??= import("./Characters").then((module) => (loaded = module)));

function lazyCharacter(name: Name, viewBox: string) {
  const [, , width, height] = viewBox.split(" ").map(Number);
  function LazyCharacter({ className, animated }: Props) {
    const box = useRef<HTMLSpanElement>(null);
    const [Drawing, setDrawing] = useState<ComponentType<Props> | null>(null);

    useEffect(() => {
      if (loaded) {
        setDrawing(() => loaded![name] as ComponentType<Props>);
        return;
      }
      const element = box.current;
      if (!element) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          void load().then((module) => setDrawing(() => module[name] as ComponentType<Props>));
        },
        { rootMargin: "400px" },
      );
      observer.observe(element);
      return () => observer.disconnect();
    }, []);

    if (Drawing) return <Drawing className={className} animated={animated} />;
    return <span ref={box} aria-hidden className={cn("inline-block", className)} style={{ aspectRatio: `${width} / ${height}` }} />;
  }
  LazyCharacter.displayName = `Lazy${name}`;
  return LazyCharacter;
}

export const ElephantCharacter = lazyCharacter("ElephantCharacter", "0 0 160 150");
export const BackpackerCharacter = lazyCharacter("BackpackerCharacter", "0 0 120 170");
export const GuideCharacter = lazyCharacter("GuideCharacter", "0 0 120 170");
export const TrainCharacter = lazyCharacter("TrainCharacter", "0 0 200 70");
export const MountaineerCharacter = lazyCharacter("MountaineerCharacter", "0 0 180 150");
export const CameraCharacter = lazyCharacter("CameraCharacter", "0 0 140 110");
export const FoodCharacter = lazyCharacter("FoodCharacter", "0 0 150 170");
export const DiyaCharacter = lazyCharacter("DiyaCharacter", "0 0 130 120");
export const BoatCharacter = lazyCharacter("BoatCharacter", "0 0 190 110");
export const CompassCharacter = lazyCharacter("CompassCharacter", "0 0 120 120");
export const TigerCharacter = lazyCharacter("TigerCharacter", "0 0 140 130");
export const HistorianCharacter = lazyCharacter("HistorianCharacter", "0 0 130 170");
export const DancerCharacter = lazyCharacter("DancerCharacter", "0 0 150 170");
