"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { safePath } from "@/lib/safe-path";

/** Name, country and the basics. After first sign-in it carries on to where the person was going. */
export function BasicsSection() {
  const { user } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const welcome = params.get("welcome") === "1";
  const nextParam = params.get("next");
  const next = nextParam ? safePath(nextParam) : null;
  if (!user) return null;
  return (
    <section aria-labelledby="basics-title" className="card p-6">
      <h2 id="basics-title" className="text-xl">
        {welcome ? "Welcome! Finish your profile" : "The basics"}
      </h2>
      <p className="mt-1 mb-5 text-sm text-muted">
        Signed in as <strong className="text-ink">{user.email}</strong>
        {user.google ? " with Google" : ""}. Your email is never shown to anyone. Your name appears on your comments.
      </p>
      <ProfileForm
        onSaved={() => {
          if (next) router.push(next);
          else router.refresh();
        }}
        submitLabel={welcome ? "Save and continue" : "Save the basics"}
      />
    </section>
  );
}
