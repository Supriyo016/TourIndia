import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAssistantConnected, runYatri } from "@/features/assistant/agent";
import { answerExtras } from "@/features/assistant/extras";
import { answerLocally } from "@/features/assistant/knowledge";
import { guardJsonPost } from "@/lib/api/form-handler";
import { isAllowed } from "@/lib/security/rate-limit";
import { createSessionValue, isSessionConfigured, readSession, sessionCookieHeader, verifySessionValue } from "@/lib/security/session";

export const maxDuration = 60;

const MAX_TOTAL_CHARS = 8000;

const schema = z
  .object({
    messages: z
      .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000) }).strict())
      .min(1)
      .max(16),
  })
  .strict()
  .refine(({ messages }) => messages[0]?.role === "user" && messages[messages.length - 1]?.role === "user", "Conversation must start and end with the visitor.")
  .refine(({ messages }) => messages.reduce((sum, message) => sum + message.content.length, 0) <= MAX_TOTAL_CHARS, "That conversation is too long.");

const dailyLimit = () => {
  const value = Number(process.env.ASSISTANT_DAILY_LIMIT ?? 500);
  return Number.isInteger(value) && value > 0 ? value : 500;
};

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(request: NextRequest) {
  const guarded = await guardJsonPost(request, "assistant", { max: 40, windowSeconds: 3600 });
  if (guarded instanceof NextResponse) return guarded;

  let body: unknown;
  try {
    body = JSON.parse(guarded.raw);
  } catch {
    return fail(400, "That message could not be read.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(422, parsed.error.issues[0]?.message ?? "That message wasn't valid.");
  const { messages } = parsed.data;

  // A signed anonymous session gives each browser its own, tighter allowance.
  const existing = readSession(request);
  const newCookie = !existing && isSessionConfigured() ? createSessionValue() : null;
  const sessionId = existing ?? (newCookie ? verifySessionValue(newCookie) : null);
  if (sessionId && !(await isAllowed("assistant-session", sessionId, { max: 25, windowSeconds: 3600 }))) {
    return fail(429, "You've sent a lot of messages. Please wait a while and try again.");
  }

  const connected = isAssistantConnected() && (await isAllowed("assistant-daily", "site", { max: dailyLimit(), windowSeconds: 86_400 }));
  const question = messages[messages.length - 1]!.content;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      const finish = (text: string, mode: "ai" | "guide", toolOutput = "") => {
        // The answer goes out in short pieces so it appears progressively, then the cards and suggestions.
        for (const piece of text.match(/[\s\S]{1,48}(\s|$)/g) ?? [text]) send({ t: "text", v: piece });
        send({ t: "extras", v: answerExtras(text, toolOutput) });
        send({ t: "done", mode });
      };

      try {
        if (!connected) {
          finish(answerLocally(question), "guide");
          return;
        }
        const reply = await runYatri({ messages, signal: request.signal, onTool: (name) => send({ t: "tool", v: name }) });
        finish(reply.text, "ai", reply.toolOutput);
      } catch (error) {
        console.error("[assistant] AI reply failed; answering from the guides:", error instanceof Error ? `${error.name}: ${error.message}` : "unknown error");
        if (!request.signal.aborted) finish(answerLocally(question), "guide");
      } finally {
        controller.close();
      }
    },
  });

  const headers = new Headers({ "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" });
  if (newCookie) headers.append("Set-Cookie", sessionCookieHeader(request, newCookie));
  return new Response(stream, { headers });
}
