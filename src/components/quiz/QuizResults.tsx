"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode, type Ref } from "react";
import { ArrowRight, Check, Compass, Info, Link2, RotateCcw } from "lucide-react";
import type { QuizMatch } from "@/features/quiz/score";

export interface QuizDetail {
  name: string;
  state: string;
  tagline: string;
  image?: { src: string; alt: string; blur?: string; author: string; license: string; sourceUrl: string };
}

export function QuizResults({
  matches,
  details,
  cards,
  planHref,
  summary,
  headingRef,
  onRetake,
  onEdit,
}: {
  matches: QuizMatch[];
  details: Record<string, QuizDetail>;
  cards: Record<string, ReactNode>;
  planHref: string;
  summary: { label: string; step: number }[];
  headingRef: Ref<HTMLHeadingElement>;
  onRetake: () => void;
  onEdit: (step: number) => void;
}) {
  const [shareStatus, setShareStatus] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [top, ...rest] = matches;
  if (!top) return null;
  const detail = details[top.slug];

  async function share() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("Link copied. Anyone who opens it sees these results.");
      setFallbackUrl("");
    } catch {
      setShareStatus("Copying was blocked. Copy the link below instead.");
      setFallbackUrl(url);
    }
  }

  return (
    <div className="transition-[opacity,transform] duration-300 ease-out starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none">
      <p className="eyebrow">Your results</p>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none sm:text-3xl">
        Your best match is {detail?.name ?? top.slug}
      </h2>

      {summary.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Your answers:</span>
          {summary.map((item) => (
            <button key={item.step} type="button" className="chip" onClick={() => onEdit(item.step)} aria-label={`Change answer: ${item.label}`}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      <article className="card mt-6 grid overflow-hidden md:grid-cols-[1.15fr_1fr]">
        <div className="relative aspect-[4/3] bg-brand-soft md:aspect-auto md:min-h-[22rem]">
          {detail?.image ? (
            <Image
              src={detail.image.src}
              alt={detail.image.alt}
              fill
              sizes="(min-width: 768px) 55vw, 100vw"
              placeholder={detail.image.blur ? "blur" : "empty"}
              blurDataURL={detail.image.blur}
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-brand" aria-hidden>
              <Compass className="size-10 opacity-50" />
            </div>
          )}
        </div>
        <div className="flex flex-col p-5 sm:p-7">
          <p className="text-sm font-medium text-muted">{detail?.state}</p>
          <h3 className="mt-0.5 text-2xl">
            <Link href={`/destinations/${top.slug}`} className="link-u">
              {detail?.name ?? top.slug}
            </Link>
          </h3>
          <p className="mt-2 text-ink-2">{detail?.tagline}</p>
          <ul className="mt-4 space-y-2" aria-label="Why it matches">
            {top.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4.5 shrink-0 text-forest" aria-hidden />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          {top.cautions.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm text-ink-2" aria-label="Worth knowing">
              {top.cautions.map((caution) => (
                <li key={caution} className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden />
                  <span>{caution}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto pt-5">
            <Link href={`/destinations/${top.slug}`} className="link-text">
              Read the {detail?.name ?? ""} guide
            </Link>
            {detail?.image && (
              <p className="mt-3 text-xs text-muted">
                Photo: {detail.image.author},{" "}
                <a href={detail.image.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">
                  {detail.image.license}
                </a>
              </p>
            )}
          </div>
        </div>
      </article>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={planHref} className="btn btn-accent">
          Plan this trip
          <ArrowRight className="nudge size-4" aria-hidden />
        </Link>
        <button type="button" className="btn btn-outline" onClick={share}>
          <Link2 className="size-4" aria-hidden />
          Share results
        </button>
        <button type="button" className="btn btn-outline" onClick={onRetake}>
          <RotateCcw className="size-4" aria-hidden />
          Retake
        </button>
      </div>
      <p role="status" className="mt-2 min-h-6 text-sm text-ink-2">
        {shareStatus}
      </p>
      {fallbackUrl && (
        <label className="field mt-1 max-w-xl">
          <span className="field-label">Results link</span>
          <input className="input" readOnly value={fallbackUrl} onFocus={(event) => event.currentTarget.select()} />
        </label>
      )}

      {rest.length > 0 && (
        <section className="mt-10" aria-labelledby="quiz-more">
          <h2 id="quiz-more" className="text-xl sm:text-2xl">
            {rest.length === 1 ? "One more to consider" : `${rest.length === 5 ? "Five" : rest.length} more to consider`}
          </h2>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((match) => (
              <li key={match.slug} className="flex flex-col gap-2">
                {cards[match.slug]}
                <p className="px-1 text-sm text-ink-2">{match.reasons.slice(0, 2).join(" · ")}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
