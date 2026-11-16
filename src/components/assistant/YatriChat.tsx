"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, CalendarDays, Check, Compass, MapPinned, Plus, RotateCcw, Search, Square, UtensilsCrossed, X } from "lucide-react";
import { isChatHistory, STORAGE_KEYS } from "@/hooks/use-stored-value";
import { hasPreferenceConsent } from "@/lib/consent";
import { cn } from "@/lib/utils";
import { askYatri, googleSearchUrl, type AnswerExtras, type AskMode, type ChatMessage, type PlaceCard } from "./ask";
import { RichText } from "./RichText";
import styles from "./yatri.module.css";
import { YatriOrb } from "./YatriOrb";

const MAX_HISTORY = 15;
const PICKS_KEY = "ti-yatri-picks";
const MAX_PICKS = 6;

const STARTERS = [
  { label: "Where to go this month", prompt: "Where is good to visit this month?", Icon: Compass },
  { label: "Plan a trip for me", prompt: "Plan 5 days in Kerala from Mumbai", Icon: MapPinned },
  { label: "Festivals coming up", prompt: "Which festivals are coming up in the next two months?", Icon: CalendarDays },
  { label: "What to eat where", prompt: "What should I eat in Rajasthan?", Icon: UtensilsCrossed },
] as const;

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

interface Turn extends ChatMessage {
  extras?: AnswerExtras;
}

const remember = (key: string, value: unknown) => {
  if (!hasPreferenceConsent()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Still works for this visit.
  }
};

