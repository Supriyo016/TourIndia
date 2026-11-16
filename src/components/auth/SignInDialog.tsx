"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mail, X } from "lucide-react";
import { postJson, useAuth, type SessionUser } from "./AuthProvider";
import { ProfileForm } from "./ProfileForm";

type Step = "email" | "code" | "profile";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3a7.2 7.2 0 0 1-10.8-3.8h-4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8z" />
    </svg>
  );
}

/**
 * Sign in or sign up in one flow: email, then a 6-digit code, then (first time only) a short profile.
 * Continue with Google is offered alongside when it's switched on.
 */
export function SignInDialog({ reason, onClose }: { reason?: string; onClose: () => void }) {
  const { methods, setUser } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  async function sendCode(event?: React.FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await postJson<{ message: string }>("/api/auth/otp/request", { email });
      setMessage(result.message);
      setStep("code");
      setCode("");
      setResendIn(60);
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(value = code) {
    if (!/^\d{6}$/.test(value)) return setError("Enter all 6 digits.");
    setBusy(true);
    setError("");
    try {
      const { user } = await postJson<{ user: SessionUser }>("/api/auth/otp/verify", { email, code: value });
      setUser(user);
      if (user.profileComplete) onClose();
      else setStep("profile");
    } catch (problem) {
      setError((problem as Error).message);
      setCode("");
    } finally {
      setBusy(false);
    }
  }

  const here = typeof window === "undefined" ? "/" : `${window.location.pathname}${window.location.search}`;
  const nothingEnabled = !methods.email && !methods.google;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="signin-title"
      onClose={onClose}
      onPointerDown={(event) => event.target === event.currentTarget && dialog.current?.close()}
      className="auth-dialog fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-transparent p-4 text-ink backdrop:bg-[rgb(4_14_20/0.6)] backdrop:backdrop-blur-sm"
    >
      <div aria-hidden className="auth-orbs">
        <span />
        <span />
        <span />
      </div>
      <div className="auth-card glass-panel relative mx-auto mt-[8vh] w-full max-w-md p-6 sm:p-8">
        <button type="button" className="icon-btn absolute top-3 right-3" aria-label="Close" onClick={() => dialog.current?.close()}>
          <X className="size-5" aria-hidden />
        </button>

        {step === "email" && (
          <>
            <h2 id="signin-title" className="text-2xl">Sign in or create an account</h2>
            <p className="mt-1.5 text-ink-2">{reason ?? "Save trips, rate places, and share what you know with other travellers."}</p>
            {nothingEnabled ? (
              <p className="mt-6 rounded-[var(--radius-md)] bg-surface-2 p-4 text-sm">Accounts aren&apos;t switched on yet. Please check back soon.</p>
            ) : (
              <>
                {methods.google && (
                  <a href={`/api/auth/google?next=${encodeURIComponent(here)}`} className="btn btn-outline mt-6 w-full justify-center gap-3 bg-surface">
                    <GoogleMark /> Continue with Google
                  </a>
                )}
                {methods.google && methods.email && (
                  <p className="my-5 flex items-center gap-3 text-sm text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">or</p>
                )}
                {methods.email && (
                  <form onSubmit={sendCode} className={methods.google ? "" : "mt-6"}>
                    <label className="field">
                      <span className="field-label">Email address</span>
                      <input
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="input"
                      />
                    </label>
                    <p role="alert" aria-live="polite" className="field-error mt-2 min-h-5">
                      {error}
                    </p>
                    <button type="submit" className="btn btn-accent mt-2 w-full justify-center" disabled={busy}>
                      <Mail className="size-4" aria-hidden /> {busy ? "Sending…" : "Email me a code"}
                    </button>
                  </form>
                )}
              </>
            )}
            <p className="mt-5 text-xs text-muted">
              By continuing you agree to the <a href="/terms" className="link-text">terms</a> and{" "}
              <a href="/privacy" className="link-text">privacy notice</a>. We use one essential cookie to keep you signed in.
            </p>
          </>
        )}

        {step === "code" && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void verify();
            }}
          >
            <button type="button" className="link-text mb-3 inline-flex items-center gap-1 text-sm" onClick={() => setStep("email")}>
              <ArrowLeft className="size-4" aria-hidden /> Use a different email
            </button>
            <h2 id="signin-title" className="text-2xl">Check your email</h2>
            <p className="mt-1.5 text-ink-2" role="status">
              {message} Sent to <strong className="break-all">{email}</strong>.
            </p>
            <label className="field mt-5">
              <span className="field-label">6-digit code</span>
              <input
                autoFocus
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(digits);
                  if (digits.length === 6) void verify(digits);
                }}
                className="otp-input input"
                aria-describedby="otp-help"
              />
              <span id="otp-help" className="field-hint">
                It expires in 10 minutes. You can paste it.
              </span>
            </label>
            <p role="alert" aria-live="polite" className="field-error mt-2 min-h-5">
              {error}
            </p>
            <button type="submit" className="btn btn-accent mt-2 w-full justify-center" disabled={busy}>
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button type="button" className="link-text mt-4 text-sm disabled:text-muted disabled:no-underline" disabled={resendIn > 0 || busy} onClick={() => void sendCode()}>
              {resendIn > 0 ? `Send a new code in ${resendIn}s` : "Send a new code"}
            </button>
          </form>
        )}

        {step === "profile" && (
          <>
            <h2 id="signin-title" className="text-2xl">Welcome to Tour India</h2>
            <p className="mt-1.5 mb-5 text-ink-2">Tell us what to call you. Everything else is optional and only used to suggest places.</p>
            <ProfileForm submitLabel="Finish" onSaved={() => onClose()} />
          </>
        )}
      </div>
    </dialog>
  );
}
