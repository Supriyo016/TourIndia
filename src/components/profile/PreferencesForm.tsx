"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/components/auth/AuthProvider";
import { ACCESS_NEEDS, BUDGETS, DIETS, REGIONS, SEASONS, TRANSPORT, TRIP_LENGTHS, type Preferences } from "@/features/profile/schema";

type ListKey = "regions" | "seasons" | "transport" | "dietary" | "accessibility";

function Chips<T extends string>({ legend, hint, options, value, onChange }: { legend: string; hint?: string; options: readonly T[]; value: T[]; onChange: (next: T[]) => void }) {
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const on = value.includes(option);
          return (
            <button key={option} type="button" className="chip" aria-pressed={on} onClick={() => onChange(on ? value.filter((item) => item !== option) : [...value, option])}>
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Travel preferences. All optional; with personalisation off, none of it is used. */
export function PreferencesForm({ initial }: { initial: Preferences }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Preferences>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const update = (next: Partial<Preferences>) => {
    setSaved(false);
    setPrefs((current) => ({ ...current, ...next }));
  };
  const list = <K extends ListKey>(key: K) => ({ value: prefs[key] as Preferences[K], onChange: (next: Preferences[K]) => update({ [key]: next } as Partial<Preferences>) });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await postJson("/api/profile", { action: "preferences", preferences: prefs });
      setSaved(true);
      router.refresh();
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6" noValidate>
      <label className="flex items-start gap-2.5">
        <input type="checkbox" checked={prefs.personalise} onChange={(event) => update({ personalise: event.target.checked })} className="mt-1 size-4 accent-[var(--brand)]" />
        <span>
          <span className="font-semibold">Use these to tailor suggestions</span>
          <span className="block text-sm text-muted">Turn off and nothing on this page is used, though it stays saved until you clear it.</span>
        </span>
      </label>
      <Chips legend="Parts of India you're drawn to" options={REGIONS} {...list("regions")} />
      <Chips legend="When you like to travel" options={SEASONS} {...list("seasons")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field">
          <span className="field-label">Usual trip length</span>
          <select value={prefs.tripLength ?? ""} onChange={(event) => update({ tripLength: (event.target.value || undefined) as Preferences["tripLength"] })} className="input">
            <option value="">Not set</option>
            {TRIP_LENGTHS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">
            Budget <span className="font-normal text-muted">(optional)</span>
          </span>
          <select value={prefs.budget ?? ""} onChange={(event) => update({ budget: (event.target.value || undefined) as Preferences["budget"] })} className="input">
            <option value="">Prefer not to say</option>
            {BUDGETS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <Chips legend="Ways you like to get around" options={TRANSPORT} {...list("transport")} />
      <Chips legend="Food" hint="Optional. Helps with food suggestions; never shown to anyone." options={DIETS} {...list("dietary")} />
      <Chips legend="Access needs" hint="Optional and private. Used only to point out step-free routes, rest stops and quieter options." options={ACCESS_NEEDS} {...list("accessibility")} />

      <p role="alert" aria-live="polite" className="field-error min-h-5">
        {error}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-accent" disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => update({ regions: [], seasons: [], transport: [], dietary: [], accessibility: [], tripLength: undefined, budget: undefined })}
        >
          Clear all
        </button>
        {saved && (
          <span role="status" className="text-sm font-semibold text-forest">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
