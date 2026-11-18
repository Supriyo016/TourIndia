# Backups: the owner's how-to

The database is MongoDB Atlas on the free M0 plan, which has **no automatic backups or snapshots**,
and the site has no file storage. So a backup is a file you download from the admin area and keep
yourself. This page covers making, storing, checking and restoring one.

## Make a backup

1. Sign in to the admin area and open **Backups** (`/admin/backups`). You need the
   `backup.create` permission (Super Admin and Admin have it).
2. Choose **Create and download a backup**. If your authenticator code is more than 15 minutes
   old, the page asks for a new one.
3. The browser downloads `tour-india-backup-YYYY-MM-DD-HH-MM.json.gz`. The page's history then shows
   when it was made, who made it, how many records it holds and the first part of its checksum.

**How often:** at least weekly, and always before a big change (a deploy that changes data, bulk
moderation, a restore).

### What's in it, and what isn't

- **In it:** every collection the site uses (accounts, profiles, saved places, collections, trips,
  comments, edits, tickets, restrictions, notifications, the audit and security logs, and so on),
  including any collections added by later phases.
- **Never in it:** sign-in codes (`otp_codes`), sessions and their token hashes (`sessions`),
  rate-limit counters, the translation cache, server-error counts and the backup history itself.
  Admins' authenticator secrets and recovery-code hashes (the `mfa` field in `admin_members`) are
  removed too.

## Store it safely

The file holds members' email addresses, profiles, trips and messages. Treat it like the database
itself:

- Keep it encrypted: in your password manager's file storage or on an encrypted drive.
- Never email it, put it in a shared folder or commit it to the repository.
- Keep a few recent ones (for example the last four weekly backups) and **delete older files**.

## Deleted accounts stay in old files

When someone deletes their account, they're removed from the live site at once, but they're still in
any backup made before that. That's why old files should be deleted once you no longer need them,
and why the privacy page says so. If you ever restore an old file, check whether anyone deleted their
account after the backup was made, and delete those accounts again afterwards (the audit log lists
deletions).

## Check a backup

**Check a backup file** on the same page reads the file and checks its structure, record counts and
checksum. Nothing in the database changes. It also says whether the file matches one in this site's
history. Do this now and then with your latest file, so you know it opens.

## Restore (Super Admins only)

A restore puts every record in the file back as it was, matched by id:

- Records changed since the backup go back to how they were, so **those changes are lost**.
- Records created since the backup are **kept**, not deleted.
- The audit and security logs are never rewritten: they're append-only, and the restore itself is
  logged.
- Admins keep the authenticators they have now.

Steps:

1. **Download a fresh backup first**, so you can get back to the current state.
2. Under **Restore from a backup**, choose the file and run **Dry run: show what would change**. It
   shows each collection's records as unchanged, to be replaced or to be put back. Nothing is written.
3. If the numbers look right, type the confirmation it shows (`RESTORE` and the first 8 characters of
   the checksum) and choose **Restore these records**. The page asks for a fresh authenticator code
   if yours is more than 15 minutes old. The dry run must be from the last 30 minutes and of the same
   file.
4. Check the result: the page says how many records were restored and whether any failed (for
   example an old account whose email address has since been used by a new one). Failures are in
   **Logs** under `backup.restore`.

If a restore stops part-way (a timeout or a lost connection), run it again with the same file:
records that already match are skipped.

## Limits

- Files up to **4 MB** can be checked or restored in the admin area, because the host limits upload
  size. Downloads have no such limit. Compressed, the site's data is far smaller than this today; if
  it ever grows past 4 MB, ask a developer for a command-line restore.
- A restore can't bring back sign-in sessions (people sign in again) or anything that was never in
  the file (see above).
- The site keeps only the history of backups, never the files, so a lost file can't be downloaded
  again. Make a new one.
