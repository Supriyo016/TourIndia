import { describe, expect, it } from "vitest";
import { cleanQuery } from "@/features/analytics/shared";
import { redact } from "@/features/assistant/insights";

/** Phone numbers must never reach analytics or stored Yatri questions, however they're written. */
const PHONES = ["415.555.1234", "(022) 2345 6789", "+91 98765 43210", "98765-43210", "9876543210", "080/2345/6789"];

describe("search terms kept by analytics", () => {
  it("drop phone numbers in every common format", () => {
    for (const phone of PHONES) expect(cleanQuery(`call ${phone}`), phone).toBeNull();
  });
  it("keep ordinary searches, including ones with short numbers", () => {
    expect(cleanQuery("Goa in December")).toBe("goa in december");
    expect(cleanQuery("NH 44 road trip")).toBe("nh 44 road trip");
    expect(cleanQuery("3 days in Jaipur 2026")).toBe("3 days in jaipur 2026");
  });
});

describe("Yatri questions kept for review", () => {
  it("replace phone numbers in every common format", () => {
    for (const phone of PHONES) expect(redact(`My number is ${phone}, call me`), phone).toBe("My number is [number], call me");
  });
  it("leave dates, years and short numbers alone", () => {
    expect(redact("Is Hampi good from 10 to 14 March 2027?")).toBe("Is Hampi good from 10 to 14 March 2027?");
    expect(redact("Train 12951 to Mumbai")).toBe("Train 12951 to Mumbai");
  });
});
