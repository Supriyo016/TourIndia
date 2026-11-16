import { questions, styleMatches, type QuizAnswers, type StyleAnswer } from "./questions";

/** "intro" before the quiz starts, a 0-based question index, or "results". */
export type QuizStep = "intro" | number | "results";

interface ReadableParams {
  get(name: string): string | null;
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((item) => item === value);
}

function allowedValues(id: string): string[] {
  return questions.find((question) => question.id === id)?.choices.map((choice) => choice.value) ?? [];
}

/** Reads answers from the query string, ignoring anything that is not a valid choice. */
export function readAnswers(params: ReadableParams): QuizAnswers {
  const month = oneOf(params.get("month"), allowedValues("month"));
  const length = oneOf(params.get("length"), allowedValues("length"));
  const styles = (params.get("style") ?? "")
    .split(",")
    .filter((value, index, list): value is StyleAnswer => value in styleMatches && list.indexOf(value) === index);
  return {
    month: month === undefined ? undefined : month === "any" ? "any" : (Number(month) as QuizAnswers["month"]),
    length: length === undefined ? undefined : (Number(length) as QuizAnswers["length"]),
    budget: oneOf(params.get("budget"), ["shoestring", "mid", "comfort"] as const),
    styles,
    pace: oneOf(params.get("pace"), ["relaxed", "balanced", "active"] as const),
    group: oneOf(params.get("group"), ["solo", "couple", "family", "seniors"] as const),
    climate: oneOf(params.get("climate"), ["cool", "warm", "any"] as const),
    crowd: oneOf(params.get("crowd"), ["popular", "mixed", "quiet"] as const),
  };
}

export function readStep(params: ReadableParams): QuizStep {
  const raw = params.get("step");
  if (raw === "results") return "results";
  const step = Number(raw);
  if (raw && Number.isInteger(step) && step >= 1 && step <= questions.length) return step - 1;
  return "intro";
}

/** Builds the query string for a set of answers and a step, in a stable order. */
export function writeQuery(answers: QuizAnswers, step: QuizStep): string {
  const params = new URLSearchParams();
  if (step !== "intro") params.set("step", step === "results" ? "results" : String(step + 1));
  if (answers.month !== undefined) params.set("month", String(answers.month));
  if (answers.length !== undefined) params.set("length", String(answers.length));
  if (answers.budget) params.set("budget", answers.budget);
  if (answers.styles.length) params.set("style", answers.styles.join(","));
  if (answers.pace) params.set("pace", answers.pace);
  if (answers.group) params.set("group", answers.group);
  if (answers.climate) params.set("climate", answers.climate);
  if (answers.crowd) params.set("crowd", answers.crowd);
  return params.toString().replaceAll("%2C", ",");
}

/** The answer to one question, as the string values used by the choices. */
export function answerValues(answers: QuizAnswers, id: (typeof questions)[number]["id"]): string[] {
  if (id === "styles") return answers.styles;
  const value = answers[id];
  return value === undefined ? [] : [String(value)];
}
