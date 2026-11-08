import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareTool, type CompareRow } from "@/components/planner/CompareTool";
import { Notice, PageIntro } from "@/components/ui/primitives";
import { destinations, getState } from "@/data";
import { categoryName, formatMonthRange } from "@/data/taxonomy";
import { formatINRRange } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compare destinations",
  description: "Compare Indian destinations side by side by season, length of stay, estimated cost and access.",
  alternates: { canonical: "/compare" },
};

const rows: CompareRow[] = destinations.map((item) => ({
  slug: item.slug,
  name: item.name,
  state: getState(item.stateSlug)?.name ?? "",
  season: formatMonthRange(item.bestMonths),
  days: `${item.recommendedDays.min}–${item.recommendedDays.max} days`,
  budget: formatINRRange(item.budget.budget),
  midRange: formatINRRange(item.budget.midRange),
  comfort: formatINRRange(item.budget.comfort),
  styles: item.categories.slice(0, 4).map(categoryName).join(", "),
  getThere: item.gettingThere.air,
  permits: item.permits ?? "None listed in this guide",
  access: item.accessibility,
}));

export default function ComparePage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Plan", href: "/planner" }, { label: "Compare" }]} eyebrow="Plan" title="Compare destinations" lede="Put up to three guides side by side." />
      <div className="container-x space-y-6 py-8">
        <Suspense fallback={<p role="status" className="text-ink-2">Loading the comparison. It needs JavaScript to run.</p>}>
          <CompareTool rows={rows} />
        </Suspense>
        <Notice>Costs are editorial estimates per person, not quotes. Each guide explains what its figures assume.</Notice>
      </div>
    </>
  );
}
