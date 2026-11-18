import type { AnswerExtras } from "@/features/assistant/extras";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AskMode = "ai" | "guide";

/** Lets this browser, and only this one, rate the answer. Never stored. */
export interface AnswerMeta {
  id: string;
  token: string;
}

export async function rateAnswer(meta: AnswerMeta, vote: "up" | "down"): Promise<void> {
  const response = await fetch("/api/assistant/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...meta, vote }) });
  if (!response.ok) throw new Error("Thanks, but that rating couldn't be saved.");
}
export type { AnswerExtras, PlaceCard } from "@/features/assistant/extras";

/** Sends a conversation to Yatri on the server and streams the reply back. */
export async function askYatri(
  messages: ChatMessage[],
  handlers: { onText: (text: string) => void; onTool?: (name: string) => void; onExtras?: (extras: AnswerExtras) => void; onMeta?: (meta: AnswerMeta) => void; signal?: AbortSignal },
): Promise<AskMode> {
  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal: handlers.signal,
  });
  if (!response.ok || !response.body) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Yatri couldn't answer just now. Please try again.");
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let mode: AskMode = "guide";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return mode;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as { t: string; v?: unknown; mode?: AskMode; id?: unknown; token?: unknown };
      if (event.t === "text" && typeof event.v === "string") handlers.onText(event.v);
      if (event.t === "tool" && typeof event.v === "string") handlers.onTool?.(event.v);
      if (event.t === "extras" && event.v && typeof event.v === "object") handlers.onExtras?.(event.v as AnswerExtras);
      if (event.t === "meta" && typeof event.id === "string" && typeof event.token === "string") handlers.onMeta?.({ id: event.id, token: event.token });
      if (event.t === "done" && event.mode) mode = event.mode;
      if (event.t === "error") throw new Error(typeof event.v === "string" ? event.v : "Something went wrong.");
    }
  }
}

/** A Google search for the same question, offered after each answer. */
export const googleSearchUrl = (question: string) => `https://www.google.com/search?${new URLSearchParams({ q: `${question} India travel` })}`;
