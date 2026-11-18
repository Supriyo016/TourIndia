import type { RegionId } from "@/types/content";
import { formatVisitMonth } from "@/features/saved/passport";

/**
 * Original illustrated keepsake stamps, drawn in code (nothing copied, nothing uploaded). Each
 * region has its own frame and scene; the ink colour varies by state so a page of stamps looks
 * collected rather than printed. They're souvenirs, not an official document: no crests, seals
 * or entry wording.
 */

type Frame = "circle" | "scallop" | "hexagon" | "rounded" | "shield";

const REGION: Record<RegionId, { frame: Frame }> = {
  north: { frame: "circle" },
  west: { frame: "scallop" },
  central: { frame: "hexagon" },
  south: { frame: "rounded" },
  east: { frame: "shield" },
  northeast: { frame: "circle" },
  islands: { frame: "scallop" },
};

/** Names too long for the arc. */
const SHORT: Record<string, string> = {
  "dadra-and-nagar-haveli-and-daman-and-diu": "Dadra, Daman & Diu",
  "andaman-and-nicobar-islands": "Andaman & Nicobar",
};

const INKS = ["#1f6f5c", "#a3361f", "#2a4f8f", "#8a4b0f", "#6b2f7a", "#1d6a86", "#7a5a0c", "#9b2b52"];

function hash(text: string) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

function framePath(frame: Frame) {
  switch (frame) {
    case "circle":
      return null;
    case "scallop": {
      // A postage-style edge: 16 bumps around a circle.
      const points: string[] = [];
      for (let i = 0; i < 32; i++) {
        const angle = (Math.PI * 2 * i) / 32;
        const r = i % 2 ? 46 : 50;
        points.push(`${(60 + r * Math.cos(angle)).toFixed(1)},${(60 + r * Math.sin(angle)).toFixed(1)}`);
      }
      return `M${points.join("L")}Z`;
    }
    case "hexagon":
      return "M60 9 L104 34 L104 86 L60 111 L16 86 L16 34 Z";
    case "rounded":
      return "M26 12 H94 Q108 12 108 26 V94 Q108 108 94 108 H26 Q12 108 12 94 V26 Q12 12 26 12 Z";
    case "shield":
      return "M60 10 L104 22 V62 Q104 94 60 110 Q16 94 16 62 V22 Z";
  }
}

function Scene({ region, ink }: { region: RegionId; ink: string }) {
  const soft = { fill: ink, opacity: 0.18 };
  switch (region) {
    case "north":
      return (
        <g>
          <path d="M30 76 L48 50 L58 62 L70 44 L90 76 Z" fill={ink} opacity={0.85} />
          <path d="M70 44 L76 53 L72 52 L68 55 L64 52 Z M48 50 L52 56 L48 55 L45 57 Z" fill="#fff" />
          <circle cx="84" cy="44" r="5" {...soft} />
        </g>
      );
    case "west":
      return (
        <g>
          <circle cx="60" cy="58" r="12" fill={ink} opacity={0.3} />
          <path d="M28 78 Q44 64 60 74 T92 72 L92 80 L28 80 Z" fill={ink} opacity={0.85} />
          <path d="M70 62 q3 -6 6 0 q3 -6 6 0" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      );
    case "central":
      return (
        <g fill={ink}>
          <path d="M60 40 L66 52 H54 Z" opacity={0.9} />
          <rect x="52" y="52" width="16" height="22" opacity={0.85} />
          <rect x="40" y="60" width="10" height="14" opacity={0.6} />
          <rect x="70" y="60" width="10" height="14" opacity={0.6} />
          <rect x="34" y="74" width="52" height="4" opacity={0.9} />
        </g>
      );
    case "south":
      return (
        <g>
          <path d="M60 38 L70 50 H50 Z M48 50 H72 L76 60 H44 Z M42 60 H78 L82 74 H38 Z" fill={ink} opacity={0.85} />
          <path d="M30 80 Q45 74 60 80 T90 80" stroke={ink} strokeWidth="2" fill="none" />
        </g>
      );
    case "east":
      return (
        <g>
          <path d="M34 66 Q60 76 86 66 L80 72 Q60 80 40 72 Z" fill={ink} opacity={0.9} />
          <path d="M60 40 V66 M60 42 L76 62 H60" stroke={ink} strokeWidth="2" fill="none" />
          <path d="M28 80 Q44 74 60 80 T92 80" stroke={ink} strokeWidth="2" fill="none" opacity={0.6} />
        </g>
      );
    case "northeast":
      return (
        <g>
          <path d="M28 70 Q44 54 60 66 T92 62 L92 80 L28 80 Z" fill={ink} opacity={0.75} />
          <path d="M34 72 Q46 64 58 70 M64 68 Q76 60 88 66" stroke="#fff" strokeWidth="1.6" fill="none" opacity={0.7} />
          <ellipse cx="74" cy="44" rx="7" ry="4" transform="rotate(-30 74 44)" fill={ink} opacity={0.6} />
          <ellipse cx="66" cy="48" rx="7" ry="4" transform="rotate(25 66 48)" fill={ink} opacity={0.45} />
        </g>
      );
    case "islands":
      return (
        <g>
          <path d="M44 70 Q60 62 76 70 Z" fill={ink} opacity={0.85} />
          <path d="M60 68 Q58 54 62 44" stroke={ink} strokeWidth="2" fill="none" />
          <path d="M62 44 q-10 -2 -14 6 M62 44 q10 -3 14 4 M62 44 q-2 -8 -10 -10" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M28 78 Q44 72 60 78 T92 78" stroke={ink} strokeWidth="2" fill="none" />
        </g>
      );
  }
}

