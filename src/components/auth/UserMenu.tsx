"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { NotificationBell } from "./NotificationBell";

/** "Sign in" in the header, or the signed-in person's menu. */
export function UserMenu() {
  const { user, loading, openSignIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !root.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!user) {
    return (
      <button type="button" className="icon-btn sm:!w-auto sm:gap-1.5 sm:px-3 sm:font-semibold" aria-label="Sign in" disabled={loading} onClick={() => openSignIn()}>
        <LogIn className="size-5" aria-hidden />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  const initial = (user.name || user.email).charAt(0).toUpperCase();
  return (
    <>
      <NotificationBell />
      <div ref={root} className="relative">
        <button type="button" className="icon-btn" aria-haspopup="menu" aria-expanded={open} aria-label={`Account: ${user.name || user.email}`} onClick={() => setOpen(!open)}>
          <span className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--rani))] text-sm font-bold text-white">{initial}</span>
        </button>
        {open && (
          <div role="menu" className="glass-panel anim-menu absolute right-0 top-full z-50 mt-2 w-60 p-1">
            <p className="truncate px-3 py-2 text-sm text-muted">{user.email}</p>
            <Link prefetch={false} role="menuitem" href="/profile" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-ink hover:bg-surface-2">
              <UserRound className="size-4" aria-hidden /> Your profile
            </Link>
            {user.role === "admin" && (
              <Link prefetch={false} role="menuitem" href="/admin" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-ink hover:bg-surface-2">
                <ShieldCheck className="size-4" aria-hidden /> Admin
              </Link>
            )}
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex min-h-11 w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-left text-ink hover:bg-surface-2"
            >
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
