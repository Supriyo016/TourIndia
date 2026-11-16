import "server-only";
import { destinations, getState } from "@/data";
import { formatMonthRange } from "@/data/taxonomy";
import { getImage } from "@/lib/images";

/** A place Yatri mentioned, shown as a card under the answer. */
export interface PlaceCard {
  slug: string;
  name: string;
  state: string;
  tagline: string;
  bestMonths: string;
  days: string;
  image?: { src: string; alt: string; blur?: string };
}

export interface AnswerExtras {
  cards: PlaceCard[];
  sources: { label: string; href: string }[];
  followUps: string[];
}

const bySlug = new Map(destinations.map((item) => [item.slug, item]));
// A same-site path: one leading slash only, since "//host" would leave the site.
const LINK = /\[([^\]]{1,80})\]\((\/(?!\/)[a-z0-9/_?=&,.-]{0,120})\)/gi;
const GUIDE = /\/destinations\/([a-z0-9-]+)/g;

/**
 * Builds the cards, sources and follow-up questions for one answer from the site
 * links it contains. Places named in the answer come first, then ones only the
 * tools looked up. Nothing here comes from the model except the links themselves,
 * and every link is checked against the site's own data.
 */
export function answerExtras(text: string, toolOutput = ""): AnswerExtras {
  const ordered = [...text.matchAll(GUIDE), ...toolOutput.matchAll(GUIDE)].map((match) => match[1]!);
  const cards = [...new Set(ordered)]
    .flatMap((slug) => {
      const item = bySlug.get(slug);
      if (!item) return [];
      const image = getImage(`destination:${slug}`);
      return [{
        slug,
        name: item.name,
        state: getState(item.stateSlug)?.name ?? "",
        tagline: item.tagline,
        bestMonths: formatMonthRange(item.bestMonths),
        days: `${item.recommendedDays.min}–${item.recommendedDays.max} days`,
        image: image && { src: image.src, alt: image.alt, blur: image.blur },
      }];
    })
    .slice(0, 4);

  const sources = [...new Map([...text.matchAll(LINK)].map((match) => [match[2]!, { label: match[1]!, href: match[2]! }])).values()]
    .filter((link) => !link.href.startsWith("/destinations/") || bySlug.has(link.href.split("/")[2]!))
    .slice(0, 5);

  const first = cards[0];
  const followUps = first
    ? [`Plan ${first.days.split("–")[0]} days in ${first.name}`, `What should I eat in ${first.state}?`, `Festivals near ${first.name}`]
    : ["Where is good to visit this month?", "Plan a week in Rajasthan", "Which festivals are coming up?"];

  return { cards, sources, followUps };
}
