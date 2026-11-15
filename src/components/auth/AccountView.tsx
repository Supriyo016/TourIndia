"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { postJson, useAuth } from "./AuthProvider";
import { ProfileForm } from "./ProfileForm";

const safeNext = (value: string | null) => (value && value.startsWith("/") && !value.startsWith("//") ? value : null);

export function AccountView() {
  const { user, loading, openSignIn, setUser, signOut } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const welcome = params.get("welcome") === "1";
  const next = safeNext(params.get("next"));

  if (loading) return <p className="mt-6 text-muted">Loading…</p>;
  if (!user) {
    return (
      <div className="mt-6">
        <p className="text-ink-2">Sign in to manage your profile, saved trips and comments.</p>
        <button type="button" className="btn btn-accent mt-4" onClick={() => openSignIn()}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-10">
      <section aria-labelledby="profile-title" className="card p-6">
        <h2 id="profile-title" className="text-xl">{welcome ? "Welcome! Finish your profile" : "Profile"}</h2>
        <p className="mt-1 mb-5 text-sm text-muted">
          Signed in as <strong className="text-ink">{user.email}</strong>
          {user.google ? " with Google" : ""}. Only your name is shown publicly, on your comments.
        </p>
        <ProfileForm onSaved={() => next && router.push(next)} submitLabel={welcome ? "Save and continue" : "Save profile"} />
      </section>

      <section aria-labelledby="session-title" className="card p-6">
        <h2 id="session-title" className="text-xl">Sign out</h2>
        <p className="mt-1 text-sm text-ink-2">Ends this session on this device.</p>
        <button
          type="button"
          className="btn btn-outline mt-4"
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
        >
          Sign out
        </button>
      </section>

      <section aria-labelledby="delete-title" className="card border-danger/40 p-6">
        <h2 id="delete-title" className="text-xl">Delete your account</h2>
        <p className="mt-1 text-sm text-ink-2">
          Removes your profile, loves, ratings and sign-in sessions. Comments you published stay, credited to &ldquo;Former member&rdquo;, so conversations still make sense. This can&apos;t be undone.
        </p>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            try {
              await postJson("/api/account", { confirm }, "DELETE");
              setUser(null);
              router.push("/?account=deleted");
            } catch (problem) {
              setError((problem as Error).message);
            }
          }}
        >
          <label className="field">
            <span className="field-label">Type DELETE to confirm</span>
            <input value={confirm} onChange={(event) => setConfirm(event.target.value)} className="input w-48" autoComplete="off" />
          </label>
          <button type="submit" className="btn border border-danger text-danger" disabled={confirm !== "DELETE"}>
            Delete account
          </button>
        </form>
        <p role="alert" className="field-error mt-2 min-h-5">
          {error}
        </p>
      </section>
    </div>
  );
}
