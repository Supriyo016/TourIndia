/**
 * Original Tour India character set: flat shapes, one dark outline, round faces.
 * Colours come from a shared palette and every loop is CSS, so the prefers-reduced-motion
 * rule in globals.css stops them all. All characters are decorative and hidden from
 * assistive technology.
 */
import { cn } from "@/lib/utils";

const OUTLINE = "#13262b";
const SAFFRON = "#e8890c";
const GOLD = "#e6c61a";
const PEACOCK = "#1c7486";
const RANI = "#c2277f";
const FOREST = "#3a8a63";
const SKIN = "#c98a5a";
const CREAM = "#fbf3e2";
const GREY = "#9fb0b5";

type Props = { className?: string; animated?: boolean };

const s = { stroke: OUTLINE, strokeWidth: 2.5, strokeLinejoin: "round", strokeLinecap: "round" } as const;

function Face({ x, y, gap = 12, r = 2.6 }: { x: number; y: number; gap?: number; r?: number }) {
  return (
    <g>
      <circle cx={x - gap / 2} cy={y} r={r} fill={OUTLINE} />
      <circle cx={x + gap / 2} cy={y} r={r} fill={OUTLINE} />
      <path d={`M${x - 5} ${y + 7} q5 5 10 0`} fill="none" {...s} />
    </g>
  );
}

/** Haathi, the elephant mascot, who waves a trunk. */
export function ElephantCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 160 150" className={className} aria-hidden>
      <g className={cn(animated && "anim-bob")}>
        <path d="M46 122 V96 q0 -40 44 -40 q42 0 42 42 v24 h-20 v-16 h-44 v16z" fill={GREY} {...s} />
        <ellipse cx="44" cy="62" rx="26" ry="31" fill={GREY} {...s} />
        <ellipse cx="44" cy="62" rx="15" ry="20" fill={RANI} opacity="0.75" />
        <circle cx="74" cy="66" r="29" fill={GREY} {...s} />
        <path d="M64 37 q10 -12 22 -2 l-8 11 h-7z" fill={SAFFRON} {...s} />
        <circle cx="75" cy="33" r="3.5" fill={GOLD} {...s} />
        <circle cx="66" cy="61" r="3" fill={OUTLINE} />
        <circle cx="86" cy="61" r="3" fill={OUTLINE} />
        <g className={cn(animated && "anim-wave")}>
          <path d="M84 80 q24 8 25 -16 q1 -9 9 -6" fill="none" stroke={OUTLINE} strokeWidth="15" strokeLinecap="round" />
          <path d="M84 80 q24 8 25 -16 q1 -9 9 -6" fill="none" stroke={GREY} strokeWidth="10" strokeLinecap="round" />
        </g>
        <path d="M60 104 h52 v8 h-52z" fill={GOLD} {...s} />
      </g>
    </svg>
  );
}

/** A backpacker with a map, in mid-wave. */
export function BackpackerCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 120 170" className={className} aria-hidden>
      <g className={cn(animated && "anim-bob")}>
        <rect x="28" y="62" width="26" height="50" rx="9" fill={RANI} {...s} />
        <path d="M42 112 v42 h13 v-34 h10 v34 h13 v-42z" fill={PEACOCK} {...s} />
        <path d="M40 66 q0 -12 14 -12 h18 q14 0 14 12 v50 h-46z" fill={SAFFRON} {...s} />
        <circle cx="63" cy="34" r="21" fill={SKIN} {...s} />
        <path d="M41 30 q22 -30 44 0 q-22 -9 -44 0z" fill={FOREST} {...s} />
        <path d="M36 32 h54" {...s} fill="none" />
        <Face x={63} y={36} gap={13} />
        <g className={cn(animated && "anim-wave")}>
          <path d="M86 70 L106 44" stroke={OUTLINE} strokeWidth="13" strokeLinecap="round" />
          <path d="M86 70 L106 44" stroke={SKIN} strokeWidth="8" strokeLinecap="round" />
        </g>
        <rect x="42" y="150" width="14" height="10" rx="3" fill={OUTLINE} />
        <rect x="65" y="150" width="14" height="10" rx="3" fill={OUTLINE} />
      </g>
    </svg>
  );
}

