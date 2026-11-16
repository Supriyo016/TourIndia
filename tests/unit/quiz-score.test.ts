import { describe, expect, it } from "vitest";
import { destinations } from "@/data";
import { readAnswers, readStep, writeQuery } from "@/features/quiz/params";
import type { QuizAnswers } from "@/features/quiz/questions";
import { plannerHref, scoreDestinations, toCandidate, type QuizCandidate } from "@/features/quiz/score";

function candidate(overrides: Partial<QuizCandidate> & { slug: string }): QuizCandidate {
  return {
    name: overrides.slug,
    region: "north",
    categories: [],
    interests: [],
    bestMonths: [10, 11, 12, 1, 2, 3],
    minDays: 2,
    dailyFrom: { shoestring: 1500, mid: 3500, comfort: 9000 },
    popular: false,
    hiddenGem: false,
    difficulty: 0,
    ...overrides,
  };
}

const lake = candidate({ slug: "lake", categories: ["lakes", "mountains"], bestMonths: [9, 10, 11], popular: true });
const beach = candidate({ slug: "beach", region: "west", categories: ["beaches"], bestMonths: [11, 12, 1, 2], popular: true });
const pass = candidate({
  slug: "pass",
  categories: ["mountains", "adventure"],
  bestMonths: [6, 7, 8, 9],
  minDays: 5,
  difficulty: 2,
  hiddenGem: true,
  dailyFrom: { shoestring: 3000, mid: 8000, comfort: 15000 },
});
const temple = candidate({ slug: "temple", categories: ["religious", "temples-heritage"], interests: ["food"], hiddenGem: true });
const pool = [lake, beach, pass, temple];

const none: QuizAnswers = { styles: [] };

describe("quiz scoring", () => {
  it("returns a stable, reasoned list for empty answers", () => {
    const first = scoreDestinations(pool, none);
    expect(first.map((match) => match.slug)).toEqual(["beach", "lake", "pass", "temple"]);
    expect(first.every((match) => match.score === 0 && match.reasons.length > 0)).toBe(true);
    expect(scoreDestinations(pool, none)).toEqual(first);
  });

  it("returns at most six matches from the real catalogue, and is deterministic", () => {
    const all = destinations.map(toCandidate);
    const answers: QuizAnswers = { month: 10, length: 7, budget: "mid", styles: ["lakes", "mountains"], pace: "balanced", group: "couple", climate: "cool", crowd: "mixed" };
    const results = scoreDestinations(all, answers);
    expect(results).toHaveLength(6);
    expect(scoreDestinations(all, answers)).toEqual(results);
    expect(new Set(results.map((match) => match.slug)).size).toBe(6);
  });

  it("favours the month and styles chosen, with readable reasons", () => {
    const [top] = scoreDestinations(pool, { month: 10, styles: ["lakes", "mountains"] });
    expect(top!.slug).toBe("lake");
    expect(top!.reasons).toContain("Best in October");
    expect(top!.reasons).toContain("Matches: mountains, lakes");
  });

  it("flags trips that are out of season, too long or over budget", () => {
    const results = scoreDestinations(pool, { month: 1, length: 3, budget: "shoestring", styles: [] });
    const passMatch = results.find((match) => match.slug === "pass")!;
    expect(results.at(-1)!.slug).toBe("pass");
    expect(passMatch.cautions).toEqual([
      "January is outside the best season (June to September)",
      "Best with at least 5 days",
      "Usually costs more than your budget",
    ]);
    expect(results[0]!.reasons).toContain("Within your budget");
  });

  it("steers relaxed travellers and families away from demanding places", () => {
    const relaxed = scoreDestinations(pool, { styles: ["adventure", "spiritual"], pace: "relaxed", group: "seniors" });
    expect(relaxed[0]!.slug).toBe("temple");
    expect(relaxed.find((match) => match.slug === "pass")!.cautions).toContain("Demanding to reach and get around");
    const active = scoreDestinations(pool, { styles: ["adventure", "spiritual"], pace: "active", group: "solo" });
    expect(active[0]!.slug).toBe("pass");
  });

  it("prefers lesser-known places when asked for quiet, and warm places for warm weather", () => {
    const quiet = scoreDestinations(pool, { styles: [], crowd: "quiet" });
    expect(quiet.slice(0, 2).map((match) => match.slug)).toEqual(["pass", "temple"]);
    expect(quiet[0]!.reasons).toContain("Quieter and lesser-known");
    const warm = scoreDestinations(pool, { styles: [], climate: "warm" });
    expect(warm[0]!.slug).toBe("beach");
    expect(warm[0]!.reasons).toContain("Warm coastal weather");
  });

  it("matches food through attraction interests", () => {
    const [top] = scoreDestinations(pool, { styles: ["food"] });
    expect(top!.slug).toBe("temple");
    expect(top!.reasons).toEqual(["Matches: food"]);
  });

  it("builds a planner link in the planner's d and days format", () => {
    const results = scoreDestinations(pool, none);
    expect(plannerHref(results, 7)).toBe("/planner?d=beach,lake&days=7");
    expect(plannerHref(results, 3)).toBe("/planner?d=beach&days=3");
    expect(plannerHref(results, 14)).toBe("/planner?d=beach,lake,pass&days=14");
    expect(plannerHref(results, undefined)).toBe("/planner?d=beach,lake&days=7");
  });
});

describe("quiz URL state", () => {
  it("round-trips answers and the step through the query string", () => {
    const answers: QuizAnswers = { month: "any", length: 14, budget: "comfort", styles: ["food", "lakes"], pace: "active", group: "family", climate: "cool", crowd: "quiet" };
    const query = writeQuery(answers, 3);
    expect(query).toBe("step=4&month=any&length=14&budget=comfort&style=food,lakes&pace=active&group=family&climate=cool&crowd=quiet");
    const params = new URLSearchParams(query);
    expect(readAnswers(params)).toEqual(answers);
    expect(readStep(params)).toBe(3);
  });

  it("ignores invalid values", () => {
    const params = new URLSearchParams("step=99&month=13&length=5&style=lakes,nope,lakes&pace=fast");
    expect(readStep(params)).toBe("intro");
    expect(readAnswers(params)).toEqual({ styles: ["lakes"], month: undefined, length: undefined, budget: undefined, pace: undefined, group: undefined, climate: undefined, crowd: undefined });
    expect(readStep(new URLSearchParams("step=results"))).toBe("results");
  });
});
