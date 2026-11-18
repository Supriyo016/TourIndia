import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import { requireAdminPage } from "@/features/admin/guard";
import { loadReport, parseRange, RANGES } from "@/features/analytics/report";

export const metadata: Metadata = { title: "Analytics", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const RANGE_LABEL = { 7: "7 days", 30: "30 days", 90: "90 days", 365: "A year" } as const;

/** Visitor analytics from the site's own cookieless beacon. The permission check runs before any figure is read. */
export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { session, access } = await requireAdminPage("analytics.view");
  const range = parseRange((await searchParams).days);
  const report = await loadReport(range);
  const canExport = access.permissions.has("analytics.export");

  return (
    <AdminShell permissions={access.permissions} current="/admin/analytics" email={session.user.email}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1>Analytics</h1>
        <Link prefetch={false} href="/admin/dashboard" className="link-text text-sm">
          Back to the dashboard
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink-2">Counted by the site itself, without cookies or IP addresses, and only for visitors who allowed it.</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Period" className="flex flex-wrap gap-2">
          {RANGES.map((value) => (
            <Link key={value} prefetch={false} href={`/admin/analytics?days=${value}`} aria-current={value === range ? "page" : undefined} className={`chip ${value === range ? "font-semibold text-accent-ink" : ""}`}>
              {RANGE_LABEL[value]}
            </Link>
          ))}
        </nav>
        {canExport && (
          <a href={`/api/admin/analytics/export?days=${range}`} className="btn btn-outline" download>
            <Download className="size-4" aria-hidden /> Export CSV
          </a>
        )}
      </div>

      <div className="mt-6">
        <AnalyticsDashboard report={report} />
      </div>
    </AdminShell>
  );
}
