import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminActions } from "@/components/admin/AdminActions";
import { adminOverview, listComments, listEdits, type CommentDoc, type EditDoc } from "@/features/community/service";
import { currentSession } from "@/lib/auth/session";
import { isStoreAvailable } from "@/lib/database/store";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const show = (value: unknown) => (Array.isArray(value) ? value.join("\n\n") : String(value ?? ""));
const when = (date: Date) => date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

function EditCard({ edit }: { edit: EditDoc }) {
  return (
    <li className="card p-4">
      <p className="text-sm text-muted">
        <Link href={edit.path} className="link-text font-semibold">{edit.title}</Link> · {edit.field} · by {edit.authorName} · {when(edit.createdAt)}
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-muted uppercase">Now</p>
          <p className="mt-1 max-h-60 overflow-auto rounded bg-surface-2 p-3 text-sm whitespace-pre-line scroll-thin">{show(edit.current)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted uppercase">Suggested</p>
          <p className="mt-1 max-h-60 overflow-auto rounded bg-brand-soft p-3 text-sm whitespace-pre-line scroll-thin">{show(edit.proposed)}</p>
        </div>
      </div>
      <p className="mt-2 text-sm"><strong>Reason:</strong> {edit.reason}</p>
      <AdminActions
        choices={[
          { label: "Approve and publish", body: { action: "edit", id: edit._id, approve: true } },
          { label: "Reject", tone: "danger", body: { action: "edit", id: edit._id, approve: false } },
        ]}
      />
    </li>
  );
}

function CommentCard({ comment }: { comment: CommentDoc }) {
  return (
    <li className="card p-4">
      <p className="text-sm text-muted">
        {comment.target} · {comment.authorName} · {comment.kind} · {when(comment.createdAt)} · {comment.reports} report{comment.reports === 1 ? "" : "s"} · {comment.status}
      </p>
      <p className="mt-2 whitespace-pre-line">{comment.body}</p>
      <AdminActions
        choices={[
          { label: "Publish", body: { action: "comment", id: comment._id, status: "visible" } },
          { label: "Remove", tone: "danger", body: { action: "comment", id: comment._id, status: "removed" } },
          ...(comment.userId ? [{ label: "Block author", tone: "danger" as const, body: { action: "user" as const, id: comment.userId, status: "blocked" as const } }] : []),
        ]}
      />
    </li>
  );
}

export default async function AdminPage() {
  if (!isStoreAvailable()) {
    return <p className="container-x py-14">The database isn&apos;t connected, so there is nothing to moderate yet.</p>;
  }
  const session = await currentSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const [overview, edits, held, hidden, reported] = await Promise.all([adminOverview(), listEdits("pending"), listComments("pending"), listComments("hidden"), listComments("reported")]);
  const queues: [string, string, CommentDoc[]][] = [
    ["held", "Comments held for review", held],
    ["hidden", "Hidden after reports", hidden],
    ["reported", "Published but reported", reported],
  ];

  return (
    <div className="container-x py-10">
      <h1>Admin</h1>
      <p className="mt-1 text-ink-2">Signed in as {session.user.email}.</p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Suggested edits", overview.pendingEdits],
          ["Held comments", overview.pendingComments],
          ["Hidden comments", overview.hiddenComments],
          ["Accounts", overview.users],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="font-display text-3xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="edits-title" className="mt-10">
        <h2 id="edits-title">Suggested edits</h2>
        {edits.length ? <ul className="mt-4 grid gap-4">{edits.map((edit) => <EditCard key={edit._id} edit={edit} />)}</ul> : <p className="mt-3 text-muted">Nothing waiting.</p>}
      </section>

      {queues.map(([id, title, list]) => (
        <section key={id} aria-labelledby={`${id}-title`} className="mt-10">
          <h2 id={`${id}-title`}>{title}</h2>
          {list.length ? <ul className="mt-4 grid gap-4">{list.map((comment) => <CommentCard key={comment._id} comment={comment} />)}</ul> : <p className="mt-3 text-muted">Nothing here.</p>}
        </section>
      ))}

      <section aria-labelledby="audit-title" className="mt-10">
        <h2 id="audit-title">Recent admin actions</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {overview.recentAudit.map((entry) => (
            <li key={entry._id} className="py-2">
              {when(entry.at as Date)} · {String(entry.adminEmail)} · {String(entry.action)} · {String(entry.subject)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
