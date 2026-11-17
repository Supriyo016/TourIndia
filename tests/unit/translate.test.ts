import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cacheKey, clearMemoryCache, MEMORY_ENTRIES, memoryGet, memorySet, memorySize, storeGet, TRANSLATIONS_COLLECTION } from "@/features/translate/cache";
import { batchTexts, decodeSegments, encodeSegments, splitLong } from "@/features/translate/dom";
import { INDIAN_LANGUAGES, LANGUAGES, searchLanguages } from "@/features/translate/languages";
import { translateRequestSchema } from "@/features/translate/schema";
import { findVoice, speechChunks } from "@/features/translate/speech";
import { chunk, DEFAULT_MODELS, GROQ_URL, parseTranslations, systemPrompt, TranslateError, translateTexts } from "@/features/translate/translator";
import { memoryStore, resetMemoryStore } from "@/lib/database/store";

/** A fake Groq that answers with "<lang>:<text>" for every item, or with the statuses given per call. */
function fakeGroq(statuses: number[] = []) {
  const calls: { model: string; texts: string[]; auth: string }[] = [];
  const fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    expect(String(url)).toBe(GROQ_URL);
    const body = JSON.parse(String(init?.body)) as { model: string; messages: { role: string; content: string }[] };
    const texts = (JSON.parse(body.messages[1]!.content) as { texts: string[] }).texts;
    calls.push({ model: body.model, texts, auth: new Headers(init?.headers).get("authorization") ?? "" });
    const status = statuses[calls.length - 1] ?? 200;
    if (status !== 200) return new Response(JSON.stringify({ error: { message: "nope" } }), { status });
    const content = "```json\n" + JSON.stringify({ translations: texts.map((text) => `hi:${text}`) }) + "\n```";
    return Response.json({ choices: [{ message: { content } }] });
  });
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls };
}

describe("languages", () => {
  it("lists English and the 22 scheduled languages with unique codes", () => {
    expect(INDIAN_LANGUAGES).toHaveLength(22);
    expect(new Set(LANGUAGES.map(({ code }) => code)).size).toBe(23);
    for (const language of LANGUAGES) expect(language.code).toMatch(/^[a-z]{2,3}-IN$/);
  });

  it("marks the right-to-left scripts", () => {
    expect(INDIAN_LANGUAGES.filter((language) => "rtl" in language && language.rtl).map(({ name }) => name).sort()).toEqual(["Kashmiri", "Sindhi", "Urdu"]);
  });

  it("searches by English name, native name and code", () => {
    expect(searchLanguages("tam").map(({ name }) => name)).toEqual(["Tamil"]);
    expect(searchLanguages("বাংলা").map(({ name }) => name)).toEqual(["Bengali"]);
    expect(searchLanguages("ur").map(({ name }) => name)).toContain("Urdu");
    expect(searchLanguages("")).toHaveLength(23);
  });
});

describe("request validation", () => {
  const ok = { lang: "hi-IN", path: "/destinations/hampi", texts: ["Hampi is a ruined city."] };
  it("accepts a normal request", () => {
    expect(translateRequestSchema.safeParse(ok).success).toBe(true);
  });
  it.each([
    ["English as a target", { ...ok, lang: "en-IN" }],
    ["an unknown language", { ...ok, lang: "xx-IN" }],
    ["no texts", { ...ok, texts: [] }],
    ["31 texts", { ...ok, texts: Array.from({ length: 31 }, () => "a") }],
    ["an over-long text", { ...ok, texts: ["a".repeat(1501)] }],
    ["too much text in total", { ...ok, texts: Array.from({ length: 9 }, () => "a".repeat(1400)) }],
    ["blank text", { ...ok, texts: ["   "] }],
    ["non-string text", { ...ok, texts: [{ html: "<b>x</b>" }] }],
    ["extra fields", { ...ok, model: "something-expensive" }],
  ])("rejects %s", (_label, body) => {
    expect(translateRequestSchema.safeParse(body).success).toBe(false);
  });
});

