import { destinations, getState } from "@/data";
import { festivals } from "@/data/festivals";
import { holidaysForYear } from "@/data/holidays";
import { formatMonthRange } from "@/data/taxonomy";
import type { TerminalData } from "@/features/assistant/terminal";

export const dynamic = "force-static";

/** A small static index for the terminal, so its commands need no server work. */
export function GET() {
  const year = new Date().getUTCFullYear();
  const data: TerminalData = {
    destinations: destinations.map((item) => ({
      slug: item.slug,
      name: item.name,
      state: getState(item.stateSlug)?.name ?? "",
      months: item.bestMonths,
      season: formatMonthRange(item.bestMonths),
      days: `${item.recommendedDays.min}-${item.recommendedDays.max}`,
      tagline: item.tagline,
    })),
    festivals: festivals.map((item) => ({ slug: item.slug, name: item.name, months: item.months, when: item.confirmedDates[0]?.label ?? `Usually ${formatMonthRange(item.months)}` })),
    holidays: [...holidaysForYear(year), ...holidaysForYear(year + 1)].map(({ date, name }) => ({ date, name })),
  };
  return Response.json(data);
}
