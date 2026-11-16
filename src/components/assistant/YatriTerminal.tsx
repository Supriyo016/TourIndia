"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { completeCommand, runCommand, type TerminalData, type TerminalEffect, type TerminalLine } from "@/features/assistant/terminal";
import { todayInIndia } from "@/features/calendar/calendar";
import { isNoteList, STORAGE_KEYS, useStoredValue, type PlanNote } from "@/hooks/use-stored-value";
import { setThemeChoice } from "@/components/layout/ThemeToggle";
import { askYatri } from "./ask";

const PROMPT = "yatri@tourindia:~$";
const EMPTY_DATA: TerminalData = { destinations: [], festivals: [], holidays: [] };
const NO_NOTES: PlanNote[] = [];
const WELCOME: TerminalLine[] = [
  { text: "Yatri terminal. Type help to see what I can do.", tone: "accent" },
  { text: "Tab completes, and the up and down keys recall earlier commands.", tone: "muted" },
];

let dataPromise: Promise<TerminalData> | null = null;

function loadData() {
  dataPromise ??= fetch("/assistant-data.json")
    .then((response) => {
      if (!response.ok) throw new Error("unavailable");
      return response.json() as Promise<TerminalData>;
    })
    .catch((error) => {
      dataPromise = null;
      throw error;
    });
  return dataPromise;
}

const toneClass = { muted: "text-[#8fb0a8]", error: "text-[#ff9d94]", accent: "text-[#f6c26b]" } as const;

export function YatriTerminal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<TerminalData | null>(null);
  const [notes, setNotes] = useStoredValue<PlanNote[]>(STORAGE_KEYS.notes, NO_NOTES, isNoteList);
  const screen = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData().then(setData, () => setLines((current) => [...current, { text: "The guide index couldn't load. Check your connection.", tone: "error" }]));
    field.current?.focus();
  }, []);

  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [lines, busy]);

  const print = (next: TerminalLine[]) => setLines((current) => [...current, ...next].slice(-400));

  const perform = async (effect: TerminalEffect, commandHistory: string[]) => {
    switch (effect.type) {
      case "clear":
        setLines([]);
        return;
      case "exit":
        onClose();
        return;
      case "open":
        router.push(effect.href);
        return;
      case "theme":
        setThemeChoice(effect.value);
        return;
      case "history":
        print(commandHistory.map((command, index) => ({ text: `${String(index + 1).padStart(3)}  ${command}`, tone: "muted" as const })));
        return;
      case "note":
        setNotes((current) => [{ id: `${Date.now()}`, title: effect.text.slice(0, 60), body: effect.text, date: null, updatedAt: new Date().toISOString() }, ...current]);
        return;
      case "notes":
        print(notes.length ? notes.slice(0, 20).map((note) => ({ text: `- ${note.title}`, href: "/calendar#notes" })) : [{ text: "No notes yet. Try: note Book the Jaipur hotel", tone: "muted" }]);
        return;
      case "weather": {
        setBusy(true);
        try {
          const response = await fetch(`/api/weather?slug=${encodeURIComponent(effect.slug)}`);
          if (!response.ok) throw new Error("unavailable");
          const { days } = (await response.json()) as { days: { date: string; max: number; min: number; rain: number | null }[] };
          print(days.map((day) => ({ text: `${day.date}  ${Math.round(day.max)}° / ${Math.round(day.min)}°  rain ${day.rain ?? "?"}%` })));
        } catch {
          print([{ text: "The forecast is unavailable right now.", tone: "error" }]);
        } finally {
          setBusy(false);
        }
        return;
      }
      case "ask": {
        setBusy(true);
        let reply = "";
        try {
          const mode = await askYatri([{ role: "user", content: effect.question }], {
            onText: (text) => {
              reply += text;
            },
          });
          const plain = reply.replace(/\*\*/g, "");
          print(plain.split("\n").filter(Boolean).flatMap(renderReplyLine));
          if (mode === "guide") print([{ text: "(answered from site guides)", tone: "muted" }]);
        } catch (error) {
          print([{ text: error instanceof Error ? error.message : "Something went wrong.", tone: "error" }]);
        } finally {
          setBusy(false);
        }
      }
    }
  };

  const submit = () => {
    const command = input.trim();
    setInput("");
    setCursor(-1);
    if (!command) return;
    print([{ text: `${PROMPT} ${command}`, tone: "muted" }]);
    const nextHistory = [...history, command].slice(-100);
    setHistory(nextHistory);
    if (!data) {
      print([{ text: "Still loading the guide index. Try again in a moment.", tone: "muted" }]);
      return;
    }
    const result = runCommand(command, data, todayInIndia());
    print(result.lines);
    if (result.effect) void perform(result.effect, nextHistory);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!busy) submit();
    } else if (event.key === "Tab" && input) {
      // With text typed, Tab completes; on an empty line it still moves focus as usual.
      event.preventDefault();
      setInput(completeCommand(input, data ?? EMPTY_DATA));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      if (history[next] !== undefined) {
        setCursor(next);
        setInput(history[next]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (cursor < 0) return;
      const next = cursor + 1;
      setCursor(next >= history.length ? -1 : next);
      setInput(next >= history.length ? "" : history[next]!);
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0b1418] font-mono text-[0.82rem] leading-relaxed text-[#d6f5e3]" onClick={() => window.getSelection()?.isCollapsed && field.current?.focus()}>
      <div ref={screen} role="log" aria-live="polite" aria-label="Terminal output" className="min-h-0 flex-1 overflow-y-auto p-3 whitespace-pre-wrap">
        {lines.map((line, index) => (
          <div key={index} className={line.tone ? toneClass[line.tone] : undefined}>
            {line.href ? <Link prefetch={false} href={line.href} onClick={onClose} className="underline underline-offset-2 hover:text-white">{line.text}</Link> : line.text || " "}
          </div>
        ))}
        {busy && <div className="text-[#8fb0a8]">working...</div>}
      </div>
      <div className="flex items-center gap-2 border-t border-white/15 px-3 py-2">
        <span aria-hidden className="shrink-0 text-[#f6c26b]">{PROMPT}</span>
        <input
          ref={field}
          aria-label="Terminal command"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={500}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-[#d6f5e3] caret-[#f6c26b] outline-none"
        />
      </div>
    </div>
  );
}

/** Turns "[label](/path)" in a reply into a clickable terminal line. */
function renderReplyLine(line: string): TerminalLine[] {
  const match = /\[([^\]]+)\]\((\/[^/\s)][^\s)]*|\/)\)/.exec(line);
  if (!match) return [{ text: line }];
  return [{ text: line.replace(match[0], match[1]!), href: match[2]! }];
}
