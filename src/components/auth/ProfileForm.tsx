"use client";

import { useState } from "react";
import { INTERESTS, LANGUAGES, TRAVEL_STYLES } from "@/features/auth/schemas";
import { STATE_NAMES } from "@/data/state-names";
import { postJson, useAuth, type SessionUser } from "./AuthProvider";

/** The profile: a display name and optional preferences that tailor suggestions. Shared by the dialog and /account. */
export function ProfileForm({ onSaved, submitLabel = "Save profile" }: { onSaved?: (user: SessionUser) => void; submitLabel?: string }) {
  const { user, setUser } = useAuth();
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const { user: next } = await postJson<{ user: SessionUser }>("/api/account", {
        name: String(form.get("name") ?? ""),
        country: String(form.get("country") ?? ""),
        homeState: String(form.get("homeState") ?? ""),
        interests,
        travelStyle: form.get("travelStyle") || undefined,
        language: form.get("language") || undefined,
        marketingConsent: form.get("marketingConsent") === "on",
      });
      setUser(next);
      setSaved(true);
      onSaved?.(next);
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field">
          <span className="field-label">Name shown on your comments</span>
          <input name="name" required minLength={2} maxLength={60} autoComplete="name" defaultValue={user?.name} className="input" />
        </label>
        <label className="field">
          <span className="field-label">Country</span>
          <input name="country" required maxLength={56} autoComplete="country-name" defaultValue={user?.country ?? "India"} className="input" />
        </label>
        <label className="field">
          <span className="field-label">
            Home state <span className="font-normal text-muted">(optional)</span>
          </span>
          <select name="homeState" defaultValue={user?.homeState ?? ""} className="input">
            <option value="">Prefer not to say</option>
            {STATE_NAMES.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">
            How you usually travel <span className="font-normal text-muted">(optional)</span>
          </span>
          <select name="travelStyle" defaultValue={user?.travelStyle ?? ""} className="input">
            <option value="">Not set</option>
            {TRAVEL_STYLES.map((style) => (
              <option key={style}>{style}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">
            Preferred language <span className="font-normal text-muted">(optional)</span>
          </span>
          <select name="language" defaultValue={user?.language ?? ""} className="input">
            <option value="">Not set</option>
            {LANGUAGES.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </label>
      </div>
      <fieldset>
        <legend className="field-label">
          Interests <span className="font-normal text-muted">(optional, for suggestions)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const on = interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                className="chip"
                aria-pressed={on}
                onClick={() => setInterests(on ? interests.filter((item) => item !== interest) : [...interests, interest])}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" name="marketingConsent" defaultChecked={user?.marketingConsent} className="mt-1 size-4 accent-[var(--brand)]" />
        <span>Email me occasional travel ideas. You can turn this off at any time.</span>
      </label>
      <p role="alert" aria-live="polite" className="field-error min-h-5">
        {error}
      </p>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-accent" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
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