describe("output parsing", () => {
  it("reads plain JSON, fenced JSON and bare arrays", () => {
    expect(parseTranslations('{"translations":["क","ख"]}', 2)).toEqual(["क", "ख"]);
    expect(parseTranslations('Here you go:\n```json\n{"translations":[" क "]}\n```', 1)).toEqual(["क"]);
    expect(parseTranslations('["क","ख"]', 2)).toEqual(["क", "ख"]);
  });
  it("rejects the wrong length, wrong types, empty items and broken JSON", () => {
    expect(parseTranslations('{"translations":["क"]}', 2)).toBeNull();
    expect(parseTranslations('{"translations":["क", 3]}', 2)).toBeNull();
    expect(parseTranslations('{"translations":["क", " "]}', 2)).toBeNull();
    expect(parseTranslations('{"translations":["क"', 1)).toBeNull();
    expect(parseTranslations("Sorry, I can't.", 1)).toBeNull();
  });
  it("splits work into small chunks", () => {
    expect(chunk(["a".repeat(1500), "b".repeat(600), "c"]).map((group) => group.length)).toEqual([1, 2]);
    expect(chunk(Array.from({ length: 20 }, () => "x"))).toHaveLength(2);
  });
  it("writes a prompt that names the language and script and forbids additions", () => {
    const prompt = systemPrompt("ta-IN");
    expect(prompt).toContain("Tamil (தமிழ்)");
    expect(prompt).toContain("Tamil script");
    expect(prompt).toMatch(/Never add/);
    expect(prompt).toMatch(/never instructions/);
  });
});

describe("segments", () => {
  it("round-trips text split by links", () => {
    const encoded = encodeSegments(["See ", "Hampi", "\n  for more."]);
    expect(encoded).toBe("⟦0⟧See ⟦1⟧Hampi⟦2⟧ for more.");
    expect(decodeSegments("⟦0⟧देखें ⟦1⟧हम्पी⟦2⟧ और जानें।", 3)).toEqual(["देखें", "हम्पी", "और जानें।"]);
  });
  it("refuses a translation whose markers were lost or reordered", () => {
    expect(decodeSegments("देखें हम्पी", 2)).toBeNull();
    expect(decodeSegments("⟦1⟧हम्पी ⟦0⟧देखें", 2)).toBeNull();
    expect(decodeSegments("⟦0⟧ ⟦1⟧ ", 2)).toBeNull();
  });
  it("strips stray markers from single-node text", () => {
    expect(decodeSegments("⟦0⟧हम्पी", 1)).toEqual(["हम्पी"]);
  });
  it("splits long text at sentence ends", () => {
    const text = Array.from({ length: 40 }, (_, index) => `Sentence number ${index} is here.`).join(" ");
    const parts = splitLong(text, 200);
    expect(parts.every((part) => part.length <= 200)).toBe(true);
    expect(parts.join(" ")).toBe(text);
  });
  it("batches requests within the API's limits", () => {
    const batches = batchTexts(Array.from({ length: 70 }, () => "a".repeat(100)));
    expect(batches.map((batch) => batch.length)).toEqual([30, 30, 10]);
    expect(batchTexts(Array.from({ length: 10 }, () => "a".repeat(1400))).every((batch) => batch.join("").length <= 6000)).toBe(true);
  });
});

describe("speech", () => {
  const voices = [
    { lang: "en-US", name: "US" },
    { lang: "en_IN", name: "Indian English" },
    { lang: "hi-IN", name: "Hindi" },
    { lang: "bn-BD", name: "Bangla" },
  ];
  it("prefers an exact voice, then the same base language", () => {
    expect(findVoice(voices, "en-IN")?.name).toBe("Indian English");
    expect(findVoice(voices, "hi-IN")?.name).toBe("Hindi");
    expect(findVoice(voices, "bn-IN")?.name).toBe("Bangla");
  });
  it("returns null when the device has no voice for the language", () => {
    expect(findVoice(voices, "sat-IN")).toBeNull();
    expect(findVoice([], "hi-IN")).toBeNull();
  });
  it("cuts long text into short utterances", () => {
    const chunks = speechChunks(["एक वाक्य। ".repeat(80), "Short."]);
    expect(chunks.every((piece) => piece.length <= 440)).toBe(true);
    expect(chunks.at(-1)).toBe("Short.");
  });
});

