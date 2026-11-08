"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PlaneCharacter } from "@/components/characters/Characters";
import { quiz, scoreQuiz, type QuizCandidate, type QuizOption } from "@/features/discovery/quiz";

export function TravelQuiz({ candidates, cards }: { candidates: QuizCandidate[]; cards: Record<string, ReactNode> }) {
  const [answers, setAnswers] = useState<QuizOption[]>([]);
  const question = quiz[answers.length];

  if (!question) {
    const results = scoreQuiz(candidates, answers);
    return (
      <div className="anim-pop">
        <h2 className="mb-5">You might like</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((slug) => <li key={slug}>{cards[slug]}</li>)}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/planner?d=${results.join(",")}`} className="btn btn-accent">Plan a trip with these</Link>
          <button type="button" className="btn btn-outline" onClick={() => setAnswers([])}>Start again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card mx-auto max-w-2xl p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-1" aria-live="polite">Question {answers.length + 1} of {quiz.length}</p>
          <h2 className="text-2xl" key={question.id}>{question.prompt}</h2>
        </div>
        <PlaneCharacter className="hidden h-14 w-auto shrink-0 sm:block" />
      </div>
      <div aria-hidden className="mt-4 h-1.5 rounded bg-surface-2">
        <div className="h-full rounded bg-accent transition-all" style={{ width: `${(answers.length / quiz.length) * 100}%` }} />
      </div>
      <ul className="mt-5 space-y-2">
        {question.options.map((option) => (
          <li key={option.label}>
            <button
              type="button"
              className="min-h-12 w-full cursor-pointer rounded-[var(--radius-md)] border border-line px-4 py-2.5 text-left font-medium transition-colors hover:border-brand hover:bg-brand-soft"
              onClick={() => setAnswers((current) => [...current, option])}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
      {answers.length > 0 && (
        <button type="button" className="link-text mt-4 cursor-pointer" onClick={() => setAnswers((current) => current.slice(0, -1))}>
          Back
        </button>
      )}
    </div>
  );
}
