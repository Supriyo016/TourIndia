import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { CreateBackup, RestoreBackup, VerifyBackup } from "@/components/admin/BackupTools";
import { requireAdminPage } from "@/features/admin/guard";
import { EXCLUDED_COLLECTIONS, NOT_RESTORED } from "@/features/backups/format";
import { backupHistory } from "@/features/backups/service";

export const metadata: Metadata = { title: "Backups", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (value: Date) => value.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

/**
 * Backups without file storage: download an export, check one, and (Super Admins only) restore
 * from one. The site keeps only the history: who, when, how many records and the checksum.
 */
export default async function AdminBackupsPage() {
  const { session, access } = await requireAdminPage("backup.create");
  const history = await backupHistory();
  const canRestore = access.superAdmin && access.permissions.has("backup.restore");

  return (
    <AdminShell permissions={access.permissions} current="/admin/backups" email={session.user.email}>
      <h1>Backups</h1>
      <p className="mt-1 max-w-prose text-ink-2">
        The free database plan has no automatic backups, and the site has no file storage, so a backup is a file you download and keep. Make one at least weekly and before any big change. It&apos;s compressed JSON with a checksum, so you can check later that it&apos;s complete and unchanged.
      </p>

      <div className="mt-6 grid gap-5 [&>*]:min-w-0">
        <section aria-labelledby="create-title" className="card p-5">
          <h2 id="create-title" className="text-xl">
            Create a backup
          </h2>
          <p className="mt-1 mb-4 max-w-prose text-sm text-ink-2">
            Includes every collection except sign-in codes, session tokens, rate-limit counters, caches and this history ({[...EXCLUDED_COLLECTIONS].sort().join(", ")}). Admins&apos; authenticator secrets and recovery codes are left out too. Needs a fresh authenticator code, and each backup is logged.
          </p>
          <CreateBackup />
        </section>

        <section aria-labelledby="history-title" className="card p-5">
          <h2 id="history-title" className="text-xl">
            History
          </h2>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-ink-2">No backups have been made from this page yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="text-ink-2">
                  <tr>
                    <th scope="col" className="py-1.5 pr-3 font-semibold">Made</th>
                    <th scope="col" className="py-1.5 pr-3 font-semibold">By</th>
                    <th scope="col" className="py-1.5 pr-3 font-semibold">Records</th>
                    <th scope="col" className="py-1.5 font-semibold">Checksum</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row._id} className="border-t border-line">
                      <td className="py-1.5 pr-3 whitespace-nowrap">{when(row.createdAt)}</td>
                      <td className="py-1.5 pr-3 break-all">{row.createdByEmail}</td>
                      <td className="py-1.5 pr-3">{row.status === "complete" ? Object.values(row.counts ?? {}).reduce((a, b) => a + b, 0) : <span className="text-danger">Didn&apos;t finish</span>}</td>
                      <td className="py-1.5">{row.checksum ? <code title={row.checksum}>{row.checksum.slice(0, 16)}…</code> : "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="verify-title" className="card p-5">
          <h2 id="verify-title" className="text-xl">
            Check a backup file
          </h2>
          <p className="mt-1 mb-4 max-w-prose text-sm text-ink-2">Reads the file and checks its structure, record counts and checksum. Nothing in the database changes.</p>
          <VerifyBackup />
        </section>

        <section aria-labelledby="restore-title" className="card p-5">
          <h2 id="restore-title" className="text-xl">
            Restore from a backup
          </h2>
          <p className="mt-1 mb-4 max-w-prose text-sm text-ink-2">
            Puts every record in the file back as it was. Records created since the backup are kept, not deleted. The logs ({[...NOT_RESTORED].sort().join(", ")}) are never rewritten. Admins keep their current authenticators. A dry run comes first, then you type a confirmation; both are logged.
          </p>
          {canRestore ? <RestoreBackup /> : <p className="text-sm">Only a Super Admin can restore. Ask the site owner if a restore is needed.</p>}
        </section>

        <section aria-labelledby="limits-title" className="card p-5">
          <h2 id="limits-title" className="text-xl">
            Good to know
          </h2>
          <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm text-ink-2">
            <li>A downloaded file holds members&apos; email addresses, profiles, trips and messages. Store it encrypted (for example in a password manager or an encrypted drive), never in email or a shared folder.</li>
            <li>When someone deletes their account, they&apos;re removed from the site at once but stay in backup files made before that. Delete old backups you no longer need, and don&apos;t restore an old file without checking who has left since.</li>
            <li>Files up to 4 MB can be checked or restored here, because of a hosting limit on uploads. Downloads have no such limit.</li>
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
