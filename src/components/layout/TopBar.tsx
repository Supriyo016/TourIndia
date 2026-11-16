"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CalendarDays, NotebookPen } from "lucide-react";
import { formatIndiaDateTime, nextHoliday, todayInIndia } from "@/features/calendar/calendar";

function subscribeToSeconds(listener: () => void) {
  const timer = window.setInterval(listener, 1000);
  return () => window.clearInterval(timer);
}

const currentSecond = () => Math.floor(Date.now() / 1000);

const shortDate = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Live date and time in India, with the next holiday. Rendered inside the header. */
export function TopBar() {
  const second = useSyncExternalStore(subscribeToSeconds, currentSecond, () => 0);
  const now = second ? new Date(second * 1000) : null;
  const clock = now ? formatIndiaDateTime(now) : null;
  const upcoming = now ? nextHoliday(todayInIndia(now)) : undefined;

  return (
    <div className="border-b border-line/70 text-[0.78rem] text-ink-2">
      <div className="container-x flex min-h-7 flex-wrap items-center justify-between gap-x-4 py-0.5">
        <p className="min-h-5 tabular-nums" data-testid="india-clock">
          {clock && (
            <>
              <span className="font-semibold text-ink">{clock.date}</span> · <time>{clock.time}</time>{" "}
              <abbr title="India Standard Time" className="no-underline">IST</abbr>
            </>
          )}
        </p>
        <div className="flex items-center gap-4">
          {upcoming && (
            <span className="hidden md:inline">
              Next holiday: <span className="font-semibold text-ink">{upcoming.name}</span>, {shortDate(upcoming.date)}
            </span>
          )}
          <Link prefetch={false} href="/calendar" className="link-u inline-flex min-h-6 items-center gap-1.5 font-semibold text-brand">
            <CalendarDays className="size-3.5" aria-hidden /> Calendar
          </Link>
          <Link prefetch={false} href="/calendar#notes" className="link-u hidden min-h-6 items-center gap-1.5 font-semibold text-brand xs:inline-flex">
            <NotebookPen className="size-3.5" aria-hidden /> Notes
          </Link>
        </div>
      </div>
    </div>
  );
}
