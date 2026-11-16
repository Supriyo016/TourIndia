import { describe, expect, it } from "vitest";
import { moderate, normalise } from "@/features/community/moderation";

describe("comment moderation", () => {
  it("lets ordinary travel talk through, including complaints about crowds at places of worship", () => {
    for (const text of [
      "The sunrise boat on the Ganga was worth the early start.",
      "The temple was very crowded on Sunday, go on a weekday.",
      "Try litti chokha, the Bihari classic, near the station.",
      "The fort dates from the 12th century; the gate is from 300 BC era ruins.",
    ]) {
      expect(moderate(text).action, text).toBe("allow");
    }
  });

  it("masks everyday swearing, even when disguised", () => {
    const result = moderate("The road was f.u.c.k.i.n.g bad but the view was great");
    expect(result.action).toBe("mask");
    expect(result.action !== "reject" && result.text).not.toMatch(/f\.u\.c/i);
    expect(moderate("total sh1t service").action).toBe("mask");
  });

  it("refuses slurs and threats", () => {
    expect(moderate("go back you katua").action).toBe("reject");
    expect(moderate("they should die").action).toBe("reject");
  });

  it("holds hostile remarks about a faith or community for review", () => {
    const result = moderate("All muslims are backward");
    expect(result.action).toBe("review");
    expect(moderate("Hindus are dirty people").action).toBe("review");
  });

  it("blocks phone numbers, email addresses and outside links, but allows our own links", () => {
    expect(moderate("Call me on 98765 43210").action).toBe("reject");
    expect(moderate("mail me at someone@example.com").action).toBe("reject");
    expect(moderate("cheap rooms at https://spam.example/deal").action).toBe("reject");
    expect(moderate("See https://tour-india-pi.vercel.app/planner", { allowedHosts: ["tour-india-pi.vercel.app"] }).action).toBe("allow");
  });

  it("strips invisible and direction-changing characters", () => {
    const result = moderate("Nice‮place​");
    expect(result.action !== "reject" && result.text).toBe("Niceplace");
  });

  it("normalises look-alike characters", () => {
    expect(normalise("@$$ h0le")).toBe("ass hole");
  });
});
