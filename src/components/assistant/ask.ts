import type { AnswerExtras } from "@/features/assistant/extras";
import { track } from "@/lib/analytics/track";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AskMode = "ai" | "guide";
export type { AnswerExtras, PlaceCard } from "@/features/assistant/extras";

/** Sends a conversation to Yatri on the server and streams the reply back. */
export async function askYatri(
  messages: ChatMessage[],
  handlers: { onText: (text: string) => void; onTool?: (name: string) => void; onExtras?: (extras: AnswerExtras) => void; signal?: AbortSignal },
): Promise<AskMode> {
  track("yatri_ask");
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
      const event = JSON.parse(line) as { t: string; v?: unknown; mode?: AskMode };
      if (event.t === "text" && typeof event.v === "string") handlers.onText(event.v);
      if (event.t === "tool" && typeof event.v === "string") handlers.onTool?.(event.v);
      if (event.t === "extras" && event.v && typeof event.v === "object") handlers.onExtras?.(event.v as AnswerExtras);
      if (event.t === "done" && event.mode) mode = event.mode;
      if (event.t === "error") throw new Error(typeof event.v === "string" ? event.v : "Something went wrong.");
    }
  }
}

/** A Google search for the same question, offered after each answer. */
export const googleSearchUrl = (question: string) => `https://www.google.com/search?${new URLSearchParams({ q: `${question} India travel` })}`;
