import type { Metadata } from "next";
import Link from "next/link";
import { AdminActions } from "@/components/admin/AdminActions";
import { adminOverview, listComments, listEdits, type CommentDoc, type EditDoc } from "@/features/community/service";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/features/admin/guard";
import { isStoreAvailable } from "@/lib/database/store";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const show = (value: unknown) => (Array.isArray(value) ? value.join("\n\n") : String(value ?? ""));
const when = (date: Date) => date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

function EditCard({ edit }: { edit: EditDoc }) {
  return (
    <li className="card p-4">
      <p className="text-sm text-muted">
        <Link prefetch={false} href={edit.path} className="link-text font-semibold">{edit.title}</Link> · {edit.field} · by {edit.authorName} · {when(edit.createdAt)}
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
  // The admin home: everyone with an admin role lands here; moderation needs its own permission.
  const { session, access } = await requireAdminPage();
  if (!access.permissions.has("moderation.manage")) {
    return (
      <AdminShell permissions={access.permissions} current="/admin" email={session.user.email}>
        <h1>Admin</h1>
        <p className="mt-2 text-ink-2">Your role doesn&apos;t include moderation. Use the links below for the areas you can manage.</p>
        <p className="mt-4 flex flex-wrap gap-3">
          {access.permissions.has("analytics.view") && <Link prefetch={false} href="/admin/dashboard" className="btn btn-primary">Dashboard</Link>}
          <Link prefetch={false} href="/admin/mfa" className="btn btn-secondary">Authenticator and recovery codes</Link>
        </p>
      </AdminShell>
    );
  }

  const [overview, edits, held, hidden, reported] = await Promise.all([adminOverview(), listEdits("pending"), listComments("pending"), listComments("hidden"), listComments("reported")]);
  const queues: [string, string, CommentDoc[]][] = [
    ["held", "Comments held for review", held],
    ["hidden", "Hidden after reports", hidden],
    ["reported", "Published but reported", reported],
  ];

  return (
    <AdminShell permissions={access.permissions} current="/admin" email={session.user.email}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1>Admin</h1>
        <Link prefetch={false} href="/admin/dashboard" className="link-text text-sm">
          Open the dashboard
        </Link>
      </div>
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
              {when(entry.at as Date)} · {String(entry.actorEmail ?? entry.adminEmail)} · {String(entry.action)} · {String(entry.target ?? entry.subject ?? "")}
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
