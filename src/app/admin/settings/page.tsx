import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { requireAdminPage } from "@/features/admin/guard";
import { getSettings } from "@/features/settings/settings";

export const metadata: Metadata = { title: "Settings", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Feature flags and maintenance mode (settings.manage). */
export default async function AdminSettingsPage() {
  const { session, access } = await requireAdminPage("settings.manage");
  const settings = await getSettings({ fresh: true });
  return (
    <AdminShell permissions={access.permissions} current="/admin/settings" email={session.user.email}>
      <h1>Settings</h1>
      <p className="mt-1 max-w-prose text-ink-2">Switch features off for a while, or put the site into maintenance mode. Every change is recorded in the audit log.</p>
      <SettingsForm flags={settings.flags} maintenance={{ on: settings.maintenance.on, message: settings.maintenance.message }} />
    </AdminShell>
  );
}
