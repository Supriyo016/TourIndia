"use client";

import { useEffect, useRef, useState } from "react";
import { Cpu, Loader2, Search, Send, Square, Trash2 } from "lucide-react";
import { isChatHistory, STORAGE_KEYS } from "@/hooks/use-stored-value";
import { hasPreferenceConsent } from "@/lib/consent";
import { askYatri, type AskMode, type ChatMessage } from "./ask";
import { answerOnDevice, googleSearchUrl, hasWebGpu, loadLocalModel, LOCAL_MODEL_SIZE } from "./local-model";
import { RichText } from "./RichText";

type LocalState = { state: "off" | "ready" | "error" } | { state: "loading"; progress: number };

const SUGGESTIONS = ["Where should I go in January?", "Plan 5 days in Kerala from Mumbai", "Do I need a permit for Tawang?", "When is Holi next year?"];
const MAX_HISTORY = 15;

const TOOL_LABELS: Record<string, string> = {
  search_site: "Searching the guides",
  get_destination: "Reading the guide",
  get_state: "Reading the state profile",
  find_destinations: "Finding places",
  get_festivals: "Checking festivals",
  get_holidays: "Checking the calendar",
  get_food: "Looking up food",
  plan_trip: "Building your itinerary",
  get_practical_info: "Checking practical details",
  get_today: "Checking today's date",
};

