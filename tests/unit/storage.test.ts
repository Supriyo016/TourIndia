import { describe, expect, it } from "vitest";
import { isExpenseState, isSavedTripList, isStringList, matchesShape } from "@/hooks/use-stored-value";

describe("stored data checks", () => {
  it("matches the shape of the fallback", () => {
    expect(matchesShape([], [])).toBe(true);
    expect(matchesShape({}, [])).toBe(false);
    expect(matchesShape(null, [])).toBe(false);
    expect(matchesShape({ people: [], expenses: [] }, { people: [], expenses: [] })).toBe(true);
    expect(matchesShape({ people: [] }, { people: [], expenses: [] })).toBe(false);
    expect(matchesShape([], { people: [] })).toBe(false);
  });

  it("recognises valid and corrupted lists", () => {
    expect(isStringList(["goa"])).toBe(true);
    expect(isStringList([1])).toBe(false);
  });

  it("rejects malformed saved trips", () => {
    const good = { id: "1", name: "A", savedAt: "2026-01-01", input: {}, days: [{ items: [] }] };
    expect(isSavedTripList([good])).toBe(true);
    expect(isSavedTripList([{ ...good, days: [null] }])).toBe(false);
    expect(isSavedTripList([{ ...good, days: "x" }])).toBe(false);
    expect(isSavedTripList([null])).toBe(false);
  });

  it("rejects malformed expenses", () => {
    const expense = { id: "1", label: "Taxi", amount: 10, paidBy: "A" };
    expect(isExpenseState({ people: ["A"], expenses: [expense] })).toBe(true);
    expect(isExpenseState({ people: ["A"], expenses: [{ ...expense, amount: "10" }] })).toBe(false);
    expect(isExpenseState({ people: "A", expenses: [] })).toBe(false);
  });
});