/** A local guide with a raised flag. */
export function GuideCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 120 170" className={className} aria-hidden>
      <g className={cn(animated && "anim-bob")}>
        <path d="M100 18 V110" {...s} fill="none" />
        <path d="M100 18 l-26 8 l26 10z" fill={SAFFRON} {...s} />
        <path d="M36 112 v44 h14 v-34 h8 v34 h14 v-44z" fill={CREAM} {...s} />
        <path d="M28 70 q0 -14 16 -14 h22 q16 0 16 14 v48 h-54z" fill={PEACOCK} {...s} />
        <path d="M82 76 L100 72" stroke={OUTLINE} strokeWidth="12" strokeLinecap="round" />
        <path d="M82 76 L100 72" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
        <circle cx="55" cy="35" r="21" fill={SKIN} {...s} />
        <path d="M33 30 q4 -22 22 -22 q18 0 22 22 q-22 -8 -44 0z" fill={OUTLINE} />
        <path d="M46 46 q9 5 18 0" fill="none" {...s} strokeWidth={4} />
        <circle cx="48" cy="36" r="2.6" fill={OUTLINE} />
        <circle cx="62" cy="36" r="2.6" fill={OUTLINE} />
      </g>
    </svg>
  );
}

/** The train that crosses the footer and stands in for loading states. */
export function TrainCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 200 70" className={className} aria-hidden>
      <rect x="4" y="14" width="74" height="40" rx="7" fill={PEACOCK} {...s} />
      <rect x="82" y="14" width="74" height="40" rx="7" fill={SAFFRON} {...s} />
      {[12, 34, 56, 90, 112, 134].map((x) => (
        <rect key={x} x={x} y="22" width="14" height="13" rx="2" fill={CREAM} {...s} strokeWidth={2} />
      ))}
      <path d="M160 54 V26 q0 -12 14 -12 q22 0 22 40z" fill={RANI} {...s} />
      <circle cx="176" cy="33" r="7" fill={CREAM} {...s} strokeWidth={2} />
      <circle cx="174.5" cy="33" r="1.8" fill={OUTLINE} />
      <circle cx="180" cy="33" r="1.8" fill={OUTLINE} />
      <path d="M175 42 q4 3 8 0" fill="none" {...s} strokeWidth={2} />
      {[20, 62, 98, 140, 176].map((x) => (
        <g key={x} className={cn(animated && "anim-wheel")}>
          <circle cx={x} cy="58" r="9" fill={OUTLINE} />
          <path d={`M${x - 6} 58 h12`} stroke={CREAM} strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

/** A small airliner with a friendly face. */
export function PlaneCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 170 100" className={className} aria-hidden>
      <g className={cn(animated && "anim-bob")}>
        <path d="M18 30 l14 22 h26z" fill={RANI} {...s} />
        <path d="M22 52 q60 -18 118 -6 q16 4 16 12 q0 10 -18 11 h-92 q-20 0 -24 -17z" fill={CREAM} {...s} />
        <path d="M70 62 l-26 28 h22 l40 -28z" fill={PEACOCK} {...s} />
        <circle cx="130" cy="54" r="2.8" fill={OUTLINE} />
        <circle cx="142" cy="54" r="2.8" fill={OUTLINE} />
        <path d="M131 62 q5 4 10 0" fill="none" {...s} />
        <path d="M0 40 h12 M4 56 h10" {...s} stroke={GREY} fill="none" />
      </g>
    </svg>
  );
}

/** A mountaineer planted beside a small summit. */
export function MountaineerCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 180 150" className={className} aria-hidden>
      <path d="M6 142 L70 40 L134 142z" fill={PEACOCK} {...s} />
      <path d="M50 72 L70 40 L90 72 l-10 -6 l-10 8 l-10 -8z" fill={CREAM} {...s} />
      <g className={cn(animated && "anim-bob")}>
        <path d="M120 140 v-30 h11 v20 h6 v-20 h11 v30z" fill={OUTLINE} />
        <path d="M112 112 q0 -22 22 -22 q22 0 22 22 v8 h-44z" fill={RANI} {...s} />
        <circle cx="134" cy="72" r="16" fill={SKIN} {...s} />
        <path d="M117 68 q17 -24 34 0z" fill={SAFFRON} {...s} />
        <circle cx="134" cy="51" r="4.5" fill={GOLD} {...s} />
        <circle cx="128" cy="74" r="2.2" fill={OUTLINE} />
        <circle cx="140" cy="74" r="2.2" fill={OUTLINE} />
        <path d="M158 142 L168 90" {...s} fill="none" strokeWidth={4} />
      </g>
    </svg>
  );
}

