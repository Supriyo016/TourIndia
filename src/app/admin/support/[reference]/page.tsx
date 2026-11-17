import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { TicketActions } from "@/components/admin/TicketActions";
import { requireAdminPage } from "@/features/admin/guard";
import { supportAdmins, ticketByReference } from "@/features/support/tickets";
import { PRIORITIES, TICKET_CATEGORIES, TICKET_STATUSES } from "@/features/support/types";
import { audit } from "@/lib/security/audit";

export const metadata: Metadata = { title: "Support ticket", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (value: Date) => value.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** One ticket. Opening it is written to the audit log, since it holds the sender's details. */
export default async function AdminTicketPage({ params }: { params: Promise<{ reference: string }> }) {
  const { session, access } = await requireAdminPage("support.manage");
  const { reference } = await params;
  const ticket = await ticketByReference(reference);
  if (!ticket) notFound();
  const [admins] = await Promise.all([supportAdmins(), audit({ actorId: session.user._id, actorEmail: session.user.email, action: "ticket.view", target: reference, outcome: "ok" })]);
  const reply = `mailto:${encodeURIComponent(ticket.email)}?subject=${encodeURIComponent(`Re: ${ticket.subject} [${ticket.reference}]`)}`;

  return (
    <AdminShell permissions={access.permissions} current="/admin/support" email={session.user.email}>
      <p className="text-sm">
        <Link prefetch={false} href="/admin/support" className="link-text">
          ← All tickets
        </Link>
      </p>
      <h1 className="mt-2 text-3xl break-words">{ticket.subject}</h1>
      <p className="mt-1 text-ink-2">
        {ticket.reference} · {TICKET_CATEGORIES[ticket.category] ?? ticket.category} · {PRIORITIES[ticket.priority] ?? ticket.priority} priority · {TICKET_STATUSES[ticket.status] ?? ticket.status}
      </p>

      <section aria-labelledby="message-title" className="card mt-6 p-5">
        <h2 id="message-title" className="text-xl">
          Message
        </h2>
        <p className="mt-1 text-sm text-ink-2">
          From {ticket.name} ({ticket.email}) · {when(ticket.createdAt)}
        </p>
        <p className="mt-3 whitespace-pre-line">{ticket.message}</p>
        <a href={reply} className="btn btn-outline mt-4">
          Reply by email
        </a>
        <p className="mt-2 text-xs text-ink-2">Opens your own email app. The site can&apos;t send email to visitors until a domain is set up.</p>
      </section>

      <TicketActions
        reference={ticket.reference}
        status={ticket.status}
        priority={ticket.priority}
        category={ticket.category}
        assignedTo={ticket.assignedTo ?? ""}
        admins={admins}
        me={session.user._id}
      />

      <section aria-labelledby="notes-title" className="mt-10">
        <h2 id="notes-title" className="text-2xl">
          Internal notes
        </h2>
        <p className="mt-1 text-sm text-ink-2">Only admins see these.</p>
        {(ticket.notes ?? []).length === 0 ? (
          <p className="mt-2 text-ink-2">None yet.</p>
        ) : (
          <ol className="mt-3 grid gap-2">
            {ticket.notes.map((note, i) => (
              <li key={i} className="card p-3 text-sm">
                <p className="text-ink-2">
                  {note.byEmail} · {when(note.at)}
                </p>
                <p className="mt-1 whitespace-pre-line">{note.text}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AdminShell>
  );
}
