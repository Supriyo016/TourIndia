"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Cookie } from "lucide-react";
import { OPEN_COOKIE_SETTINGS, parseConsent, readConsentValue, saveConsent, subscribeToConsent } from "@/lib/consent";

/** Asks once, offers refusal as easily as acceptance, and can be reopened from the footer. */
export function CookieConsent() {
  const raw = useSyncExternalStore(subscribeToConsent, () => readConsentValue() ?? "", () => "server");
  const consent = parseConsent(raw);
  const [manage, setManage] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const open = () => {
      setPreferences(parseConsent(readConsentValue())?.preferences ?? false);
      setManage(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, open);
  }, []);

  if (raw === "server" || (consent && !manage)) return null;

  const choose = async (value: boolean) => {
    setSaving(true);
    await saveConsent(value);
    setSaving(false);
    setManage(false);
  };

  return (
    <section aria-label="Cookie choices" className="no-print anim-pop fixed inset-x-3 bottom-3 z-50 rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-lg sm:right-auto sm:left-4 sm:max-w-md">
      <h2 className="flex items-center gap-2 text-lg"><Cookie className="size-5 text-accent-ink" aria-hidden /> Cookies and storage</h2>
      <p className="mt-1 text-[0.93rem] text-ink-2">
        We use no advertising or tracking cookies. Essential ones keep the site secure. Optional ones remember your theme, recently viewed guides and Yatri chat.{" "}
        <Link prefetch={false} href="/cookies" className="link-text">Details</Link>
      </p>

      {manage && (
        <div className="mt-3 space-y-2 text-[0.93rem]">
          <label className="flex items-start gap-2 text-muted">
            <input type="checkbox" checked disabled className="mt-1 size-4" />
            <span><span className="font-semibold text-ink">Essential</span>: security and this choice. Always on.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <input type="checkbox" className="mt-1 size-4 accent-[var(--brand)]" checked={preferences} onChange={(event) => setPreferences(event.target.checked)} />
            <span><span className="font-semibold">Preferences</span>: theme, recently viewed guides and chat history.</span>
          </label>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {manage ? (
          <button type="button" disabled={saving} className="btn btn-primary" onClick={() => choose(preferences)}>Save choices</button>
        ) : (
          <>
            <button type="button" disabled={saving} className="btn btn-primary" onClick={() => choose(true)}>Accept all</button>
            <button type="button" disabled={saving} className="btn btn-primary" onClick={() => choose(false)}>Essential only</button>
            <button type="button" disabled={saving} className="btn btn-outline" onClick={() => setManage(true)}>Manage</button>
          </>
        )}
      </div>
    </section>
  );
}

export function CookieSettingsLink() {
  return (
    <button type="button" className="link-u inline-flex min-h-8 cursor-pointer items-center text-[0.97rem] hover:text-white" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))}>
      Cookie settings
    </button>
  );
}
