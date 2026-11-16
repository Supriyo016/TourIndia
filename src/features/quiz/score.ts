import { formatMonthRange, monthName } from "@/data/taxonomy";
import type { CategoryId, Destination, RegionId, TravelInterest } from "@/types/content";
import { styleMatches, type BudgetAnswer, type QuizAnswers, type StyleAnswer } from "./questions";

/** The slice of a destination the quiz needs, small enough to send to the browser. */
export interface QuizCandidate {
  slug: string;
  name: string;
  region: RegionId;
  categories: CategoryId[];
  interests: TravelInterest[];
  bestMonths: number[];
  minDays: number;
  /** Lowest daily cost per person in each band, in INR. */
  dailyFrom: Record<BudgetAnswer, number>;
  popular: boolean;
  hiddenGem: boolean;
  /** 0 easy, 1 moderate, 2 demanding (altitude, permits, remote or long transfers). */
  difficulty: 0 | 1 | 2;
}

export interface QuizMatch {
  slug: string;
  score: number;
  /** Why it fits, most important first. */
  reasons: string[];
  /** Things to know, such as being out of season. */
  cautions: string[];
}

/** Upper limit of each budget band, per person per day. */
export const budgetCaps: Record<BudgetAnswer, number> = { shoestring: 2500, mid: 7000, comfort: Infinity };

export function toCandidate(destination: Destination): QuizCandidate {
  const effort =
    (destination.categories.includes("mountains") ? 1 : 0) +
    (destination.categories.includes("adventure") ? 1 : 0) +
    (destination.permits ? 1 : 0) +
    (destination.recommendedDays.min >= 4 ? 1 : 0);
  return {
    slug: destination.slug,
    name: destination.name,
    region: destination.region,
    categories: destination.categories,
    interests: [...new Set(destination.attractions.flatMap((attraction) => attraction.interests))],
    bestMonths: destination.bestMonths,
    minDays: destination.recommendedDays.min,
    dailyFrom: {
      shoestring: destination.budget.budget[0],
      mid: destination.budget.midRange[0],
      comfort: destination.budget.comfort[0],
    },
    popular: destination.popular,
    hiddenGem: destination.hiddenGem,
    difficulty: effort >= 3 ? 2 : effort >= 1 ? 1 : 0,
  };
}

const lengthReason: Record<number, string> = {
  3: "Works for a long weekend",
  7: "Fits in about a week",
  14: "Plenty to fill two weeks",
};

const has = (candidate: QuizCandidate, ...ids: CategoryId[]) => ids.some((id) => candidate.categories.includes(id));

