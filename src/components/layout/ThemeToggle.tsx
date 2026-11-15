"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasPreferenceConsent } from "@/lib/consent";

type ThemeChoice = "system" | "light" | "dark";
const KEY = "ti-theme";
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

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Laptop },
];

export function ThemeToggle({ className }: { className?: string }) {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "system" as ThemeChoice);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readChoice() === "system") apply("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !root.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  const Icon = OPTIONS.find((option) => option.value === choice)!.Icon;

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className={cn("icon-btn", className)}
        aria-label={`Theme: ${choice}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Icon className="size-5" aria-hidden />
      </button>
      {open && (
        <div role="menu" aria-label="Theme" className="glass-panel anim-menu absolute right-0 top-full z-50 mt-2 w-40 p-1">
          {OPTIONS.map(({ value, label, Icon: OptionIcon }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={choice === value}
              onClick={() => {
                setThemeChoice(value);
                setOpen(false);
              }}
              className="flex min-h-11 w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-left text-ink hover:bg-surface-2 aria-checked:font-semibold aria-checked:text-brand"
            >
              <OptionIcon className="size-4" aria-hidden />
              {label}
              {choice === value && <Check className="ml-auto size-4" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
