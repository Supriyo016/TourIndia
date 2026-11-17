import type { Metadata } from "next";
import Link from "next/link";
import { Dashboard } from "@/components/admin/dashboard/Dashboard";
import { loadDashboard } from "@/features/admin/load";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/features/admin/guard";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Read-only overview for admins. The admin check runs before any figure is read. */
export default async function AdminDashboardPage() {
  const { session, access } = await requireAdminPage("analytics.view");

  const data = await loadDashboard();
  return (
    <AdminShell permissions={access.permissions} current="/admin/dashboard" email={session.user.email}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1>Dashboard</h1>
        <Link prefetch={false} href="/admin" className="link-text text-sm">
          Back to moderation
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink-2">Signed in as {session.user.email}. Figures are read when the page loads.</p>
      <div className="mt-6">
        <Dashboard data={data} />
      </div>
    </AdminShell>
  );
}
