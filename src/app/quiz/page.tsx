import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowDown } from "lucide-react";
import { toBrowserProps } from "@/components/discovery/discover-data";
import { TravelQuiz, TravelQuizFallback } from "@/components/planner/TravelQuiz";
import type { QuizDetail } from "@/components/quiz/QuizResults";
import { Breadcrumbs, Photo, PhotoCredit } from "@/components/ui/primitives";
import { destinations, getState } from "@/data";
import { questions } from "@/features/quiz/questions";
import { toCandidate } from "@/features/quiz/score";
import { getImage } from "@/lib/images";

export const metadata: Metadata = {
  title: "Travel quiz",
  description: `Answer ${questions.length} quick questions on season, budget, pace and interests to find where to go in India.`,
  alternates: { canonical: "/quiz" },
};

const HERO = "hero:kashmir" as const;

export default function QuizPage() {
  const details: Record<string, QuizDetail> = Object.fromEntries(
    destinations.map((item) => {
      const image = getImage(`destination:${item.slug}`);
      return [
        item.slug,
        {
          name: item.name,
          state: getState(item.stateSlug)?.name ?? "",
          tagline: item.tagline,
          image: image && {
            src: image.src,
            alt: image.alt,
            blur: image.blur,
            author: image.author,
            license: image.license,
            sourceUrl: image.sourceUrl,
          },
        },
      ];
    }),
  );

  return (
    <>
      <header className="relative isolate flex min-h-[22rem] items-end overflow-hidden sm:min-h-[28rem]">
        <Photo imageKey={HERO} sizes="100vw" priority className="-z-20" />
        <div className="photo-scrim absolute inset-0 -z-10" />
        <div className="container-x pt-24 pb-8 text-white sm:pb-10">
          <p className="eyebrow !text-[#f7c26b]">Travel quiz</p>
          <h1 className="!text-white">Where should you go?</h1>
          <p className="mt-2 max-w-2xl text-lg text-white/90">
            {questions.length} quick questions about season, budget and pace. Six places that fit, and why.
          </p>
          <Link href="/quiz?step=1#quiz" className="btn btn-accent mt-5">
            Start the quiz
            <ArrowDown className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <Breadcrumbs items={[{ label: "Plan", href: "/planner" }, { label: "Travel quiz" }]} />
          <PhotoCredit imageKey={HERO} />
        </div>
      </div>

      <section id="quiz" aria-label="Travel quiz" className="container-x scroll-mt-[calc(var(--header-h,4rem)+1rem)] pt-4 pb-14">
        <Suspense fallback={<TravelQuizFallback />}>
          <TravelQuiz candidates={destinations.map(toCandidate)} cards={toBrowserProps(destinations).cards} details={details} />
        </Suspense>
      </section>
    </>
  );
}
