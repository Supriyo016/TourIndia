import { monthNames } from "@/data/taxonomy";
import type { CategoryId, TravelInterest } from "@/types/content";

/** Answer values, as they appear in the URL query. */
export type MonthAnswer = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "any";
export type LengthAnswer = 3 | 7 | 14;
export type BudgetAnswer = "shoestring" | "mid" | "comfort";
export type StyleAnswer =
  | "mountains"
  | "beaches"
  | "heritage"
  | "wildlife"
  | "food"
  | "spiritual"
  | "adventure"
  | "lakes"
  | "culture"
  | "villages";
export type PaceAnswer = "relaxed" | "balanced" | "active";
export type GroupAnswer = "solo" | "couple" | "family" | "seniors";
export type ClimateAnswer = "cool" | "warm" | "any";
export type CrowdAnswer = "popular" | "mixed" | "quiet";

export interface QuizAnswers {
  month?: MonthAnswer;
  length?: LengthAnswer;
  budget?: BudgetAnswer;
  styles: StyleAnswer[];
  pace?: PaceAnswer;
  group?: GroupAnswer;
  climate?: ClimateAnswer;
  crowd?: CrowdAnswer;
}

export type QuestionId = "month" | "length" | "budget" | "styles" | "pace" | "group" | "climate" | "crowd";

export interface QuizChoice {
  /** The value stored in the URL. */
  value: string;
  label: string;
  hint?: string;
}

export interface QuizQuestionDef {
  id: QuestionId;
  prompt: string;
  help: string;
  multiple: boolean;
  choices: QuizChoice[];
}

/** What each travel style matches in the destination data. */
export const styleMatches: Record<StyleAnswer, { label: string; chip: string; categories: CategoryId[]; interests: TravelInterest[] }> = {
  mountains: { label: "mountains", chip: "Mountains and hills", categories: ["mountains", "hill-stations"], interests: [] },
  beaches: { label: "beaches", chip: "Beaches", categories: ["beaches"], interests: [] },
  heritage: { label: "heritage", chip: "Heritage and forts", categories: ["monuments", "forts-palaces", "temples-heritage"], interests: [] },
  wildlife: { label: "wildlife", chip: "Wildlife", categories: ["wildlife", "national-parks"], interests: [] },
  food: { label: "food", chip: "Food", categories: [], interests: ["food"] },
  spiritual: { label: "spiritual", chip: "Spiritual places", categories: ["religious"], interests: [] },
  adventure: { label: "adventure", chip: "Adventure", categories: ["adventure"], interests: [] },
  lakes: { label: "lakes", chip: "Lakes and waterfalls", categories: ["lakes", "waterfalls"], interests: [] },
  culture: { label: "culture", chip: "Culture and crafts", categories: ["cultural"], interests: [] },
  villages: { label: "villages", chip: "Village life", categories: ["village"], interests: [] },
};

export const questions: QuizQuestionDef[] = [
  {
    id: "month",
    prompt: "When are you travelling?",
    help: "Pick the month you expect to go.",
    multiple: false,
    choices: [
      ...monthNames.map((name, index) => ({ value: String(index + 1), label: name })),
      { value: "any", label: "I'm flexible" },
    ],
  },
  {
    id: "length",
    prompt: "How long is the trip?",
    help: "Days on the ground, not counting long journeys.",
    multiple: false,
    choices: [
      { value: "3", label: "A long weekend", hint: "2 to 3 days" },
      { value: "7", label: "About a week", hint: "5 to 8 days" },
      { value: "14", label: "Two weeks or more", hint: "10 days and up" },
    ],
  },
  {
    id: "budget",
    prompt: "What's your daily budget per person?",
    help: "Rough spend on a room, food and local travel.",
    multiple: false,
    choices: [
      { value: "shoestring", label: "Shoestring", hint: "Under ₹2,500 a day" },
      { value: "mid", label: "Mid-range", hint: "₹2,500 to ₹7,000 a day" },
      { value: "comfort", label: "Comfort", hint: "₹7,000 a day or more" },
    ],
  },
  {
    id: "styles",
    prompt: "What do you want to do there?",
    help: "Choose as many as you like.",
    multiple: true,
    choices: (Object.keys(styleMatches) as StyleAnswer[]).map((value) => ({
      value,
      label: styleMatches[value].chip,
    })),
  },
  {
    id: "pace",
    prompt: "What pace suits you?",
    help: "This weighs how hard a place is to reach and get around.",
    multiple: false,
    choices: [
      { value: "relaxed", label: "Relaxed", hint: "Slow mornings, short transfers" },
      { value: "balanced", label: "Balanced", hint: "A full day, then a proper rest" },
      { value: "active", label: "Active", hint: "Early starts, long roads, altitude" },
    ],
  },
  {
    id: "group",
    prompt: "Who's travelling?",
    help: "So we can steer away from trips that are hard going.",
    multiple: false,
    choices: [
      { value: "solo", label: "Just me" },
      { value: "couple", label: "A couple" },
      { value: "family", label: "Family with children" },
      { value: "seniors", label: "Older travellers" },
    ],
  },
  {
    id: "climate",
    prompt: "What weather do you prefer?",
    help: "Seasons still matter, and the month question handles those.",
    multiple: false,
    choices: [
      { value: "cool", label: "Cool and crisp", hint: "Hills and mountains" },
      { value: "warm", label: "Warm and sunny", hint: "Coasts and islands" },
      { value: "any", label: "No preference" },
    ],
  },
  {
    id: "crowd",
    prompt: "Famous sights or quieter places?",
    help: "Well-known places are easier to plan. Quieter ones see fewer visitors.",
    multiple: false,
    choices: [
      { value: "popular", label: "The classics", hint: "Well-known and easy to plan" },
      { value: "mixed", label: "A mix of both" },
      { value: "quiet", label: "Somewhere quieter", hint: "Fewer visitors, more effort" },
    ],
  },
];
