"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { KeyboardEvent, Ref } from "react";
import type { QuizQuestionDef } from "@/features/quiz/questions";
import { cn } from "@/lib/utils";
import { choiceIcon } from "./choice-icons";

export function QuizStep({
  question,
  index,
  total,
  selected,
  headingRef,
  onChoose,
  onNext,
  onBack,
}: {
  question: QuizQuestionDef;
  index: number;
  total: number;
  selected: string[];
  headingRef: Ref<HTMLHeadingElement>;
  onChoose: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isLast = index === total - 1;
  const answered = selected.length > 0;
  const compact = question.choices.length > 6;

  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    // Enter moves on from a choice or the heading; on a button it keeps the button's own action.
    if (event.key === "Enter" && !(target instanceof HTMLButtonElement) && !(target instanceof HTMLAnchorElement)) {
      event.preventDefault();
      onNext();
      return;
    }
    const number = Number(event.key);
    if (Number.isInteger(number) && number >= 1 && number <= Math.min(9, question.choices.length)) {
      event.preventDefault();
      onChoose(question.choices[number - 1]!.value);
    }
  }

  return (
    <form
      noValidate
      onKeyDown={onKeyDown}
      onSubmit={(event) => {
        event.preventDefault();
        onNext();
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">
          Question {index + 1} of {total}
        </p>
        <p className="hidden text-sm text-muted sm:block">
          Press 1 to {Math.min(9, question.choices.length)} to choose, Enter for next
        </p>
      </div>
      <div aria-hidden className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <fieldset
        key={question.id}
        className="mt-6 transition-[opacity,transform] duration-300 ease-out starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none motion-reduce:starting:translate-y-0"
      >
        <legend className="w-full">
          <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none sm:text-3xl">
            {question.prompt}
          </h2>
          <span className="mt-1.5 block text-ink-2">{question.help}</span>
        </legend>

        <div
          className={cn(
            "mt-5 grid gap-2.5",
            question.multiple
              ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-3"
              : compact
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {question.choices.map((choice, choiceIndex) => {
            const Icon = choiceIcon(question.id, choice.value);
            const checked = selected.includes(choice.value);
            return (
              <label
                key={choice.value}
                className={cn(
                  "relative flex min-h-14 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface px-3.5 py-3 transition-colors",
                  "hover:border-brand has-checked:border-brand has-checked:bg-brand-soft",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
                  compact && "min-h-12 py-2",
                )}
              >
                <input
                  type={question.multiple ? "checkbox" : "radio"}
                  name={question.id}
                  value={choice.value}
                  checked={checked}
                  onChange={() => onChoose(choice.value)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-brand",
                    checked && "bg-brand text-on-brand",
                    compact && "size-8",
                  )}
                >
                  {checked && question.multiple ? <Check className="size-4.5" /> : <Icon className="size-4.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-tight text-ink">{choice.label}</span>
                  {choice.hint && <span className="mt-0.5 block text-sm leading-snug text-muted">{choice.hint}</span>}
                </span>
                {choiceIndex < 9 && !compact && (
                  <kbd aria-hidden className="hidden text-xs font-medium text-muted sm:block">
                    {choiceIndex + 1}
                  </kbd>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 flex items-center justify-between gap-3">
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </button>
        <button type="submit" className="btn btn-accent">
          {isLast ? "See my matches" : answered ? "Next" : "Skip"}
          <ArrowRight className="nudge size-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