function recall<T>(key: string, check: (value: unknown) => boolean, fallback: T): T {
  if (typeof window === "undefined" || !hasPreferenceConsent()) return fallback;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? "null");
    return check(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

const isPicks = (value: unknown) => Array.isArray(value) && value.every((item) => item && typeof item === "object" && typeof (item as PlaceCard).slug === "string" && typeof (item as PlaceCard).name === "string");

/** Yatri as a travel concierge: answers with place cards, sources, follow-ups and a trip tray. */
export function YatriChat({ onNavigate, onMode }: { onNavigate: () => void; onMode: (mode: AskMode) => void }) {
  const [turns, setTurns] = useState<Turn[]>(() => recall<ChatMessage[]>(STORAGE_KEYS.yatri, isChatHistory, []));
  const [picks, setPicks] = useState<PlaceCard[]>(() => recall<PlaceCard[]>(PICKS_KEY, isPicks, []));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [problem, setProblem] = useState("");
  const abort = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
    if (!busy) remember(STORAGE_KEYS.yatri, turns.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content })));
  }, [turns, busy]);

  useEffect(() => remember(PICKS_KEY, picks), [picks]);

  const update = (change: (last: Turn) => Turn) => setTurns((current) => [...current.slice(0, -1), change(current[current.length - 1]!)]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setProblem("");
    setBusy(true);
    setStatus("Thinking");
    const history: ChatMessage[] = [...turns.filter((turn) => turn.content).map(({ role, content }) => ({ role, content })), { role: "user" as const, content: question }].slice(-MAX_HISTORY);
    // The API needs a conversation that opens with the visitor.
    while (history[0]?.role === "assistant") history.shift();
    setTurns([...history, { role: "assistant", content: "" }]);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const mode = await askYatri(history, {
        signal: controller.signal,
        onTool: (name) => setStatus(TOOL_LABELS[name] ?? "Working"),
        onText: (chunk) => {
          setStatus("");
          update((last) => ({ ...last, content: last.content + chunk }));
        },
        onExtras: (extras) => update((last) => ({ ...last, extras })),
      });
      onMode(mode);
    } catch (error) {
      if (!controller.signal.aborted) setProblem(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
      setStatus("");
      setTurns((current) => current.filter((turn) => turn.content));
      field.current?.focus();
    }
  };

  const togglePick = (card: PlaceCard) =>
    setPicks((current) => (current.some((item) => item.slug === card.slug) ? current.filter((item) => item.slug !== card.slug) : [...current, card].slice(-MAX_PICKS)));

  const clear = () => {
    setTurns([]);
    setProblem("");
    try {
      window.localStorage.removeItem(STORAGE_KEYS.yatri);
    } catch {
      // Nothing was stored.
    }
  };

  const lastQuestion = [...turns].reverse().find((turn) => turn.role === "user")?.content ?? "";
  const plannerHref = `/planner?d=${picks.map((pick) => pick.slug).join(",")}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={log} role="log" aria-live="polite" aria-label="Conversation with Yatri" className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {turns.length === 0 ? (
          <div className={styles.welcome}>
            <YatriOrb large />
            <h2 className="mt-3 font-display text-2xl">Namaste! Where to next?</h2>
            <p className="mt-1 text-[0.95rem] text-ink-2">I can suggest places for your dates, build a day-by-day plan, and explain festivals, food and permits, all from Tour India&apos;s guides.</p>
            <ul className="mt-5 grid grid-cols-2 gap-2">
              {STARTERS.map(({ label, prompt, Icon }) => (
                <li key={label}>
                  <button type="button" onClick={() => send(prompt)} className={styles.starter}>
                    <Icon className="size-5 text-accent-ink" aria-hidden />
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="space-y-5">
            {turns.map((turn, index) => (
              <li key={index} className={turn.role === "user" ? "flex justify-end" : "flex gap-2.5"}>
                {turn.role === "user" ? (
                  <p className={styles.userBubble}>{turn.content}</p>
                ) : (
                  <>
                    <span className="mt-0.5 shrink-0" aria-hidden>
                      <YatriOrb />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.95rem] leading-relaxed">{turn.content ? <RichText text={turn.content} onNavigate={onNavigate} /> : null}</div>
                      {turn.extras && turn.extras.cards.length > 0 && (
                        <ul className={cn("rail mt-3 -mr-4 flex snap-x gap-2.5 overflow-x-auto pr-4 pb-1", styles.cards)} aria-label="Places in this answer">
                          {turn.extras.cards.map((card) => {
                            const picked = picks.some((item) => item.slug === card.slug);
                            return (
                              <li key={card.slug} className={styles.card}>
                                <div className="relative aspect-[16/10] bg-surface-2">
                                  {card.image && <Image src={card.image.src} alt="" fill sizes="13rem" className="object-cover" placeholder={card.image.blur ? "blur" : "empty"} blurDataURL={card.image.blur} />}
                                </div>
                                <div className="p-2.5">
                                  <p className="leading-tight font-semibold">{card.name}</p>
                                  <p className="text-xs text-muted">{card.state}</p>
                                  <p className="mt-1.5 text-xs text-ink-2">Best: {card.bestMonths} · {card.days}</p>
                                  <div className="mt-2 flex gap-1.5">
                                    <Link prefetch={false} href={`/destinations/${card.slug}`} onClick={onNavigate} className="chip !min-h-8 !px-2.5 text-xs">
                                      Guide
                                    </Link>
                                    <button type="button" aria-pressed={picked} onClick={() => togglePick(card)} className="chip !min-h-8 !px-2.5 text-xs">
                                      {picked ? <Check className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
                                      {picked ? "In trip" : "Add to trip"}
                                    </button>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {turn.extras && turn.extras.sources.length > 0 && (
                        <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                          <span>From:</span>
                          {turn.extras.sources.map((source) => (
                            <Link prefetch={false} key={source.href} href={source.href} onClick={onNavigate} className={styles.source}>
                              {source.label}
                            </Link>
                          ))}
                        </p>
                      )}
                      {index === turns.length - 1 && !busy && turn.extras && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {turn.extras.followUps.map((followUp) => (
                            <button key={followUp} type="button" onClick={() => send(followUp)} className={styles.followUp}>
                              {followUp}
                            </button>
                          ))}
                          <a href={googleSearchUrl(lastQuestion)} target="_blank" rel="noopener noreferrer" className={styles.followUp}>
                            <Search className="size-3.5" aria-hidden /> Search Google
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
        )}
        {status && (
          <p className="mt-4 flex items-center gap-2 pl-10 text-sm text-muted" role="status">
            <span className={styles.dots} aria-hidden>
              <span />
              <span />
              <span />
            </span>
            {status}
          </p>
        )}
        {problem && (
          <p role="alert" className="field-error mt-3">
            {problem}
          </p>
        )}
      </div>

      {picks.length > 0 && (
        <div className={styles.tray}>
          <p className="shrink-0 text-xs font-semibold">Your trip</p>
          <ul className="rail flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
            {picks.map((pick) => (
              <li key={pick.slug}>
                <button type="button" onClick={() => togglePick(pick)} className="chip !min-h-8 !px-2.5 text-xs" aria-label={`Remove ${pick.name} from your trip`}>
                  {pick.name} <X className="size-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <Link prefetch={false} href={plannerHref} onClick={onNavigate} className="btn btn-accent !min-h-9 shrink-0 !px-3 text-sm">
            Plan it
          </Link>
        </div>
      )}

      <form
        className="border-t border-line p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        <div className={styles.composer}>
          <label htmlFor="yatri-message" className="sr-only">
            Message Yatri
          </label>
          <textarea
            id="yatri-message"
            ref={field}
            rows={1}
            value={input}
            maxLength={2000}
            placeholder="Ask about places, dates or a trip…"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(input);
              }
            }}
            className="max-h-32 min-h-11 w-full resize-none bg-transparent px-3 py-2.5 text-[0.95rem] outline-none [field-sizing:content]"
          />
          {busy ? (
            <button type="button" className={styles.sendButton} aria-label="Stop the answer" onClick={() => abort.current?.abort()}>
              <Square className="size-4" aria-hidden />
            </button>
          ) : (
            <button type="submit" className={styles.sendButton} aria-label="Send message" disabled={!input.trim()}>
              <ArrowUp className="size-5" aria-hidden />
            </button>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-[0.72rem] text-muted">
          <span>Answers use Tour India&apos;s guides and may be AI-written. Check important details.</span>
          {turns.length > 0 && (
            <button type="button" onClick={clear} className="inline-flex shrink-0 items-center gap-1 hover:text-ink">
              <RotateCcw className="size-3" aria-hidden /> New chat
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
