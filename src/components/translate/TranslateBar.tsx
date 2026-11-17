"use client";

import { Languages, LoaderCircle, Pause, Play, Square, Volume2 } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { batchTexts, collectUnits, PageText, unitText, type Unit } from "@/features/translate/dom";
import { ENGLISH, getLanguage, searchLanguages, type Language } from "@/features/translate/languages";
import { findVoice, loadVoices, speechChunks } from "@/features/translate/speech";
import styles from "./TranslateBar.module.css";

const STORAGE_KEY = "tour-india:translate-lang";
const MAX_REQUESTS = 8;
const MAX_CLIENT_CACHE = 3000;

/** Kept across client-side page changes, so going back to a page costs no request. */
const clientCache = new Map<string, string>();
const cacheId = (lang: string, text: string) => `${lang}\u0000${text}`;
function remember(lang: string, text: string, translation: string) {
  clientCache.set(cacheId(lang, text), translation);
  if (clientCache.size > MAX_CLIENT_CACHE) clientCache.delete(clientCache.keys().next().value!);
}

function readSaved(): Language | null {
  try {
    const code = window.sessionStorage.getItem(STORAGE_KEY);
    const language = code ? getLanguage(code) : undefined;
    return language && language.code !== ENGLISH.code ? language : null;
  } catch {
    return null;
  }
}

function save(code: string | null) {
  try {
    if (code) window.sessionStorage.setItem(STORAGE_KEY, code);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private windows may block storage; the choice just won't be remembered.
  }
}

const noSubscribe = () => () => {};
const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

type Speech = "idle" | "speaking" | "paused";

/**
 * Translates the readable text of a page region into an Indian language with AI,
 * and reads it aloud with the device's voices. Place it near the page title; it
 * works on the closest <article> (or <main>), or on the element with `targetId`.
 */
