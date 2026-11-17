import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTeam } from "@/components/admin/AdminTeam";
import { requireAdminPage } from "@/features/admin/guard";

export const metadata: Metadata = { title: "Team and roles", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Who can do what in the admin area. Changes need a fresh authenticator code. */
export default async function AdminTeamPage() {
  const { session, access } = await requireAdminPage("admins.manage");
  return (
    <AdminShell permissions={access.permissions} current="/admin/team" email={session.user.email}>
      <h1>Team and roles</h1>
      <p className="mt-1 text-ink-2">
        Signed in as {session.user.email}. Admins sign in with an emailed code and an authenticator app. Changes here ask for a fresh authenticator code and are recorded in the audit log.
      </p>
      <AdminTeam canEditRoles={access.permissions.has("roles.manage")} isSuperAdmin={access.superAdmin} />
    </AdminShell>
  );
}
