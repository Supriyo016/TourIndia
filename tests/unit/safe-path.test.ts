import { describe, expect, it } from "vitest";
import { safePath } from "@/lib/safe-path";

describe("safe return paths", () => {
  it("keeps same-site paths with their query and hash", () => {
    expect(safePath("/planner?d=hampi#itinerary")).toBe("/planner?d=hampi#itinerary");
  });

  it("refuses anything that could leave the site", () => {
    for (const value of ["//evil.example", "/\\evil.example", "/\t/evil.example", "/\n/evil.example", "https://evil.example", "javascript:alert(1)", "evil", "", null]) {
      expect(safePath(value), String(value)).toBe("/");
    }
  });
});
