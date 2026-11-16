export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AskMode = "ai" | "guide";

/** Sends a conversation to the assistant and streams the reply back. */
export async function askYatri(
  messages: ChatMessage[],
  handlers: { onText: (text: string) => void; onTool?: (name: string) => void; signal?: AbortSignal },
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
      const event = JSON.parse(line) as { t: string; v?: string; mode?: AskMode };
      if (event.t === "text" && event.v) handlers.onText(event.v);
      if (event.t === "tool" && event.v) handlers.onTool?.(event.v);
      if (event.t === "done" && event.mode) mode = event.mode;
      if (event.t === "error") throw new Error(event.v ?? "Something went wrong.");
    }
  }
}
