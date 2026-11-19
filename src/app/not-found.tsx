import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";

function LostTraveller() {
  return (
    <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto w-full max-w-xs" aria-hidden>
      <defs>
        <linearGradient id="nf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect width="320" height="260" rx="20" fill="url(#nf-sky)" />
      {/* Ground */}
      <path d="M0 200 Q80 180 160 195 Q240 210 320 190 V260 H0Z" fill="var(--brand-soft)" opacity="0.5" />
      <path d="M0 210 Q60 200 160 210 Q260 220 320 205 V260 H0Z" fill="var(--brand-soft)" opacity="0.7" />
      {/* Signpost */}
      <rect x="148" y="100" width="4" height="110" rx="2" fill="var(--brand)" opacity="0.6" />
      <rect x="130" y="100" width="60" height="22" rx="4" fill="var(--brand)" opacity="0.8" />
      <text x="160" y="115" textAnchor="middle" fill="var(--on-brand)" fontSize="10" fontWeight="bold">404</text>
      <rect x="120" y="128" width="50" height="18" rx="4" fill="var(--accent)" opacity="0.9" transform="rotate(-8 145 137)" />
      <text x="145" y="141" textAnchor="middle" fill="var(--on-accent)" fontSize="8" fontWeight="600" transform="rotate(-8 145 141)">WHERE?</text>
      {/* Traveller */}
      <g className="nf-traveller">
        <circle cx="90" cy="148" r="14" fill="var(--accent)" opacity="0.9" />
        <circle cx="90" cy="148" r="10" fill="var(--surface)" />
        <circle cx="88" cy="146" r="2" fill="var(--ink)" />
        <circle cx="94" cy="146" r="2" fill="var(--ink)" />
        <path d="M85 153 Q90 157 95 153" stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Hat */}
        <path d="M74 142 Q90 128 106 142" fill="var(--brand)" opacity="0.7" />
        <rect x="76" y="140" width="28" height="4" rx="2" fill="var(--brand)" opacity="0.8" />
        {/* Backpack */}
        <rect x="98" y="156" width="12" height="16" rx="3" fill="var(--accent)" opacity="0.6" />
        {/* Body */}
        <rect x="82" y="160" width="16" height="22" rx="5" fill="var(--brand)" opacity="0.5" />
        {/* Map in hand */}
        <rect x="62" y="162" width="18" height="14" rx="2" fill="var(--surface)" stroke="var(--line)" strokeWidth="1" transform="rotate(-15 71 169)" />
        <line x1="66" y1="167" x2="76" y2="165" stroke="var(--accent)" strokeWidth="0.8" opacity="0.6" transform="rotate(-15 71 169)" />
        <line x1="66" y1="170" x2="74" y2="168" stroke="var(--brand)" strokeWidth="0.8" opacity="0.4" transform="rotate(-15 71 169)" />
      </g>
      {/* Question marks floating */}
      <text x="210" y="140" fill="var(--accent)" fontSize="28" fontWeight="bold" opacity="0.3" className="nf-float-1">?</text>
      <text x="240" y="120" fill="var(--brand)" fontSize="20" fontWeight="bold" opacity="0.25" className="nf-float-2">?</text>
      <text x="225" y="165" fill="var(--accent)" fontSize="16" fontWeight="bold" opacity="0.2" className="nf-float-3">?</text>
      {/* Clouds */}
      <ellipse cx="60" cy="60" rx="30" ry="12" fill="var(--ink)" opacity="0.04" />
      <ellipse cx="250" cy="45" rx="25" ry="10" fill="var(--ink)" opacity="0.04" />
      <style>{`
        .nf-traveller { animation: nf-sway 3s ease-in-out infinite; transform-origin: 90px 180px; }
        .nf-float-1 { animation: nf-bob 2.5s ease-in-out infinite; }
        .nf-float-2 { animation: nf-bob 3s ease-in-out infinite 0.5s; }
        .nf-float-3 { animation: nf-bob 2.8s ease-in-out infinite 1s; }
        @keyframes nf-sway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
        @keyframes nf-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @media (prefers-reduced-motion: reduce) { .nf-traveller, .nf-float-1, .nf-float-2, .nf-float-3 { animation: none; } }
      `}</style>
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-16 text-center sm:py-20">
      <LostTraveller />
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">This page has wandered off</h1>
      <p className="lede mt-3 max-w-md">The address may be mistyped, or the page may have moved. Try searching for what you were looking for.</p>
      <div className="mt-6 w-full max-w-sm">
        <SearchBox autoFocus placeholder="Search destinations, festivals, food…" />
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link prefetch={false} href="/" className="btn btn-primary">Back to home</Link>
        <Link prefetch={false} href="/discover" className="btn btn-outline">Browse guides</Link>
        <Link prefetch={false} href="/explore" className="btn btn-outline">Explore the map</Link>
      </div>
    </div>
  );
}
