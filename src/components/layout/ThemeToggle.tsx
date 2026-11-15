"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { hasPreferenceConsent } from "@/lib/consent";

type ThemeChoice = "system" | "light" | "dark";
const KEY = "ti-theme";
const ORDER: ThemeChoice[] = ["system", "light", "dark"];
const listeners = new Set<() => void>();

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

// The choice applies either way; it is only remembered with consent.
let sessionChoice: ThemeChoice | null = null;

/** Also used by the Yatri terminal's theme command. */
export function setThemeChoice(next: ThemeChoice) {
  sessionChoice = next;
  try {
    if (hasPreferenceConsent()) window.localStorage.setItem(KEY, next);
  } catch {
    // The choice still applies for this page view.
  }
  const root = document.documentElement;
  root.classList.add("theme-transition");
  apply(next);
  window.setTimeout(() => root.classList.remove("theme-transition"), 300);
  listeners.forEach((listener) => listener());
}

export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "system" as ThemeChoice);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readChoice() === "system") apply("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length]!;
  const Icon = choice === "dark" ? Moon : choice === "light" ? Sun : Laptop;

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={`Theme: ${choice}. Switch to ${next}.`}
      title={`Theme: ${choice}`}
      onClick={() => setThemeChoice(next)}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
