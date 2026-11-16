import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RichText } from "@/components/assistant/RichText";
import { isAssistantConnected, runYatri } from "@/features/assistant/agent";
import { answerExtras } from "@/features/assistant/extras";
import { answerLocally, destinationBrief, festivalsInfo, findDestinations, holidaysInfo, planTrip, searchSite } from "@/features/assistant/knowledge";
import { completeCommand, runCommand, type TerminalData } from "@/features/assistant/terminal";

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

  it("says when it doesn't know, and still offers somewhere to start", () => {
    const answer = answerLocally("zzzzqqq xylophone");
    expect(answer).toContain("don't have a guide that matches");
    expect(answer).toMatch(/\/destinations\//);
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

/** Replays scripted gateway replies in place of the network. */
function fakeGateway(replies: (Record<string, unknown> | number)[]) {
  const bodies: Record<string, unknown>[] = [];
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    bodies.push({ ...JSON.parse(String(init.body)), url });
    const next = replies.shift();
    if (typeof next === "number") return new Response("{}", { status: next });
    return Response.json({ choices: [{ message: next }] });
  });
  vi.stubGlobal("fetch", fetchMock);
  return bodies;
}

const call = (name: string, args: unknown) => ({ id: `call-${name}`, type: "function", function: { name, arguments: JSON.stringify(args) } });

describe("Yatri agent (Vercel AI Gateway)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.AI_GATEWAY_API_KEY;
  });
  beforeEach(() => {
    process.env.AI_GATEWAY_API_KEY = "test-key";
  });

  it("runs the site's tools on the server and returns the final answer", async () => {
    const bodies = fakeGateway([{ content: null, tool_calls: [call("get_destination", { name: "Hampi" })] }, { content: "Visit [Hampi](/destinations/hampi) in winter." }]);
    const used: string[] = [];
    const reply = await runYatri({ messages: [{ role: "user", content: "Hampi?" }], onTool: (name) => used.push(name) });
    expect(reply.text).toContain("Hampi");
    expect(used).toEqual(["get_destination"]);
    expect(reply.toolOutput).toContain("/destinations/hampi");
    // The tool result goes back to the model, and the system prompt carries the rules.
    expect(JSON.stringify(bodies[1]!.messages)).toContain('"role":"tool"');
    expect(JSON.stringify(bodies[0]!.messages)).toContain("does not sell travel");
    expect(bodies[0]).toMatchObject({ model: "google/gemini-2.5-flash", max_tokens: 1500 });
  });

  it("moves to the next model when the first is busy or out of free credit", async () => {
    const bodies = fakeGateway([429, { content: "Hello" }]);
    const reply = await runYatri({ messages: [{ role: "user", content: "Hi" }], onTool: () => undefined });
    expect(reply.text).toBe("Hello");
    expect(bodies.map((body) => body.model)).toEqual(["google/gemini-2.5-flash", "nvidia/nemotron-3.5-lightning-free"]);
  });

  it("answers a bad tool call with an error instead of crashing", async () => {
    const bodies = fakeGateway([{ content: null, tool_calls: [call("get_destination", { name: "" }), call("delete_everything", {})] }, { content: "Sorry." }]);
    await runYatri({ messages: [{ role: "user", content: "Hi" }], onTool: () => undefined });
    const toolMessages = (bodies[1]!.messages as { role: string; content: string }[]).filter((message) => message.role === "tool");
    expect(toolMessages.map((message) => JSON.parse(message.content).error)).toEqual([expect.any(String), "Unknown tool"]);
  });

  it("gives up when every model fails, so the caller can answer from the guides", async () => {
    fakeGateway([500, 500]);
    await expect(runYatri({ messages: [{ role: "user", content: "Hi" }], onTool: () => undefined })).rejects.toThrow();
  });
});

describe("Yatri agent (Groq)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GROQ_API_KEY;
  });

  it("is off with no provider configured, so the guides answer", () => {
    expect(isAssistantConnected()).toBe(false);
  });

  it("uses Groq's free models with short reasoning when a Groq key is set", async () => {
    process.env.GROQ_API_KEY = "test-groq";
    expect(isAssistantConnected()).toBe(true);
    const bodies = fakeGateway([{ content: "Namaste" }]);
    const reply = await runYatri({ messages: [{ role: "user", content: "Hi" }], onTool: () => undefined });
    expect(reply.text).toBe("Namaste");
    expect(bodies[0]).toMatchObject({ url: "https://api.groq.com/openai/v1/chat/completions", model: "openai/gpt-oss-120b", reasoning_effort: "low" });
  });
});

describe("answer extras", () => {
  it("turns guide links into place cards and follow-ups, ignoring unknown places", () => {
    const extras = answerExtras("Try [Hampi](/destinations/hampi) or [Nowhere](/destinations/not-a-place).");
    expect(extras.cards.map((card) => card.slug)).toEqual(["hampi"]);
    expect(extras.cards[0]).toMatchObject({ name: "Hampi", state: "Karnataka" });
    expect(extras.sources.map((source) => source.href)).toEqual(["/destinations/hampi"]);
    expect(extras.followUps[0]).toMatch(/Hampi/);
  });

  it("never treats outside links as sources", () => {
    expect(answerExtras("See [this](https://evil.example) and [that](//evil.example)").sources).toEqual([]);
  });
});

describe("answer cards follow the answer", () => {
  it("shows only places the answer recommends, not everything the tools looked up", () => {
    const extras = answerExtras("Go to [Jaipur](/destinations/jaipur).", '{"href":"/destinations/agra"}{"href":"/destinations/aizawl"}');
    expect(extras.cards.map((card) => card.slug)).toEqual(["jaipur"]);
  });

  it("falls back to looked-up places when the answer links none", () => {
    const extras = answerExtras("Here are some ideas.", '{"href":"/destinations/agra"}');
    expect(extras.cards.map((card) => card.slug)).toEqual(["agra"]);
  });
});

describe("Yatri stays within free-plan limits", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GROQ_API_KEY;
  });

  it("keeps each tool result short and falls through all three Groq models", async () => {
    process.env.GROQ_API_KEY = "test-groq";
    const bodies = fakeGateway([429, 429, { content: null, tool_calls: [call("find_destinations", {})] }, { content: "Try [Agra](/destinations/agra)." }]);
    const reply = await runYatri({ messages: [{ role: "user", content: "Anywhere" }], onTool: () => undefined });
    expect(reply.text).toContain("Agra");
    expect(bodies.slice(0, 3).map((body) => body.model)).toEqual(["openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.1-8b-instant"]);
    const toolMessage = (bodies[3]!.messages as { role: string; content: string }[]).find((message) => message.role === "tool")!;
    expect(toolMessage.content.length).toBeLessThanOrEqual(3020);
  });
});
