"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/components/auth/AuthProvider";
import { SHOWABLE, type Privacy, type Showable, type Visibility } from "@/features/profile/schema";

const LEVELS: { value: Visibility; label: string; hint: string }[] = [
  { value: "private", label: "Private", hint: "Only you. Your page address shows nothing to anyone else." },
  { value: "members", label: "Members", hint: "People signed in to Tour India can see your page." },
  { value: "public", label: "Public", hint: "Anyone with the link. Search engines are asked not to list it." },
];

const FIELDS: Record<Showable, string> = {
  tagline: "Tagline",
  bio: "About you",
  city: "City",
  homeState: "Home state",
  website: "Website",
  interests: "Interests",
  activity: "How many comments you've posted",
  joined: "When you joined",
};

/** Who can see the public page, and which parts of it. */
export function PrivacyForm({ initial, hasUsername }: { initial: Privacy; hasUsername: boolean }) {
  const router = useRouter();
  const [privacy, setPrivacy] = useState<Privacy>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const update = (next: Partial<Privacy>) => {
    setSaved(false);
    setPrivacy((current) => ({ ...current, ...next }));
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await postJson("/api/profile", { action: "privacy", privacy });
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
      <fieldset>
        <legend className="field-label">Who can see your page</legend>
        <div className="mt-2 grid gap-2">
          {LEVELS.map((level) => (
            <label key={level.value} className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-line p-3 has-[:checked]:border-[var(--brand)] has-[:checked]:bg-surface-2">
              <input type="radio" name="visibility" value={level.value} checked={privacy.visibility === level.value} onChange={() => update({ visibility: level.value })} className="mt-1 size-4 accent-[var(--brand)]" />
              <span>
                <span className="font-semibold">{level.label}</span>
                <span className="block text-sm text-ink-2">{level.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {!hasUsername && privacy.visibility !== "private" && <p className="mt-2 text-sm text-danger">Choose a username on the Details page first, so your page has an address.</p>}
      </fieldset>

      <fieldset disabled={privacy.visibility === "private"} className="disabled:opacity-60">
        <legend className="field-label">Show on your page</legend>
        <p className="text-sm text-muted">Your name, username and avatar always show when the page is visible. Your email never does.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SHOWABLE.map((field) => (
            <label key={field} className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={privacy.show.includes(field)}
                onChange={(event) => update({ show: event.target.checked ? [...privacy.show, field] : privacy.show.filter((item) => item !== field) })}
                className="size-4 accent-[var(--brand)]"
              />
              {FIELDS[field]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-2.5">
        <input type="checkbox" checked={privacy.linkComments} onChange={(event) => update({ linkComments: event.target.checked })} className="mt-1 size-4 accent-[var(--brand)]" />
        <span>
          <span className="font-semibold">Link my comments to my page</span>
          <span className="block text-sm text-muted">Only while your page is public. Your avatar shows beside your comments too.</span>
        </span>
      </label>

      <p role="alert" aria-live="polite" className="field-error min-h-5">
        {error}
      </p>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-accent" disabled={saving}>
          {saving ? "Saving…" : "Save privacy choices"}
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
