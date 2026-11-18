"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FLAGS, FLAG_IDS, type Flag } from "@/features/settings/flags";
import { adminPost } from "../adminFetch";

/** Feature switches and maintenance mode. Each change is saved (and audited) on its own. */
export function SettingsForm({ flags, maintenance }: { flags: Record<Flag, boolean>; maintenance: { on: boolean; message: string } }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [message, setMessage] = useState(maintenance.message);

  const send = async (body: unknown, done: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminPost("/api/admin/settings", body);
      setNotice(done);
      startTransition(() => router.refresh());
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const disabled = busy || pending;

  return (
    <div className="mt-6 grid gap-6">
      <p aria-live="polite" className={notice ? "text-sm" : "sr-only"}>
        {notice}
      </p>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      <section aria-labelledby="flags-title" className="card grid gap-3 p-5">
        <h2 id="flags-title" className="text-xl">
          Features
        </h2>
        <p className="text-sm text-ink-2">Turning a feature off shows visitors a short, friendly note instead. Changes reach every server within about 30 seconds.</p>
        <ul className="grid gap-2">
          {FLAG_IDS.map((flag) => (
            <li key={flag}>
              <label className="flex min-h-11 items-center gap-3">
                <input
                  type="checkbox"
                  className="size-5"
                  checked={flags[flag]}
                  disabled={disabled}
                  onChange={(event) => void send({ action: "flags", flags: { [flag]: event.target.checked } }, `${FLAGS[flag].label}: ${event.target.checked ? "on" : "off"}.`)}
                />
                <span>{FLAGS[flag].label}</span>
                {!flags[flag] && <span className="text-xs font-semibold text-danger">Off</span>}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="maintenance-title" className="card grid gap-3 p-5">
        <h2 id="maintenance-title" className="text-xl">
          Maintenance mode
        </h2>
        <p className="text-sm text-ink-2">
          {maintenance.on ? "On: visitors see the message below. Admins can still sign in, use the admin area and see the site." : "Off. When on, visitors see a friendly page; admins can still sign in and use the admin area."} Needs a fresh authenticator code.
        </p>
        <div className="grid gap-1.5">
          <label htmlFor="maintenance-message" className="text-sm font-semibold">
            Message for visitors
          </label>
          <textarea id="maintenance-message" className="input min-h-20 py-2" maxLength={300} value={message} onChange={(event) => setMessage(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {maintenance.on ? (
            <>
              <button type="button" className="btn btn-primary" disabled={disabled} onClick={() => void send({ action: "maintenance", on: false }, "Maintenance mode is off. The site is open again.")}>
                Turn maintenance off
              </button>
              <button type="button" className="btn btn-outline" disabled={disabled} onClick={() => void send({ action: "maintenance", on: true, message }, "Message updated.")}>
                Update the message
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              disabled={disabled}
              onClick={() => {
                if (window.confirm("Turn on maintenance mode? Visitors will see the maintenance page until you turn it off.")) void send({ action: "maintenance", on: true, message }, "Maintenance mode is on.");
              }}
            >
              Turn maintenance on
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
