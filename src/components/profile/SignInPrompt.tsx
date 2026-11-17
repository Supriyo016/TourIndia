"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

/** Shown on profile pages to someone signed out. Signing in reloads the page they were on. */
export function SignInPrompt() {
  const { user, openSignIn } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) router.refresh();
  }, [user, router]);
  return (
    <div className="mt-6">
      <p className="text-ink-2">Sign in to see your profile, saved places, planning requests and privacy choices.</p>
      <button type="button" className="btn btn-accent mt-4" onClick={() => openSignIn()}>
        Sign in
      </button>
    </div>
  );
}
