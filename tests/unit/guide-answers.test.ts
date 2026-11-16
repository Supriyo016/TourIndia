import { describe, expect, it } from "vitest";
import { answerLocally } from "@/features/assistant/knowledge";

/** Everyday questions that used to end in "I couldn't find that". Each must now point somewhere useful. */
const cases: [string, RegExp][] = [
  ["Where should I go this month?", /\/destinations\//],
  ["best beaches in south india", /\/destinations\//],
  ["where can I see snow in january", /\/destinations\//],
  ["trekking places", /\/destinations\//],
  ["What should I eat in Rajasthan?", /\/culture\/food\//],
  ["Festivals near Hampi", /\/culture\/festivals\//],
  ["Plan 3 days in Goa", /\/planner\?d=goa&days=3/],
  ["places to visit in Kerala", /\/destinations\//],
  ["a quiet hill station for summer", /\/destinations\//],
  ["temples to visit", /\/destinations\//],
  ["wildlife safari", /\/destinations\//],
];

describe("answers from the guides alone", () => {
  it.each(cases)("%s", (question, expected) => {
    const answer = answerLocally(question);
    expect(answer).toMatch(expected);
    expect(answer).not.toMatch(/couldn't find/);
  });

  it("still offers seasonal picks, not a dead end, for something off-topic", () => {
    const answer = answerLocally("qwertyuiop zxcvb");
    expect(answer).toMatch(/\/destinations\//);
    expect(answer).toMatch(/browse every guide/);
  });
});
