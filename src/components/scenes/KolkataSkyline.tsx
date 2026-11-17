import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import skyline from "../../../public/images/footer/kolkata-neon-skyline.png";
import s from "./kolkata.module.css";

/**
 * The footer's neon Kolkata skyline (Howrah Bridge, Dakshineswar, Victoria Memorial, St Paul's)
 * with the city going about its evening in front: a tram, taxis, a cycle rickshaw, people strolling,
 * kites and festival fireworks.
 *
 * The skyline is the owner's illustration (2048 × 316, transparent). The moving layer shares its
 * coordinates, so traffic runs exactly along the drawing's ground line. Motion uses transform and
 * opacity only and stops under reduced motion.
 */

const W = 2048;
const H = 316;
const GROUND = 286;
const r = (n: number) => Math.round(n * 10) / 10;

/** An actor that crosses the scene; `back` travels right to left. */
function Actor({ children, dur, delay = 0, back }: { children: ReactNode; dur: number; delay?: number; back?: boolean }) {
  return (
    <g className={cn(s.cross, back && s.back)} style={{ "--dur": `${dur}s`, "--delay": `${delay}s` } as CSSProperties}>
      <g transform={`translate(0 ${GROUND}) scale(${back ? -1.4 : 1.4} 1.4)`}>{children}</g>
    </g>
  );
}

const wheel = (cx: number, rad: number) => (
  <g className={s.wheel}>
    <circle cx={cx} cy={-rad} r={rad} />
    <path d={`M${cx - rad} ${-rad}H${cx + rad}M${cx} ${-rad * 2}V0`} />
  </g>
);

function Walker({ tall = 1, balloon }: { tall?: number; balloon?: boolean }) {
  const t = tall;
  return (
    <g className={s.walker}>
      <circle cx="0" cy={-27 * t} r={3.4 * t} className={s.solid} />
      <path d={`M0 ${-23 * t}V${-11 * t}`} />
      <path className={s.armA} d={`M0 ${-21 * t}l-4 ${8 * t}`} />
      <path className={s.armB} d={`M0 ${-21 * t}l4 ${8 * t}`} />
      <path className={s.legA} d={`M0 ${-11 * t}V0`} />
      <path className={s.legB} d={`M0 ${-11 * t}V0`} />
      {balloon && (
        <g className={s.balloon}>
          <path d={`M4 ${-14 * t}Q8 -36 6 -46`} />
          <ellipse cx="6" cy="-52" rx="5" ry="6.5" className={s.pink} />
        </g>
      )}
    </g>
  );
}

const TAXI = (
  <g className={s.gold}>
    <path className={s.solid} d="M-2 -6V-14L6 -16L13 -25H33L40 -16L48 -14V-6Z" />
    <path d="M15 -23V-16M25 -23V-16M31 -23V-16M20 -25V-28H26V-25" />
    {wheel(10, 4.5)}
    {wheel(37, 4.5)}
  </g>
);

const TRAM = (
  <g>
    <path className={s.solid} d="M0 -6V-34Q0 -38 4 -38H96Q100 -38 100 -34V-6Z" />
    <path d="M0 -24H100M50 -38V-6" />
    {[6, 18, 30, 56, 68, 80].map((x) => (
      <path key={x} d={`M${x} -34h9v8h-9Z`} />
    ))}
    <path d="M50 -38L40 -52L60 -60" />
    {[16, 34, 66, 84].map((x) => (
      <g key={x}>{wheel(x, 4)}</g>
    ))}
  </g>
);

const RICKSHAW = (
  <g>
    {wheel(0, 7)}
    {wheel(30, 7)}
    {wheel(40, 6)}
    <path d="M0 -7L12 -7L18 -16L30 -7M12 -7L10 -18M18 -16V-22M14 -22H22" />
    <path className={s.solid} d="M28 -14H48V-6H24M30 -14Q30 -32 44 -30L48 -14" />
    <circle cx="12" cy="-30" r="3.4" className={s.solid} />
    <path d="M12 -27L10 -18M12 -25L18 -22" />
  </g>
);

/** Bursts placed in open sky between the landmarks. */
const FIREWORKS: [number, number, number][] = [
  [470, 46, 0],
  [1290, 40, 3.3],
  [745, 30, 5.9],
];

export function KolkataSkyline({ className }: { className?: string }) {
  return (
    <div className={cn(s.band, className)} aria-hidden>
      <div className={s.stage}>
        <Image src={skyline} alt="" sizes="(max-width: 640px) 760px, 100vw" className={s.image} draggable={false} />
        <svg className={s.actors} viewBox={`0 0 ${W} ${H}`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {FIREWORKS.map(([x, y, delay]) => (
            <g key={x} className={s.firework} style={{ animationDelay: `${delay}s` }}>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2;
                return <path key={i} d={`M${r(x + Math.cos(a) * 6)} ${r(y + Math.sin(a) * 6)}L${r(x + Math.cos(a) * 20)} ${r(y + Math.sin(a) * 20)}`} />;
              })}
            </g>
          ))}

          {/* Kites, the city's favourite pastime. */}
          <g className={s.kite}>
            <path className={s.pink} d="M470 70l10 13-10 13-10-13z M470 96Q476 130 458 170" />
          </g>
          <g className={s.kite} style={{ animationDelay: "-2.1s" }}>
            <path className={s.gold} d="M1760 40l8 11-8 11-8-11z M1760 62Q1768 96 1784 130" />
          </g>

          {/* Traffic and people along the ground line. */}
          <Actor dur={48} delay={-30} back>
            {TRAM}
          </Actor>
          <Actor dur={21} delay={-4}>
            {TAXI}
          </Actor>
          <Actor dur={25} delay={-15} back>
            {TAXI}
          </Actor>
          <Actor dur={37} delay={-20}>
            {RICKSHAW}
          </Actor>
          <Actor dur={80} delay={-12}>
            <Walker />
          </Actor>
          <Actor dur={80} delay={-12.5}>
            <g transform="translate(-10 0)">
              <Walker tall={0.7} balloon />
            </g>
          </Actor>
          <Actor dur={92} delay={-50} back>
            <Walker tall={1.05} />
          </Actor>
          <Actor dur={72} delay={-38} back>
            <Walker tall={0.95} />
          </Actor>
        </svg>
      </div>
    </div>
  );
}