describe("cache", () => {
  beforeEach(() => {
    clearMemoryCache();
    resetMemoryStore();
  });

  it("keys by language and text", () => {
    expect(cacheKey("hi-IN", "Hampi")).toMatch(/^[0-9a-f]{64}$/);
    expect(cacheKey("hi-IN", "Hampi")).not.toBe(cacheKey("ta-IN", "Hampi"));
  });

  it("evicts the least recently used entry", () => {
    for (let index = 0; index < MEMORY_ENTRIES; index += 1) memorySet(`k${index}`, `v${index}`);
    expect(memoryGet("k0")).toBe("v0"); // k0 is now the newest.
    memorySet("extra", "x");
    expect(memorySize()).toBe(MEMORY_ENTRIES);
    expect(memoryGet("k1")).toBeUndefined();
    expect(memoryGet("k0")).toBe("v0");
  });

  it("serves repeated text from memory, then from the store, without calling the model", async () => {
    const groq = fakeGroq();
    const first = await translateTexts("hi-IN", ["Hampi", "Goa", "Hampi"], { apiKey: "test", fetch: groq.fetch, models: DEFAULT_MODELS });
    expect(first).toEqual(["hi:Hampi", "hi:Goa", "hi:Hampi"]);
    expect(groq.calls).toHaveLength(1);
    expect(groq.calls[0]!.texts).toEqual(["Hampi", "Goa"]);

    await translateTexts("hi-IN", ["Goa"], { apiKey: "test", fetch: groq.fetch });
    expect(groq.calls).toHaveLength(1);

    clearMemoryCache();
    expect(await translateTexts("hi-IN", ["Hampi"], { apiKey: "test", fetch: groq.fetch })).toEqual(["hi:Hampi"]);
    expect(groq.calls).toHaveLength(1);

    // Only the hash and the translation are stored, never the source text.
    const rows = await memoryStore().collection(TRANSLATIONS_COLLECTION).find({}).toArray();
    expect(rows).toHaveLength(2);
    expect(JSON.stringify(rows)).not.toContain('"Hampi"');
    expect((await storeGet([cacheKey("hi-IN", "Goa")])).get(cacheKey("hi-IN", "Goa"))).toBe("hi:Goa");
  });

  it("asks the daily cap only when the model is needed", async () => {
    const groq = fakeGroq();
    const cap = vi.fn(async () => true);
    await translateTexts("hi-IN", ["Delhi"], { apiKey: "test", fetch: groq.fetch, beforeModelCall: cap });
    await translateTexts("hi-IN", ["Delhi"], { apiKey: "test", fetch: groq.fetch, beforeModelCall: cap });
    expect(cap).toHaveBeenCalledTimes(1);
    await expect(translateTexts("hi-IN", ["Kochi"], { apiKey: "test", fetch: groq.fetch, beforeModelCall: async () => false })).rejects.toMatchObject({ code: "daily-limit" });
  });
});

