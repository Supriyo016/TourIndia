import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/features/admin/guard";
import { moderationQueue } from "@/features/admin/queue";

export const metadata: Metadata = { title: "Moderation queue", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const ACTIONS: Record<string, string> = {
  "edit.approve": "approved a suggested edit",
  "edit.reject": "rejected a suggested edit",
  "comment.visible": "kept a comment",
  "comment.removed": "removed a comment",
  "appeal.upheld": "turned down an appeal",
  "appeal.overturned": "accepted an appeal",
  "user.suspension": "suspended an account",
  "user.ban": "banned an account",
  "user.restore": "restored an account",
  "ticket.update": "updated a ticket",
};

/** Everything waiting for a moderator, grouped by kind, with the latest decisions below. */
export default async function AdminQueuePage() {
  const { session, access } = await requireAdminPage("moderation.manage");
  const { groups, recent } = await moderationQueue();
  const waiting = groups.reduce((sum, g) => sum + g.count, 0);

  return (
    <AdminShell permissions={access.permissions} current="/admin/queue" email={session.user.email}>
      <h1>Moderation queue</h1>
      <p className="mt-1 text-ink-2">{waiting === 0 ? "Nothing is waiting. Well done." : `${waiting} ${waiting === 1 ? "item is" : "items are"} waiting for a decision.`}</p>

      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {groups.map((group) => (
          <li key={group.id} className="card flex flex-col p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl">{group.title}</h2>
              <span className={group.count > 0 ? "text-2xl font-semibold text-accent-ink tabular-nums" : "text-2xl font-semibold text-ink-2 tabular-nums"}>{group.count}</span>
            </div>
            <p className="mt-1 text-sm text-ink-2">{group.description}</p>
            {group.examples.length > 0 && (
              <ul className="mt-3 grid gap-1.5 text-sm">
                {group.examples.map((example, i) => (
                  <li key={i} className="rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2">
                    <span className="block">{example.text}</span>
                    <span className="text-xs text-ink-2">{example.meta}</span>
                  </li>
                ))}
              </ul>
            )}
            {group.count > 0 && (
              <Link prefetch={false} href={group.href} className="link-text mt-3 self-start text-sm font-semibold">
                Review
              </Link>
            )}
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent-title" className="mt-10">
        <h2 id="recent-title" className="text-2xl">
          Recent decisions
        </h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-ink-2">None yet.</p>
        ) : (
          <ul className="mt-3 grid gap-1 text-sm">
            {recent.map((entry, i) => (
              <li key={i}>
                {entry.at.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} · {entry.by ?? "system"} {ACTIONS[entry.action] ?? entry.action}
                {entry.target ? <span className="text-ink-2"> ({entry.target.slice(0, 13)})</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