export function PassportStamp({ slug, name, region, month, className }: { slug: string; name: string; region: RegionId; month?: string; className?: string }) {
  const seed = hash(slug);
  const ink = INKS[seed % INKS.length]!;
  const { frame } = REGION[region];
  const outline = framePath(frame);
  // A slight, stable tilt per state, like a stamp pressed by hand.
  const tilt = (seed % 13) - 6;
  const label = SHORT[slug] ?? name.replace(/ and /g, " & ");
  const size = label.length > 11 ? 7.6 : 9.2;
  // Long names are fitted to the arc rather than running off it.
  const fit = label.length > 14 ? { textLength: 84, lengthAdjust: "spacingAndGlyphs" as const } : {};
  const id = `stamp-${slug}`;
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={`${name} stamp${month ? `, visited ${formatVisitMonth(month)}` : ""}`}>
      <g transform={`rotate(${tilt} 60 60)`}>
        {outline ? (
          <>
            <path d={outline} fill="#fbf5e6" stroke={ink} strokeWidth="3" />
            <path d={outline} fill="none" stroke={ink} strokeWidth="1" transform="translate(60 60) scale(0.86) translate(-60 -60)" opacity={0.7} />
          </>
        ) : (
          <>
            <circle cx="60" cy="60" r="50" fill="#fbf5e6" stroke={ink} strokeWidth="3" />
            <circle cx="60" cy="60" r="43" fill="none" stroke={ink} strokeWidth="1" strokeDasharray="2 3" opacity={0.7} />
          </>
        )}
        <Scene region={region} ink={ink} />
        {/* An arc inside the frame, from the left side over the top to the right. */}
        <path id={id} d="M26.2 47.7 A36 36 0 0 1 93.8 47.7" fill="none" />
        <text fill={ink} fontSize={size} fontWeight={700} letterSpacing="0.5" textAnchor="middle" style={{ fontFamily: "var(--font-sans)", textTransform: "uppercase" }}>
          <textPath href={`#${id}`} startOffset="50%" {...fit}>
            {label}
          </textPath>
        </text>
        <text x="60" y="95" fill={ink} fontSize="8.5" fontWeight={600} textAnchor="middle" style={{ fontFamily: "var(--font-sans)" }}>
          {month ? formatVisitMonth(month) : "Visited"}
        </text>
      </g>
    </svg>
  );
}
