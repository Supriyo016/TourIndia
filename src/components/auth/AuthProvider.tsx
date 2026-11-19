"use client";

import dynamic from "next/dynamic";
import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import type { PublicUser } from "@/lib/auth/session";

export type SessionUser = PublicUser;
interface Methods {
  email: boolean;
  google: boolean;
}

interface AuthState {
  user: SessionUser | null;
  methods: Methods;
  loading: boolean;
  /** Opens the sign-in dialog. `reason` is shown at the top, such as "Sign in to comment". */
  openSignIn: (reason?: string) => void;
  refresh: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

// The dialog's code only loads when someone opens it.
const SignInDialog = dynamic(() => import("./SignInDialog").then((module) => module.SignInDialog), { ssr: false });
// Keeps saved places on this device in step with the account; loaded after the page is up.
const SavedSync = dynamic(() => import("@/components/user/SavedSync").then((module) => module.SavedSync), { ssr: false });

/** POSTs JSON to our own API and returns the body, or throws with the server's message. */
export async function postJson<T = Record<string, unknown>>(url: string, body: unknown, method = "POST"): Promise<T> {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [methods, setMethods] = useState<Methods>({ email: false, google: false });
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ reason?: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const data = (await response.json()) as { user: SessionUser | null; methods: Methods };
      setUser(data.user);
      setMethods(data.methods);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reads the session once the page is idle, so it never delays first paint.
    const handle = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(handle);
  }, [refresh]);

  const signOut = useCallback(async () => {
    await postJson("/api/auth/logout", {}).catch(() => undefined);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, methods, loading, openSignIn: (reason) => setDialog({ reason }), refresh, setUser, signOut }),
    [user, methods, loading, refresh, signOut],
  );

  return (
    <AuthContext value={value}>
      {children}
      {!loading && <SavedSync />}
      {dialog && <SignInDialog reason={dialog.reason} onClose={() => setDialog(null)} />}
    </AuthContext>
  );
}

export function useAuth(): AuthState {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth needs AuthProvider");
  return value;
}