/** A camera that blinks at the gallery. */
export function CameraCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 140 110" className={className} aria-hidden>
      <g className={cn(animated && "anim-bob")}>
        <path d="M48 22 l8 -12 h28 l8 12z" fill={GOLD} {...s} />
        <rect x="10" y="22" width="120" height="76" rx="12" fill={PEACOCK} {...s} />
        <circle cx="70" cy="60" r="27" fill={CREAM} {...s} />
        <circle cx="62" cy="55" r="3.2" fill={OUTLINE} />
        <circle cx="78" cy="55" r="3.2" fill={OUTLINE} />
        <path d="M63 66 q7 6 14 0" fill="none" {...s} />
        <circle cx="114" cy="38" r="5.5" fill={SAFFRON} {...s} strokeWidth={2} />
      </g>
    </svg>
  );
}

/** A cook with a ladle and a pot on the boil. */
export function FoodCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 150 170" className={className} aria-hidden>
      <g className={cn(animated && "anim-bob")}>
        <path d="M40 118 q0 -44 36 -44 q36 0 36 44z" fill={CREAM} {...s} />
        <path d="M112 92 L136 66" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
        <circle cx="139" cy="62" r="8" fill={SAFFRON} {...s} />
        <circle cx="76" cy="52" r="24" fill={SKIN} {...s} />
        <path d="M52 40 q-12 -22 10 -22 q14 -14 28 0 q20 0 8 22z" fill={CREAM} {...s} />
        <Face x={76} y={54} gap={14} />
      </g>
      <path d="M30 122 h92 l-8 36 q-2 6 -8 6 h-60 q-6 0 -8 -6z" fill={RANI} {...s} />
      <path d="M22 122 h108" {...s} strokeWidth={6} />
    </svg>
  );
}

/** A diya with a flickering flame, for festival sections. */
export function DiyaCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 130 120" className={className} aria-hidden>
      <g className={cn(animated && "anim-flicker")}>
        <path d="M65 8 q22 26 0 50 q-22 -24 0 -50z" fill={GOLD} {...s} />
        <path d="M65 28 q9 12 0 24 q-9 -12 0 -24z" fill={SAFFRON} />
      </g>
      <path d="M12 62 h106 q-4 46 -53 46 q-49 0 -53 -46z" fill={RANI} {...s} />
      <circle cx="50" cy="80" r="3" fill={OUTLINE} />
      <circle cx="80" cy="80" r="3" fill={OUTLINE} />
      <path d="M57 90 q8 6 16 0" fill="none" {...s} />
      <path d="M22 68 h86" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** A wooden houseboat, for the backwaters. */
export function BoatCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 190 110" className={className} aria-hidden>
      <g className={cn(animated && "anim-bob")}>
        <path d="M46 44 q48 -38 98 0z" fill={FOREST} {...s} />
        <rect x="56" y="44" width="78" height="26" fill={CREAM} {...s} />
        <circle cx="86" cy="56" r="2.8" fill={OUTLINE} />
        <circle cx="104" cy="56" r="2.8" fill={OUTLINE} />
        <path d="M89 63 q6 4 12 0" fill="none" {...s} />
        <path d="M8 58 q84 26 174 0 q-8 36 -42 36 h-90 q-34 0 -42 -36z" fill={SAFFRON} {...s} />
      </g>
      <path d="M2 104 q16 -8 32 0 t32 0 t32 0 t32 0 t32 0 t32 0" fill="none" stroke={PEACOCK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** A compass searching for north, used in empty states. */
export function CompassCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <circle cx="60" cy="60" r="50" fill={CREAM} {...s} />
      <circle cx="60" cy="60" r="40" fill="none" stroke={PEACOCK} strokeWidth="3" strokeDasharray="4 7" />
      <g className={cn(animated && "anim-needle")}>
        <path d="M60 16 L71 60 H49z" fill={RANI} {...s} />
        <path d="M60 104 L71 60 H49z" fill={GREY} {...s} />
      </g>
      <circle cx="60" cy="60" r="7" fill={GOLD} {...s} />
    </svg>
  );
}

