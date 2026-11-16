"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasPreferenceConsent } from "@/lib/consent";

type ThemeChoice = "system" | "light" | "dark";
const KEY = "ti-theme";
const listeners = new Set<() => void>();

// The choice applies either way; it is only remembered with consent.
let sessionChoice: ThemeChoice | null = null;

function readChoice(): ThemeChoice {
  if (sessionChoice) return sessionChoice;
  try {
    const stored = window.localStorage.getItem(KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function apply(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Also used by the Yatri terminal's theme command. */
export function setThemeChoice(next: ThemeChoice) {
  sessionChoice = next;
  try {
    if (hasPreferenceConsent()) window.localStorage.setItem(KEY, next);
  } catch {
    // The choice still applies for this page view.
  }
  apply(next);
  listeners.forEach((listener) => listener());
}

const ORDER: ThemeChoice[] = ["light", "dark", "system"];
const LABEL: Record<ThemeChoice, string> = { light: "Light", dark: "Dark", system: "System" };
const ICON = { light: Sun, dark: Moon, system: Laptop };

/** One click moves to the next theme: Light, Dark, then System. */
export function ThemeToggle({ className }: { className?: string }) {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "system" as ThemeChoice);
  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length]!;
  const Icon = ICON[choice];

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readChoice() === "system") apply("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <button
      type="button"
      className={cn("icon-btn", className)}
      aria-label={`Theme: ${LABEL[choice]}. Switch to ${LABEL[next]}`}
      title={`Theme: ${LABEL[choice]} (click for ${LABEL[next]})`}
      onClick={() => setThemeChoice(next)}
    >
      <Icon key={choice} className="anim-pop size-5" aria-hidden />
    </button>
  );
}
