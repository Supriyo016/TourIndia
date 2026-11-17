import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/features/admin/guard";
import { openAppeals, REASONS } from "@/features/admin/restrictions";
import { searchUsers } from "@/features/admin/users";

export const metadata: Metadata = { title: "Users", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const date = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "–");

type Search = { q?: string; status?: string; page?: string };

/** The user directory: search by email or name, filter by status, 25 a page. */
export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { session, access } = await requireAdminPage("users.view");
  const params = await searchParams;
  const status = params.status === "active" || params.status === "restricted" ? params.status : "all";
  const [result, appeals] = await Promise.all([searchUsers({ q: params.q, status, page: Number(params.page) || 1 }), access.permissions.has("users.ban") ? openAppeals(20) : Promise.resolve([])]);
  const link = (page: number) => `/admin/users?${new URLSearchParams({ ...(params.q ? { q: params.q } : {}), ...(status !== "all" ? { status } : {}), page: String(page) })}`;

  return (
    <AdminShell permissions={access.permissions} current="/admin/users" email={session.user.email}>
      <h1>Users</h1>
      <p className="mt-1 text-ink-2">Every Tour India account. Opening someone&apos;s record is noted in the audit log.</p>

      {appeals.length > 0 && (
        <section aria-labelledby="appeals-title" className="card mt-6 p-5">
          <h2 id="appeals-title" className="text-xl">
            Open appeals ({appeals.length})
          </h2>
          <ul className="mt-3 grid gap-2">
            {appeals.map((row) => (
              <li key={row._id}>
                <Link prefetch={false} href={`/admin/users/${row.userId}`} className="link-text">
                  {row.email}
                </Link>{" "}
                <span className="text-sm text-ink-2">
                  · {row.kind}, {REASONS[row.reason]} · appealed {date(row.appeal?.submittedAt.toISOString())}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form className="mt-6 flex flex-wrap items-end gap-3" role="search" aria-label="Find a user">
        <div className="grid gap-1.5">
          <label htmlFor="user-q" className="text-sm font-semibold">
            Email or name
          </label>
          <input id="user-q" name="q" defaultValue={params.q ?? ""} className="input w-72 max-w-full" placeholder="asha@ or Asha" autoComplete="off" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="user-status" className="text-sm font-semibold">
            Status
          </label>
          <select id="user-status" name="status" defaultValue={status} className="input">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="restricted">Suspended or banned</option>
          </select>
        </div>
        <button className="btn btn-primary">Search</button>
      </form>

      <p className="mt-4 text-sm text-ink-2" role="status">
        {result.total} {result.total === 1 ? "account" : "accounts"}
        {params.q ? ` matching “${params.q}”` : ""}.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="text-ink-2">
            <tr>
              <th scope="col" className="py-2 pr-4 font-semibold">Account</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Status</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Joined</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Last sign-in</th>
              <th scope="col" className="py-2 font-semibold">Sign-in</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="py-2.5 pr-4">
                  <Link prefetch={false} href={`/admin/users/${row.id}`} className="link-text font-semibold">
                    {row.name || row.email}
                  </Link>
                  {row.name && <span className="block text-ink-2">{row.email}</span>}
                  {row.adminRoles.length > 0 && <span className="block text-xs text-accent-ink">Admin: {row.adminRoles.join(", ")}</span>}
                </td>
                <td className="py-2.5 pr-4">
                  {row.status === "active" ? "Active" : <span className="font-semibold text-danger">{row.restrictedUntil ? `Restricted until ${date(row.restrictedUntil)}` : "Banned"}</span>}
                </td>
                <td className="py-2.5 pr-4 whitespace-nowrap">{date(row.createdAt)}</td>
                <td className="py-2.5 pr-4 whitespace-nowrap">{date(row.lastLoginAt)}</td>
                <td className="py-2.5">{row.google ? "Google and email" : "Email code"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.rows.length === 0 && <p className="mt-4 text-ink-2">No accounts match. Try part of an email address or name.</p>}
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
