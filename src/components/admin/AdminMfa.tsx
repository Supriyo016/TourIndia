"use client";

import { useEffect, useState } from "react";
import { adminPost } from "./adminFetch";

type Status = { state: "none" | "pending" | "enabled"; verified: boolean; recoveryLeft: number };

/** Groups a key as "ABCD EFGH …" so it's easier to type into an app. */
const grouped = (secret: string) => secret.match(/.{1,4}/g)?.join(" ") ?? secret;

function RecoveryCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const text = `Tour India admin recovery codes\nEach code works once. Keep them somewhere safe and private.\n\n${codes.join("\n")}\n`;
  return (
    <div className="card mt-6 p-6">
      <h2 className="text-xl">Save your recovery codes</h2>
      <p className="mt-1 text-sm text-ink-2">
        If you lose your phone, each of these codes lets you in once. They won&apos;t be shown again. Store them in a password manager or print them.
      </p>
      <ol className="mt-4 grid grid-cols-2 gap-2 font-mono text-[0.95rem]" aria-label="Recovery codes">
        {codes.map((code) => (
          <li key={code} className="rounded-[var(--radius-sm)] bg-surface-2 px-3 py-1.5">
            {code}
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-outline" onClick={() => void navigator.clipboard?.writeText(text)}>
          Copy
        </button>
        <a className="btn btn-outline" download="tour-india-recovery-codes.txt" href={`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`}>
          Download
        </a>
        <button type="button" className="btn btn-primary" onClick={onDone}>
          I&apos;ve saved them
        </button>
      </div>
    </div>
  );
}

export function AdminMfa() {
  const [status, setStatus] = useState<Status | null>(null);
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/mfa", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) return window.location.assign("/admin/login");
        const data = (await response.json()) as Status;
        if (alive) setStatus(data);
      })
      .catch(() => alive && setError("Couldn't load your security settings. Refresh to try again."));
    return () => {
      alive = false;
    };
  }, []);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (codes) return <RecoveryCodes codes={codes} onDone={() => window.location.assign("/admin")} />;
  if (!status) return error ? <p role="alert" className="field-error mt-6">{error}</p> : <p className="mt-6 text-ink-2" role="status">Loading…</p>;

  const codeField = (label: string, hint: string) => (
    <div className="grid gap-1.5">
      <label htmlFor="mfa-code" className="font-semibold">
        {label}
      </label>
      <input
        id="mfa-code"
        className="input max-w-56 font-mono text-lg tracking-widest"
        inputMode={status.state === "enabled" ? "text" : "numeric"}
        autoComplete="one-time-code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        maxLength={12}
        required
      />
      <p className="text-sm text-ink-2">{hint}</p>
    </div>
  );

  // Already checked in this session: manage recovery codes.
  if (status.state === "enabled" && status.verified) {
    return (
      <div className="card mt-6 grid gap-3 p-6">
        <p>
          Your authenticator is set up and this session is confirmed. <strong>{status.recoveryLeft}</strong> recovery {status.recoveryLeft === 1 ? "code" : "codes"} left.
        </p>
        <div className="flex flex-wrap gap-2">
          <a href="/admin" className="btn btn-primary">
            Go to admin
          </a>
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            onClick={() => run(async () => setCodes(((await adminPost("/api/admin/mfa", { action: "regenerate" })) as { recoveryCodes: string[] }).recoveryCodes))}
          >
            Make new recovery codes
          </button>
        </div>
        {error && <p role="alert" className="field-error">{error}</p>}
      </div>
    );
  }

  // Set up: returning admin enters a code.
  if (status.state === "enabled") {
    return (
      <form
        className="card mt-6 grid gap-4 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => {
            await adminPost("/api/admin/mfa", { action: "verify", code });
            window.location.assign("/admin");
          });
        }}
      >
        {codeField("Code from your authenticator app", "Or enter one of your recovery codes, like k7q2-9xmd.")}
        <button className="btn btn-primary justify-self-start" disabled={busy}>
          Continue
        </button>
        {error && <p role="alert" className="field-error">{error}</p>}
      </form>
    );
  }

  // First time: create a key, add it to the app, confirm with a code.
  return (
    <div className="card mt-6 grid gap-4 p-6">
      <h2 className="text-xl">Set up your authenticator</h2>
      {!setup ? (
        <>
          <p className="text-ink-2">This takes about a minute. You&apos;ll need your phone with an authenticator app installed.</p>
          <button
            type="button"
            className="btn btn-primary justify-self-start"
            disabled={busy}
            onClick={() => run(async () => setSetup((await adminPost("/api/admin/mfa", { action: "start" })) as { secret: string; uri: string }))}
          >
            Start set-up
          </button>
        </>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => setCodes(((await adminPost("/api/admin/mfa", { action: "enable", code })) as { recoveryCodes: string[] }).recoveryCodes));
          }}
        >
          <ol className="grid list-decimal gap-3 pl-5">
            <li>
              On your phone, tap{" "}
              <a href={setup.uri} className="link-text">
                Add to authenticator app
              </a>
              . On a computer, open your app, choose to enter a setup key, and type this key with the name &quot;Tour India&quot;:
              <code className="mt-2 block rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2 font-mono text-[1.05rem] tracking-wider select-all">{grouped(setup.secret)}</code>
            </li>
            <li>Enter the 6-digit code the app shows for Tour India.</li>
          </ol>
          {codeField("6-digit code", "Codes change every 30 seconds.")}
          <button className="btn btn-primary justify-self-start" disabled={busy}>
            Turn on
          </button>
        </form>
      )}
      {error && <p role="alert" className="field-error">{error}</p>}
    </div>
  );
}
