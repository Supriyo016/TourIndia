# Running the platform: the owner's guide

How the site is deployed, what it needs, and what to do when something goes wrong. For local setup
see [setup.md](setup.md); for roles and permissions see [PERMISSIONS.md](PERMISSIONS.md); for every
API route see [ROUTES.md](ROUTES.md); for backups see [BACKUPS.md](BACKUPS.md).

## How a deploy works

Pushing to `master` deploys to production on Vercel. The build runs `npm run vercel-build`:

1. `scripts/db-setup.mjs --deploy` creates any new collections, updates their validation rules and
   indexes, and runs one-off data migrations. It runs **only for production** (previews share the
   database and are skipped) and never fails the deploy: if the database can't be reached it says so
   in the build log and carries on.
2. `next build`.

Pull requests get a preview deploy; GitHub Actions runs type check, lint, unit and security tests, the
production build and the browser tests on every push.

## Settings in Vercel (Production)

| Variable | Needed for | Notes |
|---|---|---|
| `MONGODB_URI`, `MONGODB_DB` | Everything that saves | Atlas user limited to this database. |
| `AUTH_SECRET` | Sign-in | 32+ random characters. **Changing it makes stored admin authenticators unreadable** (admins re-enrol); sessions are unaffected. |
| `RATE_LIMIT_SALT` | Forms, rate limits, analytics visitor counting | 32+ random characters. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Emailed sign-in codes | Until a domain is verified in Resend, codes reach only the owner's address. |
| `ADMIN_EMAILS` | Super Admins | Comma-separated; these are always Super Admins. |
| `CRON_SECRET` | Scheduled publishing | 16+ random characters. Vercel sends it to the daily job automatically. |
| `GROQ_API_KEY` | Yatri's AI answers | Optional; without it Yatri answers from the guides. |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | "Continue with Google" | Optional. |
| `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID` (`VERCEL_TEAM_ID`) | Deploy list on Health | Optional, read-only token. |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAP_ID`, `GOOGLE_SITE_VERIFICATION` | Site address, maps, Search Console | As before. |

Generate random values with a password manager, paste them into Vercel yourself, and redeploy.

## Scheduled job

`vercel.json` runs `/api/cron/content` once a day at 00:30 UTC (06:00 in India) to publish content
versions whose scheduled time has passed. Vercel Hobby allows one run a day, so a version scheduled
for 2 pm goes live at the next run, or straight away when an admin presses **Publish due versions
now** in Content, or whenever its page is next rebuilt. Without `CRON_SECRET` the job refuses to run
and nothing else is affected.

Nothing else needs a schedule: analytics totals are added up as events arrive, and old analytics
events, notifications, error counts, sign-in codes and sessions expire on their own.

## Routine

- **Weekly:** make a backup (Backups) and store it encrypted; delete old copies. Glance at **Health**
  (database, errors, Web Vitals) and the **Moderation queue**.
- **Monthly:** **Logs → Verify the chain** (should report no gaps or edits); review **Team and roles**
  and remove admins who no longer need access; check **SEO** and **Improvements**.

## When something goes wrong

| Problem | What to do |
|---|---|
| Site needs to be taken offline briefly | **Settings → Maintenance mode** (fresh code needed). Visitors see a friendly page; admins and sign-in keep working. Turn it off the same way. |
| A feature misbehaves | **Settings → Features**: turn off Yatri, comments and suggestions, stories, trip requests or the newsletter individually. |
| An admin lost their authenticator | Use a recovery code. If none are left, in Atlas delete the `mfa` field on their `admin_members` record; they enrol again at next sign-in. |
| Someone's account is compromised | **Users → the person → Sign out everywhere**, then suspend if needed. |
| Data lost or damaged | Restore from a backup ([BACKUPS.md](BACKUPS.md)): dry run first, then restore (Super Admin, fresh code, typed confirmation). |
| The database is unreachable | The site keeps serving guides; forms and accounts report they're unavailable. Check Atlas status and network access, then **Health**. |
| A deploy broke something | In Vercel, promote the previous production deployment, then fix forward. |

## Privacy commitments the code keeps

- No advertising or tracking cookies; analytics only with consent, with no IP address, user agent
  string or fingerprint stored.
- Personal data (trips, notes, memories, passport, collections, notifications, quiz results) is
  readable only by its owner; share links show no owner and can be turned off.
- Deleting an account removes it from every collection at once (the append-only logs and ban history
  keep a record without the address); it stays in backups made earlier until those are deleted.
- Admin actions are written to a tamper-evident log.
