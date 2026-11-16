import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { RichText } from "@/components/assistant/RichText";
import { runYatri } from "@/features/assistant/agent";
import { answerLocally, destinationBrief, festivalsInfo, findDestinations, holidaysInfo, planTrip, searchSite } from "@/features/assistant/knowledge";
import { completeCommand, runCommand, type TerminalData } from "@/features/assistant/terminal";
import type Anthropic from "@anthropic-ai/sdk";

const data: TerminalData = {
  destinations: [
    { slug: "hampi", name: "Hampi", state: "Karnataka", months: [11, 12], season: "November to December", days: "2-4", tagline: "Ruins" },
    { slug: "agra", name: "Agra", state: "Uttar Pradesh", months: [1], season: "January", days: "1-2", tagline: "Taj" },
  ],
  festivals: [{ slug: "diwali", name: "Diwali", months: [10], when: "29 October 2027" }],
  holidays: [{ date: "2026-11-24", name: "Guru Nanak's Birthday" }, { date: "2020-01-26", name: "Old" }],
};
const run = (input: string) => runCommand(input, data, "2026-11-09", () => 0);

describe("terminal", () => {
  it("lists commands", () => {
    expect(run("help").lines.map((line) => line.text).join()).toContain("ask <question>");
  });

  it("is case-insensitive on commands", () => {
    expect(run("HELP").lines.length).toBeGreaterThan(5);
  });

  it("finds and summarises places", () => {
    expect(run("find ruins").lines[0]).toMatchObject({ text: "Hampi, Karnataka", href: "/destinations/hampi" });
    expect(run("guide hampi").lines.map((line) => line.text).join()).toContain("November to December");
  });

  it("opens pages and places", () => {
    expect(run("open map").effect).toEqual({ type: "open", href: "/explore" });
    expect(run("open hampi").effect).toEqual({ type: "open", href: "/destinations/hampi" });
  });

  it("filters by month, accepting short names", () => {
    expect(run("season nov").lines.map((line) => line.text).join()).toContain("Hampi");
    expect(run("festivals october").lines[0]?.text).toContain("Diwali");
  });

  it("shows only upcoming holidays", () => {
    expect(run("holidays").lines.map((line) => line.text)).toEqual(["2026-11-24  Guru Nanak's Birthday"]);
  });

  it("builds a planner link, capping days", () => {
    expect(run("plan hampi agra 99").effect).toEqual({ type: "open", href: "/planner?d=hampi,agra&days=45" });
  });

  it("explains misuse and unknown commands", () => {
    expect(run("guide").lines[0]?.text).toContain("usage");
    expect(run("guide atlantis").lines[0]?.tone).toBe("error");
    expect(run("rm -rf /").lines[0]?.text).toContain("Unknown command");
  });

  it("can't navigate outside the site", () => {
    expect(run("open https://evil.example").effect).toBeUndefined();
  });

  it("completes commands and places", () => {
    expect(completeCommand("he", data)).toBe("help ");
    expect(completeCommand("guide ham", data)).toBe("guide hampi");
  });
});

