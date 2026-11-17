"use client";

import { useState } from "react";
import { postJson } from "@/components/auth/AuthProvider";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="card mt-6 grid gap-4 p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
          if (!sent) {
            const result = await postJson<{ message: string }>("/api/auth/otp/request", { email, purpose: "admin" });
            setMessage(result.message);
            setSent(true);
          } else {
            await postJson("/api/auth/otp/verify", { email, code, purpose: "admin" });
            // A full load, so the server renders the dashboard with the new cookie.
            window.location.assign("/admin/mfa");
          }
        } catch (problem) {
          setError((problem as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="field">
        <span className="field-label">Admin email</span>
        <input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} readOnly={sent} className="input" />
      </label>
      {sent && (
        <>
          <p role="status" className="text-sm text-ink-2">{message}</p>
          <label className="field">
            <span className="field-label">6-digit code</span>
            <input
              required
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="otp-input input"
            />
          </label>
        </>
      )}
      <p role="alert" aria-live="polite" className="field-error min-h-5">
        {error}
      </p>
      <button type="submit" className="btn btn-accent" disabled={busy}>
        {busy ? "Please wait…" : sent ? "Sign in as admin" : "Email me an admin code"}
      </button>
    </form>
  );
}
