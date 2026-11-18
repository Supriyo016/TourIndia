"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson, useAuth } from "@/components/auth/AuthProvider";

/** Sign out here, and delete the account. */
export function AccountControls() {
  const { setUser, signOut } = useAuth();
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  return (
    <>
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
          Removes your profile, preferences, trips, saved places, collections and their share links, your travel passport, plan notes, loves, ratings, planning requests and sign-in sessions. Comments you published stay, credited to &ldquo;Former member&rdquo;, so conversations still make sense. This can&apos;t be undone.
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
    </>
  );
}
