"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PRIORITIES, TICKET_CATEGORIES, TICKET_STATUSES, type Priority, type TicketCategory, type TicketStatus } from "@/features/support/types";
import { adminPost } from "./adminFetch";

/** Status, priority, category, assignee and internal notes for one ticket. */
export function TicketActions(props: { reference: string; status: TicketStatus; priority: Priority; category: TicketCategory; assignedTo: string; admins: { id: string; email: string }[]; me: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ status: props.status, priority: props.priority, category: props.category, assignedTo: props.assignedTo });
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (body: unknown, done: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminPost("/api/admin/support", body);
      setNotice(done);
      startTransition(() => router.refresh());
      return true;
    } catch (problem) {
      setError((problem as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const disabled = busy || pending;
  const changed = form.status !== props.status || form.priority !== props.priority || form.category !== props.category || form.assignedTo !== props.assignedTo;

  return (
    <section aria-labelledby="ticket-actions-title" className="card mt-6 grid gap-5 p-5">
      <h2 id="ticket-actions-title" className="text-xl">
        Work on this ticket
      </h2>
      <p aria-live="polite" className={notice ? "text-sm" : "sr-only"}>
        {notice}
      </p>
      {error && <p role="alert" className="field-error">{error}</p>}

      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void send(
            {
              action: "update",
              reference: props.reference,
              ...(form.status !== props.status ? { status: form.status } : {}),
              ...(form.priority !== props.priority ? { priority: form.priority } : {}),
              ...(form.category !== props.category ? { category: form.category } : {}),
              ...(form.assignedTo !== props.assignedTo ? { assignTo: form.assignedTo || null } : {}),
            },
            "Ticket updated.",
          );
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label htmlFor="t-status" className="text-sm font-semibold">Status</label>
            <select id="t-status" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TicketStatus })}>
              {Object.entries(TICKET_STATUSES).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="t-priority" className="text-sm font-semibold">Priority</label>
            <select id="t-priority" className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
              {Object.entries(PRIORITIES).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="t-category" className="text-sm font-semibold">Category</label>
            <select id="t-category" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TicketCategory })}>
              {Object.entries(TICKET_CATEGORIES).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="t-assignee" className="text-sm font-semibold">Assigned to</label>
            <select id="t-assignee" className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Nobody</option>
              {props.admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.email}
                  {admin.id === props.me ? " (you)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn-primary justify-self-start" disabled={disabled || !changed}>
          Save changes
        </button>
      </form>

      <form
        className="grid gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          if (await send({ action: "note", reference: props.reference, text: note }, "Note added.")) setNote("");
        }}
      >
        <label htmlFor="t-note" className="text-sm font-semibold">
          Add an internal note
        </label>
        <textarea id="t-note" rows={3} className="input" maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn btn-outline justify-self-start" disabled={disabled || !note.trim()}>
          Add note
        </button>
      </form>
    </section>
  );
}
