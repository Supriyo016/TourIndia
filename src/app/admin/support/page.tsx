import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/features/admin/guard";
import { countOpenTickets, listTickets } from "@/features/support/tickets";
import { CATEGORY_IDS, PRIORITIES, STATUS_IDS, TICKET_CATEGORIES, TICKET_STATUSES, type TicketCategory, type TicketStatus } from "@/features/support/types";

export const metadata: Metadata = { title: "Support tickets", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const date = (value: Date) => value.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
type Search = { status?: string; category?: string; mine?: string; page?: string };

/** Support tickets from the contact form: open ones first, urgent ones at the top of each page. */
export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { session, access } = await requireAdminPage("support.manage");
  const params = await searchParams;
  const status = (STATUS_IDS as string[]).includes(params.status ?? "") ? (params.status as TicketStatus) : params.status === "all" ? "all" : "open";
  const category = (CATEGORY_IDS as string[]).includes(params.category ?? "") ? (params.category as TicketCategory) : undefined;
  const mine = params.mine === "1";
  const [result, counts] = await Promise.all([listTickets({ status, category, assignedTo: mine ? session.user._id : undefined, page: Number(params.page) || 1 }), countOpenTickets()]);
  const link = (page: number) =>
    `/admin/support?${new URLSearchParams({ ...(status !== "open" ? { status } : {}), ...(category ? { category } : {}), ...(mine ? { mine: "1" } : {}), page: String(page) })}`;

  return (
    <AdminShell permissions={access.permissions} current="/admin/support" email={session.user.email}>
      <h1>Support tickets</h1>
      <p className="mt-1 text-ink-2">
        Messages from the contact form. {counts.total} open: {counts.new} new, {counts.under_review} under review, {counts.in_progress} in progress.
      </p>

      <form className="mt-6 flex flex-wrap items-end gap-3" aria-label="Filter tickets">
        <div className="grid gap-1.5">
          <label htmlFor="ticket-status" className="text-sm font-semibold">
            Status
          </label>
          <select id="ticket-status" name="status" defaultValue={status} className="input">
            <option value="open">Open (new, under review, in progress)</option>
            {STATUS_IDS.map((id) => (
              <option key={id} value={id}>
                {TICKET_STATUSES[id]}
              </option>
            ))}
            <option value="all">All</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="ticket-category" className="text-sm font-semibold">
            Category
          </label>
          <select id="ticket-category" name="category" defaultValue={category ?? ""} className="input">
            <option value="">Any</option>
            {CATEGORY_IDS.map((id) => (
              <option key={id} value={id}>
                {TICKET_CATEGORIES[id]}
              </option>
            ))}
          </select>
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="mine" value="1" defaultChecked={mine} /> Assigned to me
        </label>
        <button className="btn btn-primary">Show</button>
      </form>

      <p className="mt-4 text-sm text-ink-2" role="status">
        {result.total} {result.total === 1 ? "ticket" : "tickets"}.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="text-ink-2">
            <tr>
              <th scope="col" className="py-2 pr-4 font-semibold">Ticket</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Category</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Priority</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Status</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Assigned</th>
              <th scope="col" className="py-2 font-semibold">Received</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((t) => (
              <tr key={t.reference} className="border-t border-line align-top">
                <td className="py-2.5 pr-4">
                  <Link prefetch={false} href={`/admin/support/${t.reference}`} className="link-text font-semibold">
                    {t.subject}
                  </Link>
                  <span className="block text-xs text-ink-2">
                    {t.reference} · {t.name}
                  </span>
                </td>
                <td className="py-2.5 pr-4">{TICKET_CATEGORIES[t.category] ?? t.category}</td>
                <td className={t.priority === "urgent" || t.priority === "high" ? "py-2.5 pr-4 font-semibold text-danger" : "py-2.5 pr-4"}>{PRIORITIES[t.priority] ?? t.priority}</td>
                <td className="py-2.5 pr-4">{TICKET_STATUSES[t.status] ?? t.status}</td>
                <td className="py-2.5 pr-4">{t.assignedEmail ?? "–"}</td>
                <td className="py-2.5 whitespace-nowrap">{date(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.rows.length === 0 && <p className="mt-4 text-ink-2">No tickets here.</p>}
      </div>
      {result.pages > 1 && (
        <nav aria-label="Pages" className="mt-4 flex items-center gap-3 text-sm">
          {result.page > 1 && (
            <Link prefetch={false} href={link(result.page - 1)} className="chip">
              Previous
            </Link>
          )}
          <span>
            Page {result.page} of {result.pages}
          </span>
          {result.page < result.pages && (
            <Link prefetch={false} href={link(result.page + 1)} className="chip">
              Next
            </Link>
          )}
        </nav>
      )}
    </AdminShell>
  );
}