function scoreOne(candidate: QuizCandidate, answers: QuizAnswers): QuizMatch {
  let score = 0;
  const reasons: { text: string; weight: number }[] = [];
  const cautions: string[] = [];
  const add = (points: number, text?: string) => {
    score += points;
    if (text) reasons.push({ text, weight: points });
  };

  if (typeof answers.month === "number") {
    if (candidate.bestMonths.includes(answers.month)) add(6, `Best in ${monthName(answers.month)}`);
    else {
      add(-6);
      cautions.push(`${monthName(answers.month)} is outside the best season (${formatMonthRange(candidate.bestMonths)})`);
    }
  }

  if (answers.styles.length) {
    const matched = (Object.keys(styleMatches) as StyleAnswer[]).filter((style) => {
      if (!answers.styles.includes(style)) return false;
      const match = styleMatches[style];
      return has(candidate, ...match.categories) || match.interests.some((interest) => candidate.interests.includes(interest));
    });
    if (matched.length) add(matched.length * 4, `Matches: ${matched.map((style) => styleMatches[style].label).join(", ")}`);
    else add(-2);
  }

  if (answers.length !== undefined) {
    if (candidate.minDays <= answers.length) add(2, lengthReason[answers.length]);
    else {
      add(-5);
      cautions.push(`Best with at least ${candidate.minDays} days`);
    }
  }

  if (answers.budget && answers.budget !== "comfort") {
    if (candidate.dailyFrom[answers.budget] <= budgetCaps[answers.budget]) add(2, "Within your budget");
    else {
      add(-4);
      cautions.push("Usually costs more than your budget");
    }
  }

  if (answers.pace === "relaxed") {
    if (candidate.difficulty === 2) {
      add(-4);
      cautions.push("Demanding to reach and get around");
    } else if (candidate.difficulty === 0) add(2, "Easy-going to get around");
  } else if (answers.pace === "balanced") {
    if (candidate.difficulty === 2) add(-1);
  } else if (answers.pace === "active") {
    if (candidate.difficulty >= 1) add(2, "Rewards an active pace");
  }

  if (answers.group === "family") {
    if (candidate.difficulty === 2) {
      add(-3);
      cautions.push("Hard going with young children");
    } else if (has(candidate, "beaches", "wildlife", "national-parks", "lakes")) add(2, "Good for a family trip");
  } else if (answers.group === "seniors") {
    if (candidate.difficulty === 2) {
      add(-4);
      if (!cautions.includes("Demanding to reach and get around")) cautions.push("Demanding to reach and get around");
    } else if (candidate.difficulty === 0) add(2, "Gentle travel for older visitors");
  } else if (answers.group === "solo") {
    if (has(candidate, "cultural", "hidden-gems", "adventure")) add(1);
  } else if (answers.group === "couple") {
    if (has(candidate, "lakes", "beaches", "hill-stations", "forts-palaces")) add(1);
  }

  if (answers.climate === "cool") {
    if (has(candidate, "hill-stations", "mountains")) add(3, "Cool hill or mountain air");
    else if (has(candidate, "beaches")) add(-2);
  } else if (answers.climate === "warm") {
    if (has(candidate, "beaches") || candidate.region === "islands") add(3, "Warm coastal weather");
    else if (has(candidate, "mountains")) add(-2);
  }

  if (answers.crowd === "quiet") {
    if (candidate.hiddenGem) add(4, "Quieter and lesser-known");
    else if (candidate.popular) add(-2);
  } else if (answers.crowd === "popular") {
    if (candidate.popular) add(2, "A well-known classic");
  }

  const ordered = reasons.sort((a, b) => b.weight - a.weight).map((reason) => reason.text);
  if (!ordered.length) {
    ordered.push(candidate.popular ? "A well-known classic" : candidate.hiddenGem ? "Quieter and lesser-known" : "A good all-round choice");
  }
  return { slug: candidate.slug, score, reasons: ordered, cautions };
}

/**
 * Scores every destination against the answers and returns the best matches.
 * Pure and deterministic: ties go to well-known places, then alphabetical order.
 */
export function scoreDestinations(candidates: QuizCandidate[], answers: QuizAnswers, limit = 6): QuizMatch[] {
  const byPopularity = answers.crowd === "quiet" ? -1 : 1;
  const names = new Map(candidates.map((candidate) => [candidate.slug, candidate]));
  return candidates
    .map((candidate) => scoreOne(candidate, answers))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const pa = names.get(a.slug)!;
      const pb = names.get(b.slug)!;
      if (pa.popular !== pb.popular) return (pa.popular ? -1 : 1) * byPopularity;
      return pa.name.localeCompare(pb.name) || a.slug.localeCompare(b.slug);
    })
    .slice(0, limit);
}

/** How many stops to suggest in the planner for a trip length. */
export function plannerStops(length: number | undefined): number {
  if (length === undefined || length <= 3) return length === undefined ? 2 : 1;
  return length <= 7 ? 2 : 3;
}

/** Link to the trip planner, in the planner's own `d` and `days` query format. */
export function plannerHref(matches: QuizMatch[], length: number | undefined): string {
  const slugs = matches.slice(0, plannerStops(length)).map((match) => match.slug);
  return `/planner?d=${slugs.join(",")}&days=${length ?? 7}`;
}
