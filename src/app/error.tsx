"use client";

import Link from "next/link";

function BrokenCompass() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto h-40 w-40" aria-hidden>
      <circle cx="100" cy="100" r="90" fill="var(--brand-soft)" opacity="0.3" />
      <circle cx="100" cy="100" r="70" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      {/* Compass ring */}
      <circle cx="100" cy="100" r="60" fill="none" stroke="var(--brand)" strokeWidth="1.5" opacity="0.3" />
      {/* Tick marks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="100"
          y1="45"
          x2="100"
          y2={angle % 90 === 0 ? "50" : "48"}
          stroke="var(--brand)"
          strokeWidth={angle % 90 === 0 ? "2" : "1"}
          opacity="0.5"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      {/* Cardinal letters */}
      <text x="100" y="58" textAnchor="middle" fill="var(--brand)" fontSize="8" fontWeight="bold" opacity="0.6">N</text>
      <text x="100" y="148" textAnchor="middle" fill="var(--brand)" fontSize="8" fontWeight="bold" opacity="0.6">S</text>
      <text x="56" y="104" textAnchor="middle" fill="var(--brand)" fontSize="8" fontWeight="bold" opacity="0.6">W</text>
      <text x="144" y="104" textAnchor="middle" fill="var(--brand)" fontSize="8" fontWeight="bold" opacity="0.6">E</text>
      {/* Broken needle */}
      <g className="err-needle">
        <path d="M100 70 L96 100 L104 100 Z" fill="var(--danger)" opacity="0.8" />
        <path d="M100 130 L96 100 L104 100 Z" fill="var(--brand)" opacity="0.5" />
      </g>
      {/* Crack */}
      <path d="M75 65 L82 80 L78 90 L85 100 L80 112 L86 125" stroke="var(--danger)" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* Centre dot */}
      <circle cx="100" cy="100" r="4" fill="var(--accent)" />
      {/* Spinning stars/sparks */}
      <g className="err-sparks" opacity="0.5">
        <text x="135" y="72" fill="var(--accent)" fontSize="14">✦</text>
        <text x="62" y="135" fill="var(--accent)" fontSize="10">✦</text>
        <text x="130" y="140" fill="var(--brand)" fontSize="8">✦</text>
      </g>
      <style>{`
        .err-needle { animation: err-wobble 2s ease-in-out infinite; transform-origin: 100px 100px; }
        .err-sparks { animation: err-twinkle 1.5s ease-in-out infinite alternate; }
        @keyframes err-wobble { 0%,100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
        @keyframes err-twinkle { 0% { opacity: 0.3; } 100% { opacity: 0.7; } }
        @media (prefers-reduced-motion: reduce) { .err-needle, .err-sparks { animation: none; } }
      `}</style>
    </svg>
  );
}

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x flex flex-col items-center py-16 text-center sm:py-20">
      <BrokenCompass />
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Something went wrong</h1>
      <p className="lede mt-3 max-w-md">The page ran into an unexpected problem. Your saved places and trips are unaffected.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" className="btn btn-primary" onClick={reset}>Try again</button>
        <Link prefetch={false} href="/" className="btn btn-outline">Back to home</Link>
      </div>
      <p className="mt-6 text-sm text-muted">If this keeps happening, try clearing your browser cache or <Link prefetch={false} href="/contact" className="link-text">let us know</Link>.</p>
    </div>
  );
}
