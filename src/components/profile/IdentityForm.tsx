"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { postJson } from "@/components/auth/AuthProvider";
import { AVATARS } from "@/features/profile/avatars";
import { COVERS } from "@/features/profile/covers";
import type { IdentityInput } from "@/features/profile/schema";
import { Avatar } from "./Avatar";

type Check = { state: "idle" | "checking" | "ok" | "taken"; message: string };

/** Username, avatar, cover and the short public "about" fields. */
export function IdentityForm({ initial, covers }: { initial: IdentityInput; covers: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [check, setCheck] = useState<Check>({ state: "idle", message: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof IdentityInput>(key: K, value: IdentityInput[K]) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  // Checks the username a moment after typing stops.
  const username = form.username.trim().toLowerCase();
  useEffect(() => {
    if (!username || username === initial.username) return;
    const timer = window.setTimeout(() => {
      setCheck({ state: "checking", message: "Checking…" });
      postJson<{ available: boolean; reason: string | null }>("/api/profile", { action: "check-username", username })
        .then((result) => setCheck(result.available ? { state: "ok", message: "Available" } : { state: "taken", message: result.reason ?? "Not available" }))
        .catch(() => setCheck({ state: "idle", message: "" }));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [username, initial.username]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await postJson("/api/profile", { action: "identity", identity: { ...form, username } });
      setSaved(true);
      router.refresh();
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const shownCheck = username && username !== initial.username ? check : { state: "idle", message: "" };

  return (
    <form onSubmit={submit} className="grid gap-6" noValidate>
      <label className="field">
        <span id="username-label" className="field-label">
          Username
        </span>
        <span className="flex items-center rounded-[var(--radius-md)] border border-line bg-surface focus-within:ring-2 focus-within:ring-[var(--brand)]">
          <span className="pl-3 text-muted" aria-hidden>
            @
          </span>
          <input
            name="username"
            required
            minLength={3}
            maxLength={20}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={form.username}
            onChange={(event) => set("username", event.target.value)}
            aria-labelledby="username-label"
            aria-describedby="username-help username-check"
            className="input border-0 !ring-0"
          />
        </span>
        <span id="username-help" className="text-sm text-muted">
          3 to 20 lower-case letters, numbers or underscores. It becomes your page address: /u/{username || "name"}
        </span>
        <span id="username-check" aria-live="polite" className={`min-h-5 text-sm font-semibold ${shownCheck.state === "taken" ? "text-danger" : "text-forest"}`}>
          {shownCheck.message}
        </span>
      </label>

      <fieldset>
        <legend className="field-label">Avatar</legend>
        <p className="text-sm text-muted">Illustrated travellers, drawn for this site. No photo uploads, so there&apos;s nothing of yours to store.</p>
        <div role="radiogroup" aria-label="Avatar" className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {AVATARS.map((avatar) => {
            const on = form.avatar === avatar.id;
            return (
              <button
                key={avatar.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={avatar.name}
                title={avatar.name}
                onClick={() => set("avatar", avatar.id)}
                className={`grid place-items-center rounded-full p-1 transition-shadow ${on ? "ring-3 ring-[var(--brand)]" : "ring-1 ring-line hover:ring-2"}`}
              >
                <Avatar id={avatar.id} size={64} className="size-full max-w-16" />
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Cover photo</legend>
        <div role="radiogroup" aria-label="Cover photo" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COVERS.map((cover) => {
            const on = form.cover === cover.key;
            return (
              <button
                key={cover.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set("cover", cover.key)}
                className={`overflow-hidden rounded-[var(--radius-md)] text-left text-sm ${on ? "ring-3 ring-[var(--brand)]" : "ring-1 ring-line hover:ring-2"}`}
              >
                <span className="relative block aspect-[3/1] bg-surface-2">
                  {covers[cover.key] && <Image src={covers[cover.key]!} alt="" fill sizes="12rem" className="object-cover" />}
                </span>
                <span className="block px-2 py-1.5">{cover.name}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field sm:col-span-2">
          <span className="field-label">
            Tagline <span className="font-normal text-muted">(optional)</span>
          </span>
          <input value={form.tagline} onChange={(event) => set("tagline", event.target.value)} maxLength={80} className="input" placeholder="Slow trains and mountain chai" />
        </label>
        <label className="field sm:col-span-2">
          <span className="field-label">
            About you <span className="font-normal text-muted">(optional)</span>
          </span>
          <textarea value={form.bio} onChange={(event) => set("bio", event.target.value)} maxLength={300} rows={4} className="input" />
          <span className="text-sm text-muted">{300 - form.bio.length} characters left. Please leave out phone numbers and addresses.</span>
        </label>
        <label className="field">
          <span className="field-label">
            City <span className="font-normal text-muted">(optional)</span>
          </span>
          <input value={form.city} onChange={(event) => set("city", event.target.value)} maxLength={60} autoComplete="address-level2" className="input" />
        </label>
        <label className="field">
          <span className="field-label">
            Website or blog <span className="font-normal text-muted">(optional)</span>
          </span>
          <input type="url" inputMode="url" value={form.website} onChange={(event) => set("website", event.target.value)} maxLength={120} className="input" placeholder="https://" />
        </label>
      </div>

      <p role="alert" aria-live="polite" className="field-error min-h-5">
        {error}
      </p>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-accent" disabled={saving || shownCheck.state === "taken"}>
          {saving ? "Saving…" : "Save details"}
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
