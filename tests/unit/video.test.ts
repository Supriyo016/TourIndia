import { describe, expect, it } from "vitest";
import { pickRendition, stepDown, tourVideo } from "@/data/tour-video";

describe("video quality", () => {
  it("lists renditions largest first, each with a file", () => {
    expect(tourVideo.renditions.map((item) => item.height)).toEqual([720, 480, 360]);
  });

  it("picks from the reported network", () => {
    expect(pickRendition({ effectiveType: "4g", downlink: 10 }, 1000)).toBe(720);
    expect(pickRendition({ effectiveType: "4g", downlink: 2 }, 1000)).toBe(480);
    expect(pickRendition({ effectiveType: "3g", downlink: 1.6 }, 1000)).toBe(360);
    expect(pickRendition({ effectiveType: "2g" }, 1000)).toBe(360);
    expect(pickRendition({ effectiveType: "4g", downlink: 50, saveData: true }, 1000)).toBe(360);
  });

  it("never picks more than the player can show", () => {
    expect(pickRendition({ effectiveType: "4g", downlink: 50 }, 300)).toBe(360);
    expect(pickRendition({ effectiveType: "4g", downlink: 50 }, 450)).toBe(480);
  });

  it("falls back to 480p when the browser reports no network details", () => {
    expect(pickRendition(undefined, 1000)).toBe(480);
  });

  it("steps down one size at a time", () => {
    expect(stepDown(720)).toBe(480);
    expect(stepDown(480)).toBe(360);
    expect(stepDown(360)).toBe(360);
  });
});
