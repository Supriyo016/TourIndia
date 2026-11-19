import type { ReactNode } from "react";
import type { ErrorKind } from "@/lib/http-errors";

const ink = "var(--ink)";
const brand = "var(--brand)";
const accent = "var(--accent)";
const danger = "var(--danger)";
const card = "var(--surface)";

const glyphs: Record<ErrorKind, ReactNode> = {
  notFound: (
    <g>
      <rect x="-3" y="-30" width="6" height="88" rx="3" fill={brand} opacity="0.7" />
      <g className="err-wobble" style={{ transformOrigin: "0px -24px" }}>
        <rect x="-44" y="-36" width="88" height="26" rx="6" fill={brand} />
        <text y="-18" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--on-brand)">404</text>
      </g>
      <g transform="rotate(-8)">
        <rect x="-44" y="-2" width="80" height="20" rx="5" fill={accent} />
        <text x="-4" y="12" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--on-accent)">WHICH WAY?</text>
      </g>
      <g className="err-bob"><text x="58" y="-30" fontSize="30" fontWeight="800" fill={accent} opacity="0.5">?</text></g>
      <g className="err-bob" style={{ animationDelay: "0.8s" }}><text x="-78" y="-12" fontSize="22" fontWeight="800" fill={brand} opacity="0.4">?</text></g>
    </g>
  ),
  server: (
    <g>
      <circle r="48" fill={card} stroke={brand} strokeOpacity="0.35" strokeWidth="3" />
      <text y="-30" textAnchor="middle" fontSize="10" fontWeight="800" fill={brand} opacity="0.6">N</text>
      <g className="err-wobble">
        <path d="M0 -32 L-7 0 L7 0Z" fill={danger} opacity="0.85" />
        <path d="M0 32 L-7 0 L7 0Z" fill={brand} opacity="0.55" />
      </g>
      <circle r="5" fill={accent} />
      <path d="M-30 -28 l8 14 -6 9 8 10 -5 12" stroke={danger} strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  ),
  badGateway: (
    <g>
      <path d="M-90 20 H-14 M14 20 H90" stroke={brand} strokeWidth="6" strokeLinecap="round" />
      <path d="M-90 20 Q-52 -30 -14 20 M14 20 Q52 -30 90 20" stroke={brand} strokeOpacity="0.5" strokeWidth="3" fill="none" />
      <g className="err-bob"><path d="M-14 20 l6 14 M14 20 l-4 16" stroke={danger} strokeWidth="3" strokeLinecap="round" /></g>
      <g className="err-blink">
        <circle cy="-6" r="10" fill={danger} opacity="0.85" />
        <text y="-2" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">!</text>
      </g>
    </g>
  ),
  unavailable: (
    <g>
      <rect x="-70" y="-6" width="140" height="18" rx="4" fill={accent} />
      {[-56, -28, 0, 28].map((x) => (
        <path key={x} d={`M${x + 14} -6 l14 0 -14 18 -14 0Z`} fill={ink} opacity="0.75" />
      ))}
      <path d="M-60 12 v40 M60 12 v40" stroke={ink} strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" />
      <g className="err-bob">
        <path d="M-100 52 l12 -40 12 40Z" fill={accent} />
        <path d="M88 52 l12 -40 12 40Z" fill={accent} />
      </g>
      <g className="err-spin" style={{ transformOrigin: "0px -40px" }}>
        <circle cy="-40" r="14" fill="none" stroke={brand} strokeWidth="5" strokeDasharray="10 6" />
      </g>
    </g>
  ),
  timeout: (
    <g>
      <path d="M-30 -48 H30 M-30 48 H30" stroke={brand} strokeWidth="6" strokeLinecap="round" />
      <path d="M-24 -46 Q-24 -8 0 0 Q24 -8 24 -46Z M-24 46 Q-24 8 0 0 Q24 8 24 46Z" fill={card} stroke={brand} strokeWidth="3" />
      <path d="M-14 -34 Q0 -14 14 -34Z" fill={accent} />
      <path d="M-18 44 Q0 26 18 44Z" fill={accent} />
      <g className="err-sand"><circle cy="10" r="2.4" fill={accent} /></g>
    </g>
  ),
  offline: (
    <g>
      {[46, 32, 18].map((r, index) => (
        <path
          key={r}
          className="err-blink"
          style={{ animationDelay: `${index * 0.25}s` }}
          d={`M${-r} ${20 - r * 0.2} A${r} ${r} 0 0 1 ${r} ${20 - r * 0.2}`}
          stroke={brand}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      ))}
      <circle cy="26" r="6" fill={brand} />
      <path d="M-50 -40 L50 50" stroke={danger} strokeWidth="6" strokeLinecap="round" />
    </g>
  ),
  unauthorized: (
    <g className="err-bob">
      <path d="M-22 -10 v-16 a22 22 0 0 1 44 0 v16" stroke={brand} strokeWidth="8" fill="none" />
      <rect x="-38" y="-12" width="76" height="62" rx="12" fill={accent} />
      <circle cy="12" r="8" fill={ink} opacity="0.75" />
      <rect x="-3" y="14" width="6" height="18" rx="3" fill={ink} opacity="0.75" />
    </g>
  ),
  forbidden: (
    <g className="err-bob">
      <path d="M0 -52 L44 -36 V4 Q44 40 0 56 Q-44 40 -44 4 V-36Z" fill={brand} opacity="0.85" />
      <circle r="20" fill="none" stroke="#fff" strokeWidth="6" />
      <path d="M-14 14 L14 -14" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
    </g>
  ),
  api: (
    <g>
      <rect x="-56" y="-40" width="112" height="80" rx="12" fill={card} stroke={brand} strokeOpacity="0.4" strokeWidth="3" />
      <path d="M-40 -18 H20 M-40 0 H34 M-40 18 H6" stroke={brand} strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" />
      <g className="err-blink">
        <circle cx="44" cy="-40" r="14" fill={danger} />
        <text x="44" y="-35" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">!</text>
      </g>
    </g>
  ),
};