function loadHistory(): ChatMessage[] {
  if (!hasPreferenceConsent()) return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.yatri) ?? "[]");
    return isChatHistory(parsed) ? (parsed as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function YatriChat({ onNavigate }: { onNavigate: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<AskMode | null>(null);
  const [problem, setProblem] = useState("");
  const abort = useRef<AbortController | null>(null);
  const [local, setLocal] = useState<LocalState>({ state: "off" });
  const [canRunLocal, setCanRunLocal] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => setCanRunLocal(hasWebGpu()), 0);
    return () => window.clearTimeout(handle);
  }, []);

  const turnOnLocal = async () => {
    setLocal({ state: "loading", progress: 0 });
    try {
      await loadLocalModel((progress) => setLocal({ state: "loading", progress }));
      setLocal({ state: "ready" });
    } catch {
      setLocal({ state: "error" });
    }
  };

  const appendText = (chunk: string) =>
    setMessages((current) => {
      const last = current[current.length - 1]!;
      return [...current.slice(0, -1), { ...last, content: last.content + chunk }];
    });
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
    if (busy || !hasPreferenceConsent()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.yatri, JSON.stringify(messages.slice(-MAX_HISTORY)));
    } catch {
      // The conversation still works for this visit.
    }
  }, [messages, busy]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setProblem("");
    setBusy(true);
    setStatus("Thinking");
    const history: ChatMessage[] = [...messages.filter((message) => message.content), { role: "user" as const, content: question }].slice(-MAX_HISTORY);
    // The API needs a conversation that opens with the visitor.
    while (history[0]?.role === "assistant") history.shift();
    setMessages([...history, { role: "assistant", content: "" }]);
    const controller = new AbortController();
    abort.current = controller;
    try {
      if (local.state === "ready") {
        // The site's own answer becomes the context the on-device model rewrites.
        let context = "";
        const result = await askYatri(history, { signal: controller.signal, onTool: (name) => setStatus(TOOL_LABELS[name] ?? "Working"), onText: (chunk) => (context += chunk) });
        setMode(result);
        if (result === "ai") {
          appendText(context);
        } else {
          setStatus("Writing on your device");
          try {
            const model = await loadLocalModel(() => undefined);
            let first = true;
            await answerOnDevice(model, history, context, (chunk) => {
              if (first) setStatus("");
              first = false;
              appendText(chunk);
            }, controller.signal);
          } catch {
            appendText(context);
          }
        }
      } else {
        const result = await askYatri(history, {
          signal: controller.signal,
          onTool: (name) => setStatus(TOOL_LABELS[name] ?? "Working"),
          onText: (chunk) => {
            setStatus("");
            appendText(chunk);
          },
        });
        setMode(result);
      }
    } catch (error) {
      if (!controller.signal.aborted) setProblem(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
      setStatus("");
      setMessages((current) => current.filter((message) => message.content));
    }
  };

  const clear = () => {
    setMessages([]);
    setMode(null);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.yatri);
    } catch {
      // Nothing was stored.
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={log} role="log" aria-live="polite" aria-label="Conversation with Yatri" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <div>
            <p className="text-[0.97rem] text-ink-2">Namaste! I&apos;m Yatri. Ask me where to go, when to travel, or to plan a trip from Tour India&apos;s guides.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button type="button" className="chip text-left" onClick={() => send(suggestion)}>{suggestion}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {messages.map((message, index) =>
          message.content ? (
            <div key={index} className={message.role === "user" ? "ml-8 rounded-[var(--radius-md)] bg-brand p-2.5 text-[0.95rem] text-on-brand" : "mr-4 rounded-[var(--radius-md)] bg-surface-2 p-2.5 text-[0.95rem]"}>
              {message.role === "user" ? message.content : <RichText text={message.content} onNavigate={onNavigate} />}
            </div>
          ) : null,
        )}
        {status && (
          <p className="flex items-center gap-2 text-sm text-muted" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden /> {status}
          </p>
        )}
        {problem && <p role="alert" className="field-error">{problem}</p>}
        {!busy && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
          <a href={googleSearchUrl([...messages].reverse().find((message) => message.role === "user")?.content ?? "")} target="_blank" rel="noopener noreferrer" className="chip !min-h-9 text-sm">
            <Search className="size-3.5" aria-hidden /> Search Google for more
          </a>
        )}
      </div>

      <form
        className="border-t border-line p-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        <div className="flex items-end gap-1.5">
          <label htmlFor="yatri-input" className="sr-only">Message Yatri</label>
          <textarea
            id="yatri-input"
            rows={1}
            maxLength={2000}
            className="input max-h-28 resize-none"
            placeholder="Ask about travel in India"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(input);
              }
            }}
          />
          {busy ? (
            <button type="button" className="btn btn-outline !px-3" aria-label="Stop reply" onClick={() => abort.current?.abort()}><Square className="size-4" aria-hidden /></button>
          ) : (
            <button type="submit" className="btn btn-primary !px-3" aria-label="Send message" disabled={!input.trim()}><Send className="size-4" aria-hidden /></button>
          )}
        </div>
        {canRunLocal && mode !== "ai" && (
          <div className="mt-1.5 px-1 text-xs">
            {local.state === "off" && (
              <button type="button" className="inline-flex items-center gap-1 font-semibold text-brand underline" onClick={turnOnLocal}>
                <Cpu className="size-3.5" aria-hidden /> Use free on-device AI (one-time download, {LOCAL_MODEL_SIZE})
              </button>
            )}
            {local.state === "loading" && (
              <div role="status" aria-live="polite">
                Downloading the on-device model… {Math.round(local.progress * 100)}%
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <div className="h-full bg-brand transition-[width]" style={{ width: `${Math.round(local.progress * 100)}%` }} />
                </div>
              </div>
            )}
            {local.state === "ready" && <span className="font-semibold text-forest">On-device AI is on. Your questions are answered on this device.</span>}
            {local.state === "error" && <span className="text-danger">The on-device model couldn&apos;t start on this device. Yatri still answers from the guides.</span>}
          </div>
        )}
        <div className="mt-1 flex items-center justify-between gap-2 px-1 text-xs text-muted">
          <span>
            {mode === "guide" && local.state !== "ready" ? "Answering from site guides. " : ""}
            Yatri can make mistakes. Don&apos;t share personal details.
          </span>
          {messages.length > 0 && !busy && (
            <button type="button" className="inline-flex shrink-0 cursor-pointer items-center gap-1 underline" onClick={clear}><Trash2 className="size-3" aria-hidden /> Clear</button>
          )}
        </div>
      </form>
    </div>
  );
}
