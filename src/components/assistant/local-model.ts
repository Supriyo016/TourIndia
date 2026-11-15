/**
 * Yatri's optional on-device model. A small open model runs in the visitor's browser
 * through WebGPU (WebLLM), so answers cost nothing to serve and the conversation never
 * leaves the device. Nothing downloads until the visitor chooses to turn it on.
 *
 * Answers are grounded: the question first goes to the site's own guide search, and the
 * model only rewrites that material conversationally. It is told to stay on Tour India's
 * topics and never to criticise other sites.
 */
import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import type { ChatMessage } from "./ask";

/** Qwen2.5 0.5B, 4-bit: small, multilingual, and fast on most recent laptops and phones with WebGPU. */
export const LOCAL_MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
export const LOCAL_MODEL_SIZE = "about 300 to 400 MB";

let engine: Promise<MLCEngineInterface> | null = null;

export const hasWebGpu = () => typeof navigator !== "undefined" && "gpu" in navigator;

export function loadLocalModel(onProgress: (fraction: number, text: string) => void): Promise<MLCEngineInterface> {
  engine ??= import("@mlc-ai/web-llm")
    .then(({ CreateMLCEngine }) =>
      CreateMLCEngine(LOCAL_MODEL_ID, {
        initProgressCallback: (report) => onProgress(report.progress, report.text),
      }),
    )
    .catch((error) => {
      engine = null;
      throw error;
    });
  return engine;
}

const SYSTEM = `You are Yatri, the friendly travel assistant of the Tour India website.
Rules:
- Answer only about travel in India and this website's features (guides, planner, calendar, culture, bookings help).
- Use ONLY the facts in the CONTEXT. If the context doesn't answer the question, say you don't know and suggest searching the web.
- Keep every markdown link from the context exactly as written, such as [Hampi](/destinations/hampi). Never invent links.
- Never criticise or compare other websites, companies or people.
- Be respectful of every religion, community and region.
- Be concise: at most 120 words. Use short paragraphs or a short list.`;

export async function answerOnDevice(
  model: MLCEngineInterface,
  history: ChatMessage[],
  context: string,
  onText: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const question = history[history.length - 1]?.content ?? "";
  const earlier = history.slice(-5, -1).map((message) => ({ role: message.role, content: message.content.slice(0, 600) }));
  const stream = await model.chat.completions.create({
    stream: true,
    temperature: 0.3,
    max_tokens: 320,
    messages: [{ role: "system", content: SYSTEM }, ...earlier, { role: "user", content: `CONTEXT:\n${context.slice(0, 3500)}\n\nQUESTION: ${question}` }],
  });
  for await (const chunk of stream) {
    if (signal?.aborted) {
      model.interruptGenerate();
      return;
    }
    const text = chunk.choices[0]?.delta?.content;
    if (text) onText(text);
  }
}

/** A Google search for the question, for when the site's guides aren't enough. */
export const googleSearchUrl = (question: string) => `https://www.google.com/search?q=${encodeURIComponent(`${question} India travel`)}`;