/** A tiger cub, for wildlife sections. */
export function TigerCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 140 130" className={className} aria-hidden>
      <g className={cn(animated && "anim-bob")}>
        <circle cx="36" cy="30" r="15" fill={SAFFRON} {...s} />
        <circle cx="104" cy="30" r="15" fill={SAFFRON} {...s} />
        <circle cx="70" cy="68" r="50" fill={SAFFRON} {...s} />
        <path d="M70 20 v18 M52 24 l4 14 M88 24 l-4 14 M22 66 h16 M118 66 h-16 M26 86 l14 -6 M114 86 l-14 -6" {...s} strokeWidth={5} fill="none" />
        <ellipse cx="70" cy="90" rx="24" ry="18" fill={CREAM} {...s} />
        <circle cx="52" cy="62" r="4" fill={OUTLINE} />
        <circle cx="88" cy="62" r="4" fill={OUTLINE} />
        <path d="M63 80 h14 l-7 7z" fill={OUTLINE} />
        <path d="M70 87 v5 M60 96 q10 6 20 0" {...s} fill="none" />
      </g>
    </svg>
  );
}

/** An archaeologist with a pith helmet and scroll, for heritage sections. */
export function HistorianCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 130 170" className={className} aria-hidden>
      <g className={cn(animated && "anim-bob")}>
        <path d="M40 114 v42 h14 v-32 h10 v32 h14 v-42z" fill={OUTLINE} />
        <path d="M30 72 q0 -14 16 -14 h26 q16 0 16 14 v46 h-58z" fill={FOREST} {...s} />
        <circle cx="59" cy="38" r="20" fill={SKIN} {...s} />
        <path d="M30 34 h58" {...s} strokeWidth={6} />
        <path d="M38 33 q0 -24 21 -24 q21 0 21 24z" fill={CREAM} {...s} />
        <circle cx="52" cy="42" r="6.5" fill="none" {...s} strokeWidth={2} />
        <circle cx="66" cy="42" r="6.5" fill="none" {...s} strokeWidth={2} />
        <circle cx="52" cy="42" r="2" fill={OUTLINE} />
        <circle cx="66" cy="42" r="2" fill={OUTLINE} />
        <path d="M54 52 q5 3 10 0" fill="none" {...s} strokeWidth={2} />
        <rect x="86" y="78" width="36" height="24" rx="4" fill={CREAM} {...s} />
        <path d="M92 86 h24 M92 94 h16" {...s} strokeWidth={2} />
      </g>
    </svg>
  );
}

/** Festive dancer, used when an action completes. */
export function DancerCharacter({ className, animated = true }: Props) {
  return (
    <svg viewBox="0 0 150 170" className={className} aria-hidden>
      <g className={cn(animated && "anim-bob")}>
        <path d="M34 160 l26 -66 h30 l26 66z" fill={RANI} {...s} />
        <path d="M46 160 l18 -66 M104 160 l-18 -66" stroke={GOLD} strokeWidth="4" />
        <path d="M58 94 v-26 q0 -8 8 -8 h18 q8 0 8 8 v26z" fill={SAFFRON} {...s} />
        <g className={cn(animated && "anim-wave")}>
          <path d="M92 70 L126 42" stroke={OUTLINE} strokeWidth="12" strokeLinecap="round" />
          <path d="M92 70 L126 42" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
        </g>
        <path d="M58 70 L26 44" stroke={OUTLINE} strokeWidth="12" strokeLinecap="round" />
        <path d="M58 70 L26 44" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
        <circle cx="75" cy="40" r="20" fill={SKIN} {...s} />
        <path d="M54 40 q-2 -26 21 -26 q23 0 21 26 q-6 -12 -21 -12 q-15 0 -21 12z" fill={OUTLINE} />
        <circle cx="75" cy="11" r="6" fill={GOLD} {...s} />
        <Face x={75} y={40} gap={12} />
      </g>
    </svg>
  );
}
