"use client";

import { useEffect, useState } from "react";
import { BOOKING_KINDS, type BookingKind } from "@/features/bookings/schema";

interface RequestRow {
  reference: string;
  kind: BookingKind;
  destinationName: string;
  checkIn: string;
  checkOut: string;
  status: "new" | "contacted" | "closed";
}

const STATUS = { new: "Received", contacted: "We replied", closed: "Closed" } as const;

/** The signed-in person's planning requests and where each one stands. */
export function MyRequests() {
  const [rows, setRows] = useState<RequestRow[] | null>(null);
  useEffect(() => {
    fetch("/api/bookings", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { requests: [] }))
      .then((data: { requests: RequestRow[] }) => setRows(data.requests))
      .catch(() => setRows([]));
  }, []);
  return (
    <section id="requests" aria-labelledby="requests-title" className="card p-6">
      <h2 id="requests-title" className="text-xl">Your planning requests</h2>
      {rows === null ? (
        <p className="mt-2 text-muted">Loading…</p>
      ) : rows.length ? (
        <ul className="mt-3 divide-y divide-line">
          {rows.map((row) => (
            <li key={row.reference} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span>
                <span className="font-mono font-semibold">{row.reference}</span> · {BOOKING_KINDS[row.kind]} in {row.destinationName}, {row.checkIn} to {row.checkOut}
              </span>
              <span className="tag tag-editorial">{STATUS[row.status]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-ink-2">
          None yet. <a href="/bookings#request-title" className="link-text">Ask us to help plan a trip</a>.
        </p>
      )}
    </section>
  );
}
