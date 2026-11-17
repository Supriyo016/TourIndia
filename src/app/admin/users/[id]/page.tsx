import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProfileReset } from "@/components/admin/ProfileReset";
import { UserActions } from "@/components/admin/UserActions";
import { requireAdminPage } from "@/features/admin/guard";
import { REASONS } from "@/features/admin/restrictions";
import { userRecord } from "@/features/admin/users";

export const metadata: Metadata = { title: "User record", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (value?: string | Date) => (value ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "–");

/** One account, for admins with `users.view`. Viewing it is written to the audit log. */
export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { session, access } = await requireAdminPage("users.view");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const record = await userRecord(id, session.user);
  if (!record) notFound();
  const { user } = record;
  const { active } = record;

  return (
    <AdminShell permissions={access.permissions} current="/admin/users" email={session.user.email}>
      <p className="text-sm">
        <Link prefetch={false} href="/admin/users" className="link-text">
          ← All users
        </Link>
      </p>
      <h1 className={user.name ? "mt-2 break-words" : "mt-2 text-3xl break-all"}>{user.name || user.email}</h1>
      <p className="mt-1 text-ink-2">
        {user.email} · joined {when(user.createdAt)} · last sign-in {when(user.lastLoginAt)}
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Status", user.status === "active" ? "Active" : user.restrictedUntil ? `Restricted until ${when(user.restrictedUntil)}` : "Banned"],
          ["Signs in with", user.google ? "Google or email code" : "Email code (verified)"],
          ["Admin roles", user.adminRoles.join(", ") || "None"],
          ["Open sessions", String(record.sessions.length)],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className={label === "Status" && user.status !== "active" ? "mt-1 font-semibold text-danger" : "mt-1 font-semibold"}>{value}</dd>
          </div>
        ))}
      </dl>

      <UserActions
        userId={user.id}
        email={user.email}
        canRestrict={access.permissions.has("users.ban")}
        canEndSessions={access.permissions.has("users.sessions")}
        active={active ? { id: active._id, kind: active.kind, appealOpen: active.appeal?.status === "open" } : null}
      />

      <section aria-labelledby="profile-title" className="mt-10">
        <h2 id="profile-title" className="text-2xl">
          Public profile
        </h2>
        {!record.profile ? (
          <p className="mt-2 text-ink-2">They haven&apos;t set one up.</p>
        ) : (
          <div className="card mt-3 p-5">
            <p>
              {record.profile.username ? `@${record.profile.username}` : "No username"} · {record.profile.visibility}
            </p>
            {[record.profile.tagline, record.profile.bio, record.profile.city, record.profile.website].some(Boolean) ? (
              <dl className="mt-3 grid gap-2 text-sm">
                {(
                  [
                    ["Tagline", record.profile.tagline],
                    ["About", record.profile.bio],
                    ["City", record.profile.city],
                    ["Website", record.profile.website],
                  ] as const
                )
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-ink-2">{label}</dt>
                      <dd className="break-words whitespace-pre-line">{value}</dd>
                    </div>
                  ))}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-ink-2">No text written.</p>
            )}
            {access.permissions.has("moderation.manage") && <ProfileReset userId={user.id} />}
          </div>
        )}
      </section>

      <section aria-labelledby="restrictions-title" className="mt-10">
        <h2 id="restrictions-title" className="text-2xl">
          Restrictions and appeals
        </h2>
        {record.restrictions.length === 0 ? (
          <p className="mt-2 text-ink-2">None.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {record.restrictions.map((r) => (
              <li key={r._id} className="card p-4 text-sm">
                <p className="font-semibold">
                  {r.kind === "ban" ? (r.permanent ? "Permanent ban" : "Timed ban") : "Suspension"} · {REASONS[r.reason]}
                </p>
                <p className="text-ink-2">
                  From {when(r.startsAt)} {r.endsAt ? `to ${when(r.endsAt)}` : ""} · by {r.createdByEmail}
                  {r.liftedAt ? ` · ended ${when(r.liftedAt)}${r.liftedBy === "expiry" ? " (expired)" : ""}` : ""}
                </p>
                <p className="mt-1">Note: {r.note}</p>
                {r.evidence && <p className="mt-1">Evidence: {r.evidence}</p>}
                {r.liftNote && <p className="mt-1">Lifted because: {r.liftNote}</p>}
                {r.appeal && (
                  <div className="mt-2 rounded-[var(--radius-md)] bg-surface-2 p-3">
                    <p className="font-semibold">
                      Appeal ({r.appeal.status}) · {when(r.appeal.submittedAt)}
                    </p>
                    <p className="mt-1 whitespace-pre-line">{r.appeal.message}</p>
                    {r.appeal.note && <p className="mt-1 text-ink-2">Decision: {r.appeal.note}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="sessions-title" className="mt-10">
        <h2 id="sessions-title" className="text-2xl">
          Signed-in devices
        </h2>
        {record.sessions.length === 0 ? (
          <p className="mt-2 text-ink-2">Not signed in anywhere.</p>
        ) : (
          <ul className="mt-2 grid gap-1 text-sm">
            {record.sessions.map((s, i) => (
              <li key={i}>
                {s.device} {s.role === "admin" ? "(admin)" : ""} · {s.country ?? "–"} · last active {when(s.lastSeenAt)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="comments-title" className="mt-10">
        <h2 id="comments-title" className="text-2xl">
          Recent comments
        </h2>
        {record.comments.length === 0 ? (
          <p className="mt-2 text-ink-2">None.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {record.comments.map((c) => (
              <li key={c.id} className="card p-3 text-sm">
                <p className="text-ink-2">
                  {when(c.createdAt)} · {c.status} · on {c.target}
                </p>
                <p className="mt-1 whitespace-pre-line">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="log-title" className="mt-10">
        <h2 id="log-title" className="text-2xl">
          Admin actions on this account
        </h2>
        {record.moderationLog.length === 0 ? (
          <p className="mt-2 text-ink-2">None.</p>
        ) : (
          <ul className="mt-2 grid gap-1 text-sm">
            {record.moderationLog.map((entry, i) => (
              <li key={i}>
                {when(entry.at)} · {entry.action} {entry.by ? `by ${entry.by}` : ""} {entry.detail ? `· ${entry.detail}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
