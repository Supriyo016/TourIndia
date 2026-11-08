import type { Metadata } from "next";
import { toBrowserProps } from "@/components/discovery/discover-data";
import { TravelQuiz } from "@/components/planner/TravelQuiz";
import { PageIntro } from "@/components/ui/primitives";
import { destinations } from "@/data";

export const metadata: Metadata = {
  title: "Travel quiz",
  description: "Answer five questions to narrow down where to go in India.",
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Plan", href: "/planner" }, { label: "Travel quiz" }]} eyebrow="Plan" title="Where should you go?" lede="Five quick questions, and three guides matched to your answers." />
      <div className="container-x py-10">
        <TravelQuiz
          cards={toBrowserProps(destinations).cards}
          candidates={destinations.map((item) => ({
            slug: item.slug,
            categories: item.categories,
            region: item.region,
            months: item.bestMonths,
            minDays: item.recommendedDays.min,
          }))}
        />
      </div>
    </>
  );
}