export function TranslateBar({ targetId, className = "" }: { targetId?: string; className?: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const page = useRef(new PageText());
  const run = useRef(0);
  const speakRun = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const activeRef = useRef<Language | null>(null);
  const menuId = useId();
  const searchId = useId();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Language | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ text: string; error?: boolean }>({ text: "" });
  const [speech, setSpeech] = useState<Speech>("idle");
  const canSpeak = useSyncExternalStore(noSubscribe, speechSupported, () => false);

  const options = useMemo(() => searchLanguages(query), [query]);

  const root = useCallback((): Element | null => {
    if (targetId) return document.getElementById(targetId);
    return barRef.current?.closest("article, main") ?? document.querySelector("main");
  }, [targetId]);

  const stopSpeaking = useCallback(() => {
    if (!speechSupported()) return;
    speakRun.current += 1;
    window.speechSynthesis.cancel();
    setSpeech("idle");
  }, []);

  const translateTo = useCallback(
    async (language: Language) => {
      const region = root();
      if (!region) return;
      const current = ++run.current;
      abort.current?.abort();
      stopSpeaking();
      page.current.restore();

      if (language.code === ENGLISH.code) {
        activeRef.current = null;
        setActive(null);
        setBusy(false);
        save(null);
        setStatus({ text: "Showing the original English." });
        return;
      }

      const units = collectUnits(region);
      const pending = new Set<Unit>(units);
      let failed = 0;
      const applyReady = () => {
        for (const unit of pending) {
          const parts = unit.parts.map((part) => clientCache.get(cacheId(language.code, part)));
          if (parts.some((part) => part === undefined)) continue;
          pending.delete(unit);
          if (!page.current.apply(unit, parts.join(" "), language.code, Boolean(language.rtl))) failed += 1;
        }
      };

      activeRef.current = language;
      setActive(language);
      save(language.code);
      applyReady();

      const needed = [...new Set(units.flatMap((unit) => unit.parts))].filter((text) => !clientCache.has(cacheId(language.code, text)));
      const batches = batchTexts(needed).slice(0, MAX_REQUESTS);
      let error = "";
      if (batches.length) {
        const controller = new AbortController();
        abort.current = controller;
        setBusy(true);
        setStatus({ text: `Translating into ${language.name}…` });
        for (const texts of batches) {
          try {
            const response = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lang: language.code, path: window.location.pathname, texts }),
              signal: controller.signal,
            });
            const data = (await response.json().catch(() => ({}))) as { translations?: unknown; error?: string };
            if (current !== run.current) return;
            if (!response.ok || !Array.isArray(data.translations) || data.translations.length !== texts.length) {
              error = data.error ?? "Translation isn't available right now. Please try again later.";
              break;
            }
            texts.forEach((text, index) => {
              const value = (data.translations as unknown[])[index];
              if (typeof value === "string") remember(language.code, text, value);
            });
            applyReady();
          } catch {
            if (current !== run.current) return;
            error = "Couldn't reach the translator. Check your connection and try again.";
            break;
          }
        }
      }
      if (current !== run.current) return;
      setBusy(false);
      const untranslated = pending.size + failed;
      if (error && untranslated === units.length) {
        page.current.restore();
        activeRef.current = null;
        setActive(null);
        save(null);
        setStatus({ text: error, error: true });
      } else if (error) {
        setStatus({ text: `Partly translated into ${language.name}. ${error}`, error: true });
      } else if (untranslated > 0) {
        setStatus({ text: `Translated into ${language.name}. A few parts are still in English.` });
      } else {
        setStatus({ text: `Translated into ${language.name}.` });
      }
    },
    [root, stopSpeaking],
  );

  // Carry the visitor's choice from page to page within this browser session.
  useEffect(() => {
    const saved = readSaved();
    if (!saved) return;
    const timer = window.setTimeout(() => void translateTo(saved), 0);
    return () => window.clearTimeout(timer);
  }, [translateTo]);

  useEffect(
    () => () => {
      abort.current?.abort();
      if (speechSupported()) window.speechSynthesis.cancel();
    },
    [],
  );

  // Close the menu on a click outside it.
  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const choose = (language: Language) => {
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
    void translateTo(language);
  };

  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = [...(event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-option]") ?? [])];
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowDown" ? Math.min(items.length - 1, index + 1) : index <= 0 ? -1 : index - 1;
    if (next === -1) searchRef.current?.focus();
    else items[next]?.focus();
  };

  const speak = async () => {
    const region = root();
    if (!region || !speechSupported()) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const current = ++speakRun.current;
    const language = activeRef.current ?? ENGLISH;
    const voice = findVoice(await loadVoices(synth), language.code);
    if (current !== speakRun.current) return;
    if (!voice) {
      setStatus({
        text: `Your device has no voice for ${language.name}, so this page can't be read aloud in ${language.name}. You may be able to add one in your device's language or speech settings.`,
        error: true,
      });
      return;
    }
    const chunks = speechChunks(collectUnits(region).map(unitText));
    if (!chunks.length) return;
    chunks.forEach((text, index) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      if (index === chunks.length - 1) {
        utterance.onend = () => {
          if (current === speakRun.current) setSpeech("idle");
        };
      }
      utterance.onerror = (event) => {
        if (current !== speakRun.current || event.error === "interrupted" || event.error === "canceled") return;
        speakRun.current += 1;
        synth.cancel();
        setSpeech("idle");
        setStatus({ text: "Reading aloud stopped because your device's voice ran into a problem.", error: true });
      };
      synth.speak(utterance);
    });
    setSpeech("speaking");
    setStatus({ text: `Reading aloud in ${language.name}.` });
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setSpeech("paused");
  };
  const resume = () => {
    window.speechSynthesis.resume();
    setSpeech("speaking");
  };

  return (
    <div ref={barRef} className={`${styles.bar} no-print ${className}`} data-translate-skip translate="no">
      <button
        ref={triggerRef}
        type="button"
        className="btn btn-outline"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={active ? `Translate this page. Now showing ${active.name}` : "Translate this page"}
        onClick={() => setOpen((value) => !value)}
      >
        {busy ? <LoaderCircle className={`size-4 ${styles.spin}`} aria-hidden /> : <Languages className="size-4" aria-hidden />}
        {active ? <span lang={active.code}>{active.native}</span> : "Translate"}
      </button>

      {active && (
        <span className={styles.note}>
          Translated by AI ·
          <button type="button" className={styles.linkButton} onClick={() => void translateTo(ENGLISH)}>
            Show original
          </button>
        </span>
      )}

      {canSpeak &&
        (speech === "idle" ? (
          <button type="button" className="btn btn-outline" onClick={() => void speak()}>
            <Volume2 className="size-4" aria-hidden /> Listen
          </button>
        ) : (
          <>
            {speech === "speaking" ? (
              <button type="button" className="btn btn-outline" onClick={pause}>
                <Pause className="size-4" aria-hidden /> Pause
              </button>
            ) : (
              <button type="button" className="btn btn-outline" onClick={resume}>
                <Play className="size-4" aria-hidden /> Resume
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={stopSpeaking}>
              <Square className="size-4" aria-hidden /> Stop
            </button>
          </>
        ))}

      {open && (
        <div id={menuId} role="dialog" aria-label="Choose a language" className={styles.menu} onKeyDown={onMenuKey}>
          <label htmlFor={searchId} className="sr-only">
            Search languages
          </label>
          <input
            ref={searchRef}
            id={searchId}
            type="search"
            className={styles.search}
            placeholder="Search languages"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && options[0]) {
                event.preventDefault();
                choose(options[0]);
              }
            }}
          />
          <ul className={styles.list} aria-label="Languages">
            {options.map((language) => (
              <li key={language.code}>
                <button type="button" data-option className={styles.option} aria-current={(active ?? ENGLISH).code === language.code} onClick={() => choose(language)}>
                  <span className={styles.native} lang={language.code} dir={language.rtl ? "rtl" : undefined}>
                    {language.native}
                  </span>
                  {language.code !== ENGLISH.code ? <span className={styles.english}>{language.name}</span> : <span className={styles.english}>Original</span>}
                </button>
              </li>
            ))}
            {!options.length && <li className={styles.empty}>No language matches “{query}”.</li>}
          </ul>
        </div>
      )}

      <p role="status" aria-live="polite" className={`${styles.status} ${status.error ? styles.error : ""}`}>
        {status.text}
      </p>
    </div>
  );
}
