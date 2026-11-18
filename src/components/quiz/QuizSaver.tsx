"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { History } from "lucide-react";
import { postJson, useAuth } from "@/components/auth/AuthProvider";

/**
 * Keeps the result in the signed-in person's quiz history. Only the answers are sent; the server
 * works out the matches again. Signed out, it offers sign-in and saves nothing.
 */
export function QuizSaver({ answers }: { answers: string }) {
  const { user, loading, openSignIn } = useAuth();
  const sent = useRef("");
  const [state, setState] = useState<"idle" | "saved" | "failed">("idle");

  useEffect(() => {
    if (!user || !answers || sent.current === answers) return;
    sent.current = answers;
    postJson("/api/quiz", { action: "save", answers })
      .then(() => setState("saved"))
      .catch(() => setState("failed"));
  }, [user, answers]);

  if (loading || !answers) return null;
  return (
    <p className="no-print mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-ink-2" role="status">
      <History className="size-4" aria-hidden />
      {!user ? (
        <>
          Want to keep your results?{" "}
          <button type="button" className="link-text" onClick={() => openSignIn("Sign in to keep a history of your quiz results")}>
            Sign in
          </button>
        </>
      ) : state === "failed" ? (
        "This result couldn't be saved to your history."
      ) : (
        <>
          {state === "saved" ? "Saved to your quiz history." : "Saving to your quiz history…"}{" "}
          <Link prefetch={false} href="/profile/achievements#quiz" className="link-text">
            See past results
          </Link>
        </>
      )}
    </p>
  );
}
