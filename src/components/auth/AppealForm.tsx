"use client";

import { useState } from "react";
import { postJson } from "./AuthProvider";

export function AppealForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (done)
    return (
      <p role="status" className="card mt-6 p-5">
        {done}
      </p>
    );

  return (
    <form
      className="card mt-6 grid gap-4 p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
          setDone(((await postJson("/api/appeal", { email, message })) as { message: string }).message);
        } catch (problem) {
          setError((problem as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid gap-1.5">
        <label htmlFor="appeal-email" className="font-semibold">
          The email address of the account
        </label>
        <input id="appeal-email" type="email" required autoComplete="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="appeal-message" className="font-semibold">
          Why should the restriction be lifted?
        </label>
        <textarea id="appeal-message" required minLength={20} maxLength={2000} rows={6} className="input" value={message} onChange={(event) => setMessage(event.target.value)} />
        <p className="text-sm text-ink-2">At least 20 characters. Don&apos;t include passwords or other private details.</p>
      </div>
      <button className="btn btn-primary justify-self-start" disabled={busy}>
        Send appeal
      </button>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </form>
  );
}