describe("site knowledge", () => {
  it("finds a guide by name and reports a miss honestly", () => {
    expect(destinationBrief("Hampi")).toMatchObject({ found: true, href: "/destinations/hampi" });
    expect(destinationBrief("Atlantis").found).toBe(false);
  });

  it("filters destinations", () => {
    expect(findDestinations({ month: 7, region: "north", limit: 3 }).length).toBeLessThanOrEqual(3);
    expect(findDestinations({ category: "beaches" }).length).toBeGreaterThan(0);
  });

  it("returns official festival dates", () => {
    expect(festivalsInfo({ name: "Diwali" })[0]?.confirmedDates[0]).toContain("29 October 2027");
  });

  it("returns holidays for a month", () => {
    expect(holidaysInfo({ year: 2027, month: 10 }).holidays.map((holiday) => holiday.name)).toContain("Diwali");
  });

  it("plans a trip with a working planner link and labelled estimates", () => {
    const trip = planTrip({ start: "Mumbai", destinations: ["Hampi"], days: 4 });
    expect(trip.found).toBe(true);
    expect(trip.openInPlanner).toMatch(/^\/planner#trip=/);
    expect(trip.estimateAssumptions?.join()).toContain("None of these figures is a quote");
  });

  it("clamps absurd trip requests", () => {
    expect(planTrip({ start: "Delhi", destinations: ["Goa"], days: 9999, travellers: 9999 }).days!.length).toBeLessThanOrEqual(50);
  });

  it("searches the site", () => {
    expect(searchSite("hampi")[0]?.title).toBe("Hampi");
  });
});

describe("guide-mode answers", () => {
  it.each([
    ["What is the emergency number?", "112"],
    ["Tell me about Hampi", "/destinations/hampi"],
    ["Where should I go in January?", "January"],
    ["Tell me about Kerala", "/explore/kerala"],
    ["When is the next holiday?", "/calendar"],
    ["Can you book my train ticket?", "/bookings"],
    ["Do I need a permit for Tawang?", "/stories/permits-for-restricted-areas"],
    ["When is Diwali?", "29 October 2027"],
  ])("%s", (question, expected) => {
    expect(answerLocally(question)).toContain(expected);
  });

  it("says when it doesn't know", () => {
    expect(answerLocally("zzzzqqq xylophone")).toContain("couldn't find");
  });
});

describe("reply rendering", () => {
  const html = (text: string) => renderToStaticMarkup(createElement(RichText, { text }));

  it("renders same-site links and bold", () => {
    expect(html("See [Hampi](/destinations/hampi) **now**")).toContain('href="/destinations/hampi"');
    expect(html("**bold**")).toContain("<strong>bold</strong>");
  });

  it.each(["[x](https://evil.example)", "[x](//evil.example/a)", "[x](javascript:alert(1))"])("won't link %s", (text) => {
    expect(html(text)).not.toContain("<a");
  });

  it("escapes markup", () => {
    expect(html('<img src=x onerror="alert(1)">')).not.toContain("<img");
  });
});

/** A stand-in for the SDK that replays scripted streaming events. */
function fakeClient(turns: { events: unknown[]; message: Partial<Anthropic.Message> }[]) {
  const toolRunner = vi.fn(() => ({
    params: {},
    async *[Symbol.asyncIterator]() {
      for (const turn of turns) {
        yield {
          async *[Symbol.asyncIterator]() {
            yield* turn.events;
          },
          finalMessage: async () => ({ content: [], ...turn.message }),
        };
      }
    },
  }));
  return { client: { beta: { messages: { toolRunner } } } as unknown as Anthropic, toolRunner };
}

describe("Yatri agent", () => {
  const text = (value: string) => ({ type: "content_block_delta", delta: { type: "text_delta", text: value } });
  const tool = (name: string) => ({ type: "content_block_start", content_block: { type: "tool_use", name } });

  it("streams text and reports tool use", async () => {
    const { client } = fakeClient([
      { events: [tool("get_destination")], message: { stop_reason: "tool_use" } },
      { events: [text("Hello "), text("there")], message: { stop_reason: "end_turn" } },
    ]);
    const output: string[] = [];
    const used: string[] = [];
    await runYatri({ client, messages: [{ role: "user", content: "Hi" }], onText: (value) => output.push(value), onTool: (name) => used.push(name) });
    expect(output.join("")).toBe("Hello there");
    expect(used).toEqual(["get_destination"]);
  });

  it("sends the expected request: model, caching, fallbacks and a tool limit", async () => {
    const { client, toolRunner } = fakeClient([{ events: [], message: { stop_reason: "end_turn" } }]);
    await runYatri({ client, messages: [{ role: "user", content: "Hi" }], onText: () => undefined, onTool: () => undefined });
    const params = (toolRunner.mock.calls as unknown as [Record<string, unknown>][])[0]![0];
    expect(params).toMatchObject({ model: "claude-opus-5-5", fallbacks: "default", betas: ["server-side-fallback-2026-07-01"], stream: true, max_iterations: 6 });
    expect(JSON.stringify(params.system)).toContain("ephemeral");
    expect(JSON.stringify(params.system)).toContain("does not sell travel");
  });

  it("explains a refusal instead of going silent", async () => {
    const { client } = fakeClient([{ events: [], message: { stop_reason: "refusal" } }]);
    const output: string[] = [];
    await runYatri({ client, messages: [{ role: "user", content: "Hi" }], onText: (value) => output.push(value), onTool: () => undefined });
    expect(output.join("")).toContain("can't help");
  });

  it("stops rather than running a truncated tool call", async () => {
    const { client } = fakeClient([{ events: [], message: { stop_reason: "max_tokens", content: [{ type: "tool_use" }] as never } }]);
    await expect(runYatri({ client, messages: [{ role: "user", content: "Hi" }], onText: () => undefined, onTool: () => undefined })).rejects.toThrow("cut off");
  });
});
