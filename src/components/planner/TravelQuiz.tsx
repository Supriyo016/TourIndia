"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { ListChecks } from "lucide-react";
import { QuizResults, type QuizDetail } from "@/components/quiz/QuizResults";
import { QuizStep } from "@/components/quiz/QuizStep";
import { answerValues, readAnswers, readStep, writeQuery, type QuizStep as Step } from "@/features/quiz/params";
import { questions, type QuizAnswers, type QuestionId } from "@/features/quiz/questions";
import { plannerHref, scoreDestinations, type QuizCandidate } from "@/features/quiz/score";

/** Returns new answers with one choice applied: replaces a single answer, toggles a multiple one. */
function choose(answers: QuizAnswers, id: QuestionId, value: string): QuizAnswers {
  if (id === "styles") {
    const style = value as QuizAnswers["styles"][number];
    return { ...answers, styles: answers.styles.includes(style) ? answers.styles.filter((item) => item !== style) : [...answers.styles, style] };
  }
  const parsed = id === "length" || (id === "month" && value !== "any") ? Number(value) : value;
  return { ...answers, [id]: parsed };
}

const QUIZ_EVENT = "tourindia:quiz";

function subscribe(listener: () => void) {
  window.addEventListener(QUIZ_EVENT, listener);
  window.addEventListener("popstate", listener);
  return () => {
    window.removeEventListener(QUIZ_EVENT, listener);
    window.removeEventListener("popstate", listener);
  };
}

const readLocation = () => window.location.search.replace(/^\?/, "");

function summarise(answers: QuizAnswers): { label: string; step: number }[] {
  return questions.flatMap((question, step) => {
    const values = answerValues(answers, question.id);
    if (!values.length) return [];
    const labels = values.map((value) => question.choices.find((choice) => choice.value === value)?.label ?? value);
    return [{ label: labels.join(", "), step }];
  });
}

export function TravelQuiz({
  candidates,
  cards,
  details,
}: {
  candidates: QuizCandidate[];
  cards: Record<string, ReactNode>;
  details: Record<string, QuizDetail>;
}) {
  const pathname = usePathname();
  // The address bar is the store. It is read synchronously, so a quick choice followed by Enter
  // never sees stale answers. Next updates the address after it renders a navigation (such as the
  // hero's start link), so a change in useSearchParams prompts a fresh read once committed.
  const params = useSearchParams();
  const paramsKey = params.toString();
  const query = useSyncExternalStore(subscribe, readLocation, () => paramsKey);
  useEffect(() => {
    if (readLocation() !== query) window.dispatchEvent(new Event(QUIZ_EVENT));
  }, [paramsKey, query]);
  const answers = useMemo(() => readAnswers(new URLSearchParams(query)), [query]);
  const step = useMemo(() => readStep(new URLSearchParams(query)), [query]);
  const matches = useMemo(() => (step === "results" ? scoreDestinations(candidates, answers) : []), [step, candidates, answers]);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const [announcement, setAnnouncement] = useState("");

  /**
   * Writes answers and the step to the address bar. Next integrates history.replaceState with
   * useSearchParams, so this avoids a server round trip on every tap while keeping links shareable.
   */
  function go(nextAnswers: QuizAnswers, nextStep: Step) {
    const search = writeQuery(nextAnswers, nextStep);
    window.history.replaceState(null, "", search ? `${pathname}?${search}` : pathname);
    window.dispatchEvent(new Event(QUIZ_EVENT));
  }

  // On a step change, move focus to the new heading and announce it. Skip the first render, so a
  // shared or refreshed link does not steal focus, but bring the quiz into view for it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      if (step !== "intro" && window.scrollY === 0 && !window.location.hash) {
        requestAnimationFrame(() => rootRef.current?.scrollIntoView({ block: "start" }));
      }
      return;
    }
    const text =
      step === "intro"
        ? "Quiz start"
        : step === "results"
          ? "Your results are ready"
          : `Question ${step + 1} of ${questions.length}: ${questions[step]!.prompt}`;
    setAnnouncement(text);
    const heading = headingRef.current;
    if (heading) {
      heading.focus({ preventScroll: true });
      const top = rootRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0 || top > window.innerHeight * 0.6) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        rootRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      }
    }
  }, [step]);

  let body: ReactNode;
  if (step === "intro") {
    body = (
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">{questions.length} questions, about a minute</p>
          <h2 ref={headingRef} tabIndex={-1} className="text-2xl outline-none">
            Ready when you are
          </h2>
          <p className="mt-1.5 text-ink-2">Answer what you can and skip the rest. Your answers stay in the page address, so you can share or come back to them.</p>
        </div>
        <button type="button" className="btn btn-accent shrink-0" onClick={() => go(answers, 0)}>
          <ListChecks className="size-4" aria-hidden />
          {summarise(answers).length ? "Continue the quiz" : "Start the quiz"}
        </button>
      </div>
    );
  } else if (step === "results") {
    body = (
      <QuizResults
        matches={matches}
        details={details}
        cards={cards}
        planHref={plannerHref(matches, answers.length)}
        summary={summarise(answers)}
        headingRef={headingRef}
        onRetake={() => go({ styles: [] }, 0)}
        onEdit={(index) => go(answers, index)}
      />
    );
  } else {
    const question = questions[step]!;
    body = (
      <QuizStep
        question={question}
        index={step}
        total={questions.length}
        selected={answerValues(answers, question.id)}
        headingRef={headingRef}
        onChoose={(value) => {
          go(choose(answers, question.id, value), step);
        }}
        onNext={() => go(answers, step + 1 >= questions.length ? "results" : step + 1)}
        onBack={() => go(answers, step === 0 ? "intro" : step - 1)}
      />
    );
  }

  return (
    <div ref={rootRef} className="scroll-mt-[calc(var(--header-h,4rem)+1rem)]">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div className={step === "results" ? "" : "card mx-auto max-w-3xl p-5 sm:p-8"}>{body}</div>
    </div>
  );
}

/** Shown while the quiz reads its answers from the address bar, and to visitors without JavaScript. */
export function TravelQuizFallback() {
  return (
    <div className="card mx-auto max-w-3xl p-5 sm:p-8">
      <p className="eyebrow">{questions.length} questions, about a minute</p>
      <p className="text-2xl font-semibold">Loading the quiz…</p>
      <p className="mt-1.5 text-ink-2">
        The quiz needs JavaScript. You can also browse every guide on the{" "}
        <Link href="/discover" className="link-text">
          Discover page
        </Link>
        .
      </p>
    </div>
  );
}
