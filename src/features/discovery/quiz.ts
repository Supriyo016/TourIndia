import type { CategoryId, RegionId } from "@/types/content";

export interface QuizOption {
  label: string;
  categories?: CategoryId[];
  regions?: RegionId[];
  month?: number[];
  maxDays?: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

export const quiz: QuizQuestion[] = [
  {
    id: "scene",
    prompt: "Which view would you most like to wake up to?",
    options: [
      { label: "Snow peaks and thin, clear air", categories: ["mountains", "hill-stations"] },
      { label: "Palm trees and water", categories: ["beaches", "lakes"] },
      { label: "Carved stone and old walls", categories: ["monuments", "forts-palaces", "temples-heritage"] },
      { label: "Forest, with something moving in it", categories: ["wildlife", "national-parks"] },
    ],
  },
  {
    id: "pace",
    prompt: "How do you like to spend a day away?",
    options: [
      { label: "On a trail or in the water", categories: ["adventure", "mountains"] },
      { label: "Among people, markets and food", categories: ["cultural"] },
      { label: "Quietly, somewhere few others go", categories: ["hidden-gems", "village"] },
      { label: "At a place of faith or reflection", categories: ["religious", "temples-heritage"] },
    ],
  },
  {
    id: "when",
    prompt: "When can you travel?",
    options: [
      { label: "October to February", month: [10, 11, 12, 1, 2] },
      { label: "March to May", month: [3, 4, 5] },
      { label: "June to September", month: [6, 7, 8, 9] },
      { label: "I'm flexible" },
    ],
  },
  {
    id: "where",
    prompt: "Is there a part of India calling you?",
    options: [
      { label: "The north and the Himalaya", regions: ["north"] },
      { label: "The south and the coasts", regions: ["south", "west", "islands"] },
      { label: "The east and the Northeast", regions: ["east", "northeast"] },
      { label: "Surprise me" },
    ],
  },
  {
    id: "time",
    prompt: "How long do you have?",
    options: [
      { label: "A long weekend", maxDays: 3 },
      { label: "About a week", maxDays: 7 },
      { label: "Two weeks or more" },
    ],
  },
];

export interface QuizCandidate {
  slug: string;
  categories: CategoryId[];
  region: RegionId;
  months: number[];
  minDays: number;
}

/** Ranks destinations by how many of the chosen answers they satisfy. */
export function scoreQuiz(candidates: QuizCandidate[], answers: QuizOption[], limit = 3): string[] {
  return candidates
    .map((candidate) => {
      let score = 0;
      for (const answer of answers) {
        score += (answer.categories ?? []).filter((category) => candidate.categories.includes(category)).length * 3;
        if (answer.regions?.includes(candidate.region)) score += 4;
        if (answer.month) score += answer.month.some((month) => candidate.months.includes(month)) ? 3 : -8;
        if (answer.maxDays !== undefined && candidate.minDays > answer.maxDays) score -= 6;
      }
      return { slug: candidate.slug, score };
    })
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .slice(0, limit)
    .map(({ slug }) => slug);
}
