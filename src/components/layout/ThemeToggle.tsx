"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Laptop, Moon, Sun } from "lucide-react";

type ThemeChoice = "system" | "light" | "dark";
const KEY = "ti-theme";
const ORDER: ThemeChoice[] = ["system", "light", "dark"];
const listeners = new Set<() => void>();

function readChoice(): ThemeChoice {
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
      onClick={() => {
        try {
          window.localStorage.setItem(KEY, next);
        } catch {
          // The choice still applies for this page view.
        }
        const root = document.documentElement;
        root.classList.add("theme-transition");
        apply(next);
        window.setTimeout(() => root.classList.remove("theme-transition"), 300);
        listeners.forEach((listener) => listener());
      }}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
