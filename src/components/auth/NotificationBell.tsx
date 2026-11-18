"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

/** Tells the bell to fetch the count again, for example after notifications are marked read. */
export const NOTIFICATIONS_CHANGED = "tour-india:notifications";

/**
 * The header bell for signed-in people, with the number of unread notifications. It checks on
 * each page change and when the tab comes back into view, at most once every 30 seconds.
 */
export function NotificationBell() {
  const path = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let last = 0;
    const load = async (force = false) => {
      if (!force && Date.now() - last < 30_000) return;
      last = Date.now();
      try {
        const response = await fetch("/api/notifications?count=1", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { unread?: number };
        if (!cancelled) setUnread(Math.max(0, Number(data.unread) || 0));
      } catch {
        // The bell just keeps its last count.
      }
    };
    void load(true);
    const onVisible = () => document.visibilityState === "visible" && void load();
    const onChanged = (event: Event) => {
      const next = (event as CustomEvent<{ unread?: number }>).detail?.unread;
      if (typeof next === "number") setUnread(next);
      else void load(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(NOTIFICATIONS_CHANGED, onChanged);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(NOTIFICATIONS_CHANGED, onChanged);
    };
  }, [path]);

  const label = unread === 0 ? "Notifications, none unread" : `Notifications, ${unread} unread`;
  return (
    <Link prefetch={false} href="/profile/notifications" className="icon-btn relative" aria-label={label} title={label}>
      <Bell className="size-5" aria-hidden />
      {unread > 0 && (
        <span aria-hidden className="absolute top-1 right-1 flex min-w-[1.15rem] items-center justify-center rounded-full bg-danger px-1 text-[0.7rem] leading-[1.15rem] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