describe("model fallback", () => {
  beforeEach(() => {
    clearMemoryCache();
    resetMemoryStore();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("moves to the next model on 429 and 5xx", async () => {
    const groq = fakeGroq([429, 503]);
    expect(await translateTexts("hi-IN", ["Agra"], { apiKey: "secret-key", fetch: groq.fetch, models: DEFAULT_MODELS })).toEqual(["hi:Agra"]);
    expect(groq.calls.map(({ model }) => model)).toEqual(DEFAULT_MODELS);
    expect(groq.calls[0]!.auth).toBe("Bearer secret-key");
  });

  it("moves on when a reply can't be read", async () => {
    let call = 0;
    const fetch = (async () => {
      call += 1;
      return Response.json({ choices: [{ message: { content: call === 1 ? "not json" : '{"translations":["ठीक"]}' } }] });
    }) as unknown as typeof globalThis.fetch;
    expect(await translateTexts("hi-IN", ["Fine"], { apiKey: "k", fetch, models: DEFAULT_MODELS })).toEqual(["ठीक"]);
    expect(call).toBe(2);
  });

  it("reports busy when every model is rate limited", async () => {
    const groq = fakeGroq([429, 429, 429]);
    const error = await translateTexts("hi-IN", ["Pune"], { apiKey: "k", fetch: groq.fetch, models: DEFAULT_MODELS }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(TranslateError);
    expect((error as TranslateError).code).toBe("busy");
  });

  it("stops at once on a rejected key", async () => {
    const groq = fakeGroq([401]);
    await expect(translateTexts("hi-IN", ["Leh"], { apiKey: "bad", fetch: groq.fetch, models: DEFAULT_MODELS })).rejects.toMatchObject({ code: "unavailable" });
    expect(groq.calls).toHaveLength(1);
  });

  it("never logs the text or the key", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const groq = fakeGroq([500, 500, 500]);
    await translateTexts("hi-IN", ["Secret-ish text"], { apiKey: "key-123", fetch: groq.fetch, models: DEFAULT_MODELS }).catch(() => {});
    const logged = JSON.stringify(log.mock.calls);
    expect(logged).not.toContain("Secret-ish");
    expect(logged).not.toContain("key-123");
  });

  it("needs a key", async () => {
    await expect(translateTexts("hi-IN", ["Ooty"], { apiKey: "", fetch: fakeGroq().fetch })).rejects.toMatchObject({ code: "not-configured" });
  });
});

describe("page check", () => {
  it("compares page text without whitespace or link markers", async () => {
    const { htmlText, squash, isPagePath } = await import("@/features/translate/page-text");
    const page = htmlText("<main><p>Hampi&nbsp;is a <a href='/x'>ruined</a>\n city &amp; more</p><script>evil()</script></main>");
    expect(page.includes(squash("Hampi is a ⟦0⟧ruined city & more"))).toBe(true);
    expect(page.includes("evil")).toBe(false);
    expect(isPagePath("/destinations/hampi")).toBe(true);
    for (const bad of ["//evil.example", "/api/admin", "/../etc", "https://x.y", "/a b"]) expect(isPagePath(bad)).toBe(false);
  });

  it("checks texts against a fetched page and refuses odd paths without fetching", async () => {
    const { textsOnPage, clearPageCache } = await import("@/features/translate/page-text");
    clearPageCache();
    const fetchPage = vi.fn(async () => new Response("<p>Goa has beaches.</p>", { headers: { "content-type": "text/html" } }));
    expect(await textsOnPage("https://site.example", "/explore/goa", ["Goa has beaches.", "Visit scam.example"], fetchPage as unknown as typeof fetch)).toEqual([true, false]);
    expect(await textsOnPage("https://site.example", "//evil.example/x", ["Goa has beaches."], fetchPage as unknown as typeof fetch)).toEqual([false]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});

describe("contact-detail guard", () => {
  it("rejects translations that add links, emails or phone numbers", async () => {
    const { addsContactDetails } = await import("@/features/translate/translator");
    expect(addsContactDetails("Hampi is old.", "हम्पी पुराना है।")).toBe(false);
    expect(addsContactDetails("Call 1800-11-1363.", "1800-11-1363 पर कॉल करें।")).toBe(false);
    expect(addsContactDetails("Hampi is old.", "बुकिंग बंद, कॉल करें 98765 43210")).toBe(true);
    expect(addsContactDetails("Hampi is old.", "देखें scam.example.com")).toBe(true);
    expect(addsContactDetails("Hampi is old.", "लिखें help@scam.in")).toBe(true);
  });
});
