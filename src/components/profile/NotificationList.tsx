"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, CheckCheck, LifeBuoy, MessageSquareOff, PencilLine, Scale, ShieldAlert } from "lucide-react";
import { postJson } from "@/components/auth/AuthProvider";
import { NOTIFICATIONS_CHANGED } from "@/components/auth/NotificationBell";
import type { PublicNotification } from "@/features/notifications/service";

const ICONS = { support: LifeBuoy, appeal: Scale, account: ShieldAlert, edit: PencilLine, comment: MessageSquareOff } as const;
const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** The person's notifications, with "mark as read" for one or all. */
export function NotificationList({ initial }: { initial: PublicNotification[] }) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState("");
  const unread = items.filter((item) => !item.read).length;

  const mark = async (body: { action: "read"; ids: string[] } | { action: "read-all" }) => {
    setError("");
    try {
      const result = await postJson<{ unread: number }>("/api/notifications", body);
      setItems((current) => current.map((item) => (body.action === "read-all" || body.ids.includes(item.id) ? { ...item, read: true } : item)));
      window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED, { detail: { unread: result.unread } }));
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "That didn't work.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="card mt-6 p-8 text-center">
        <BadgeCheck className="mx-auto size-8 text-accent-ink" aria-hidden />
        <h2 className="mt-2 text-xl">Nothing here yet</h2>
        <p className="mx-auto mt-1 max-w-md text-ink-2">We&apos;ll let you know here when something happens on your account, like an answer to a support request or a decision on an edit you suggested.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-ink-2">
          {unread === 0 ? "All read." : `${unread} unread.`}
        </p>
        {unread > 0 && (
          <button type="button" className="btn btn-outline" onClick={() => void mark({ action: "read-all" })}>
            <CheckCheck className="size-4" aria-hidden /> Mark all as read
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
      <ul className="mt-3 grid gap-3">
        {items.map((item) => {
          const Icon = ICONS[item.kind] ?? BadgeCheck;
          return (
            <li key={item.id} className={`card flex gap-3 p-4 ${item.read ? "" : "border-l-4 border-l-accent"}`}>
              <Icon className="mt-0.5 size-5 shrink-0 text-accent-ink" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {!item.read && <span className="sr-only">Unread: </span>}
                  {item.title}
                </p>
                {item.body && <p className="mt-0.5 text-ink-2">{item.body}</p>}
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-2">
                  <time dateTime={item.createdAt} suppressHydrationWarning>{when(item.createdAt)}</time>
                  {item.href && (
                    <Link prefetch={false} href={item.href} className="link-text" onClick={() => !item.read && void mark({ action: "read", ids: [item.id] })}>
                      Open
                    </Link>
                  )}
                  {!item.read && (
                    <button type="button" className="link-text min-h-11 sm:min-h-0" onClick={() => void mark({ action: "read", ids: [item.id] })}>
                      Mark as read
                    </button>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
