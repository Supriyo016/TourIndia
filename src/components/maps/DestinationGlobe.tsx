"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type GlobePoint = { slug: string; name: string; state: string; lat: number; lng: number };

const RAD = Math.PI / 180;
const HOME = { lng: 81, lat: 22 };

/** Orthographic projection: x/y on the disc, z > 0 when the point faces the viewer. */
function project(lat: number, lng: number, rotLng: number, rotLat: number) {
  const phi = lat * RAD;
  const lambda = (lng - rotLng) * RAD;
  const tilt = rotLat * RAD;
  const x = Math.cos(phi) * Math.sin(lambda);
  const y = Math.cos(tilt) * Math.sin(phi) - Math.sin(tilt) * Math.cos(phi) * Math.cos(lambda);
  const z = Math.sin(tilt) * Math.sin(phi) + Math.cos(tilt) * Math.cos(phi) * Math.cos(lambda);
  return { x, y, z };
}

/**
 * A rotating 3D globe with every destination guide marked on it. Drawn on a canvas with no
 * libraries; it only starts once on screen, pauses off screen, and stays still for reduced motion.
 */
export function DestinationGlobe({ points }: { points: GlobePoint[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [active, setActive] = useState<GlobePoint | null>(null);
  const state = useRef({ lng: HOME.lng - 12, lat: HOME.lat, drag: null as null | { x: number; y: number; lng: number; lat: number }, hover: -1, visible: false, t: 0 });
  const screen = useRef<{ x: number; y: number; z: number }[]>([]);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(element);
    const brand = css.getPropertyValue("--brand").trim() || "#14505c";
    const accent = css.getPropertyValue("--accent").trim() || "#e8890c";
    let frame = 0;

    const draw = () => {
      const s = state.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = element.clientWidth;
      if (element.width !== size * dpr) {
        element.width = size * dpr;
        element.height = size * dpr;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const r = size * 0.44;
      const cx = size / 2;
      const cy = size / 2;
      // Seen from closer in than the whole globe, so India's markers spread out; the disc outline still reads as a sphere.
      const zoom = 2.1;
      context.clearRect(0, 0, size, size);
      context.save();
      context.beginPath();
      context.arc(cx, cy, r, 0, Math.PI * 2);
      context.clip();

      const glow = context.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r * 1.1);
      glow.addColorStop(0, "rgba(64,170,190,0.55)");
      glow.addColorStop(0.7, "rgba(12,60,72,0.9)");
      glow.addColorStop(1, "rgba(4,22,28,1)");
      context.fillStyle = glow;
      context.fillRect(0, 0, size, size);

      context.lineWidth = 0.6;
      context.strokeStyle = "rgba(160,220,230,0.22)";
      for (let lat = -80; lat <= 80; lat += 10) {
        context.beginPath();
        let started = false;
        for (let lng = 0; lng <= 360; lng += 2) {
          const p = project(lat, lng, s.lng, s.lat);
          if (p.z < 0) { started = false; continue; }
          const px = cx + p.x * r * zoom;
          const py = cy - p.y * r * zoom;
          if (started) context.lineTo(px, py); else context.moveTo(px, py);
          started = true;
        }
        context.stroke();
      }
      for (let lng = 0; lng < 360; lng += 10) {
        context.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = project(lat, lng, s.lng, s.lat);
          if (p.z < 0) { started = false; continue; }
          const px = cx + p.x * r * zoom;
          const py = cy - p.y * r * zoom;
          if (started) context.lineTo(px, py); else context.moveTo(px, py);
          started = true;
        }
        context.stroke();
      }

      const pulse = reduced ? 0 : (Math.sin(s.t / 18) + 1) / 2;
      screen.current = points.map((point, index) => {
        const p = project(point.lat, point.lng, s.lng, s.lat);
        const px = cx + p.x * r * zoom;
        const py = cy - p.y * r * zoom;
        if (p.z > 0 && (px - cx) ** 2 + (py - cy) ** 2 < r * r) {
          const hover = index === s.hover;
          context.beginPath();
          context.arc(px, py, (hover ? 9 : 5 + pulse * 3) * Math.max(0.5, p.z), 0, Math.PI * 2);
          context.fillStyle = hover ? "rgba(242,168,60,0.45)" : "rgba(242,168,60,0.18)";
          context.fill();
          context.beginPath();
          context.arc(px, py, (hover ? 4.5 : 3) * Math.max(0.6, p.z), 0, Math.PI * 2);
          context.fillStyle = hover ? "#fff" : accent;
          context.fill();
        }
        return { x: px, y: py, z: (px - cx) ** 2 + (py - cy) ** 2 < r * r ? p.z : -1 };
      });
      context.restore();
      const shade = context.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.2, cx, cy, r);
      shade.addColorStop(0, "rgba(255,255,255,0.08)");
      shade.addColorStop(0.75, "rgba(0,0,0,0)");
      shade.addColorStop(1, "rgba(0,0,0,0.45)");
      context.beginPath();
      context.arc(cx, cy, r, 0, Math.PI * 2);
      context.fillStyle = shade;
      context.fill();

      context.beginPath();
      context.arc(cx, cy, r, 0, Math.PI * 2);
      context.strokeStyle = brand;
      context.globalAlpha = 0.5;
      context.lineWidth = 1.5;
      context.stroke();
      context.globalAlpha = 1;
    };

    const tick = () => {
      const s = state.current;
      if (s.visible) {
        s.t += 1;
        // Swings gently either side of India rather than spinning, so the markers stay in view.
        if (!s.drag && !reduced && s.hover < 0) s.lng += (HOME.lng + Math.sin(s.t / 260) * 9 - s.lng) * 0.02;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      state.current.visible = Boolean(entry?.isIntersecting);
      if (state.current.visible) draw();
    });
    observer.observe(element);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [points]);

  const nearest = (clientX: number, clientY: number) => {
    const rect = canvas.current!.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let best = -1;
    let bestDistance = 14 * 14;
    screen.current.forEach((p, index) => {
      if (p.z <= 0) return;
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestDistance) { bestDistance = d; best = index; }
    });
    return best;
  };

  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
      <canvas
        ref={canvas}
        role="img"
        aria-label={`Globe showing ${points.length} destination guides across India. Use the list beside it to open one.`}
        className="mx-auto aspect-square w-full max-w-[30rem] cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={(event) => {
          const s = state.current;
          s.drag = { x: event.clientX, y: event.clientY, lng: s.lng, lat: s.lat };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const s = state.current;
          if (s.drag) {
            s.lng = s.drag.lng - (event.clientX - s.drag.x) * 0.15;
            s.lat = Math.max(-10, Math.min(45, s.drag.lat + (event.clientY - s.drag.y) * 0.12));
            return;
          }
          const index = nearest(event.clientX, event.clientY);
          s.hover = index;
          setActive(index >= 0 ? points[index]! : null);
        }}
        onPointerUp={(event) => {
          const s = state.current;
          const moved = s.drag && Math.abs(event.clientX - s.drag.x) + Math.abs(event.clientY - s.drag.y) > 6;
          s.drag = null;
          if (moved) return;
          const index = nearest(event.clientX, event.clientY);
          if (index >= 0) router.push(`/destinations/${points[index]!.slug}`);
        }}
        onPointerLeave={() => {
          state.current.hover = -1;
          setActive(null);
        }}
      />
      <div>
        <p className="min-h-12 text-lg font-semibold" aria-live="polite">
          {active ? (
            <>
              {active.name}
              <span className="block text-sm font-normal text-muted">{active.state}</span>
            </>
          ) : (
            <span className="text-base font-normal text-ink-2">Drag to turn the globe. Point at a marker to see the place, and click to open its guide.</span>
          )}
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer font-semibold text-brand">All {points.length} places on the globe</summary>
          <ul className="scroll-thin mt-2 max-h-64 space-y-1 overflow-y-auto pr-2 text-sm">
            {points.map((point) => (
              <li key={point.slug}>
                <Link prefetch={false} href={`/destinations/${point.slug}`} className="link-u text-ink-2 hover:text-brand">
                  {point.name}
                </Link>
                <span className="text-muted">, {point.state}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
