"use client";

import { useEffect, useState } from "react";
import { Laptop, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import { postJson } from "./AuthProvider";

interface SessionSummary {
  id: string;
  device: string;
  country?: string;
  role: "user" | "admin";
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
}
interface SignInEvent {
  at: string;
  method: "email" | "google" | "admin";
  outcome: "ok" | "failed" | "denied";
  device?: string;
  country?: string;
}

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const region = (code?: string) => {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en-IN"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};
const METHOD = { email: "Email code", google: "Google", admin: "Admin code" } as const;

/** Where you're signed in, with a way to sign out other devices, and your recent sign-ins. */
export function AccountSessions() {
  const [data, setData] = useState<{ sessions: SessionSummary[]; history: SignInEvent[] } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/account/sessions", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) return;
        if (!response.ok) throw new Error();
        const body = (await response.json()) as { sessions: SessionSummary[]; history: SignInEvent[] };
        if (alive) setData(body);
      })
      .catch(() => alive && setError("Couldn't load your sessions. Refresh to try again."));
    return () => {
      alive = false;
    };
  }, [version]);

  const act = async (body: unknown) => {
    setBusy(true);
    setError("");
    try {
      await postJson("/api/account/sessions", body);
      setVersion((v) => v + 1);
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!data) return error ? <p role="alert" className="field-error mt-8">{error}</p> : null;
  const others = data.sessions.filter((s) => !s.current);

  return (
    <section aria-labelledby="sessions-title" className="mt-12">
      <h2 id="sessions-title" className="text-2xl">
        Signed-in devices
      </h2>
      <p className="mt-1 text-ink-2">If you see a device you don&apos;t recognise, sign it out.</p>
      <ul className="mt-4 grid gap-2">
        {data.sessions.map((session) => {
          const Icon = /Android|iOS/.test(session.device) ? Smartphone : Laptop;
          return (
            <li key={session.id} className="card flex flex-wrap items-center gap-3 p-4">
              <Icon className="size-5 shrink-0 text-accent-ink" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {session.device}
                  {session.current && <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold">This device</span>}
                  {session.role === "admin" && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold"><ShieldCheck className="size-3.5" aria-hidden /> Admin</span>}
                </p>
                <p className="text-sm text-ink-2">
                  {[region(session.country), `Signed in ${when(session.createdAt)}`, `Last active ${when(session.lastSeenAt)}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              {!session.current && (
                <button type="button" className="btn btn-outline !min-h-10 text-sm" disabled={busy} onClick={() => act({ action: "end", id: session.id })}>
                  <LogOut className="size-4" aria-hidden /> Sign out
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {others.length > 0 && (
        <button type="button" className="btn btn-outline mt-3" disabled={busy} onClick={() => act({ action: "end-others" })}>
          Sign out of all other devices ({others.length})
        </button>
      )}
      {error && <p role="alert" className="field-error mt-3">{error}</p>}

      <h3 className="mt-10 text-xl">Recent sign-ins</h3>
      {data.history.length === 0 ? (
        <p className="mt-2 text-ink-2">No sign-ins recorded yet. Sign-ins are recorded from 17 November 2026.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-ink-2">
              <tr>
                <th scope="col" className="py-2 pr-4 font-semibold">When</th>
                <th scope="col" className="py-2 pr-4 font-semibold">How</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Device</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Where</th>
                <th scope="col" className="py-2 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((event, index) => (
                <tr key={`${event.at}-${index}`} className="border-t border-line">
                  <td className="py-2 pr-4 whitespace-nowrap">{when(event.at)}</td>
                  <td className="py-2 pr-4">{METHOD[event.method]}</td>
                  <td className="py-2 pr-4">{event.device ?? "–"}</td>
                  <td className="py-2 pr-4">{region(event.country) || "–"}</td>
                  <td className={event.outcome === "ok" ? "py-2" : "py-2 font-semibold text-danger"}>{event.outcome === "ok" ? "Signed in" : "Wrong or expired code"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