const motion = `
.err-art .err-cloud{animation:err-drift 14s ease-in-out infinite alternate}
.err-art .err-cloud-2{animation-duration:18s}
.err-art .err-sun{animation:err-pulse 5s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.err-art .err-bob{animation:err-bob 3s ease-in-out infinite}
.err-art .err-spin{animation:err-spin 6s linear infinite}
.err-art .err-wobble{animation:err-wobble 2.4s ease-in-out infinite}
.err-art .err-blink{animation:err-blink 1.6s ease-in-out infinite}
.err-art .err-sand{animation:err-sand 2s ease-in infinite}
@keyframes err-drift{to{transform:translateX(36px)}}
@keyframes err-pulse{50%{transform:scale(1.08)}}
@keyframes err-bob{50%{transform:translateY(-6px)}}
@keyframes err-spin{to{transform:rotate(360deg)}}
@keyframes err-wobble{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(14deg)}}
@keyframes err-blink{50%{opacity:.25}}
@keyframes err-sand{0%{transform:translateY(-6px);opacity:0}30%{opacity:1}100%{transform:translateY(10px);opacity:0}}
@media (prefers-reduced-motion: reduce){.err-art *{animation:none!important}}
`;

/** A shared Indian landscape with an animated glyph for each kind of error. Pure SVG and CSS, so it works without any network. */
export function ErrorIllustration({ kind }: { kind: ErrorKind }) {
  return (
    <svg viewBox="0 0 360 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="err-art mx-auto w-full max-w-[22rem]" aria-hidden>
      <defs>
        <linearGradient id="err-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="360" height="240" rx="24" fill="url(#err-sky)" />
      <circle className="err-sun" cx="286" cy="58" r="22" fill="var(--accent)" opacity="0.35" />
      <g className="err-cloud" opacity="0.6">
        <ellipse cx="70" cy="52" rx="30" ry="10" fill={card} />
        <ellipse cx="88" cy="46" rx="18" ry="10" fill={card} />
      </g>
      <g className="err-cloud err-cloud-2" opacity="0.45">
        <ellipse cx="200" cy="36" rx="24" ry="8" fill={card} />
      </g>
      <path d="M22 186 v-22 l9-14 9 14 v22 M52 186 v-30 l10-16 10 16 v30 M310 186 v-26 q12-22 24 0 v26" stroke="var(--brand)" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M0 190 Q70 160 140 182 T280 176 T360 170 V240 H0Z" fill="var(--brand)" opacity="0.12" />
      <path d="M0 206 Q90 186 180 204 T360 196 V240 H0Z" fill="var(--brand)" opacity="0.2" />
      <g transform="translate(180 128)">{glyphs[kind]}</g>
      <style>{motion}</style>
    </svg>
  );
}
