# Admin Control Centre and My Travel Dashboard: audit and plan

**Started:** 2026-11-17. **Brief:** the owner's master prompt (Module A: Super Admin Control Centre; Module B: My Travel Dashboard; Module C: shared architecture). Phases are ticked only when their checks pass on the live site.

## 1. Audit: what exists today (verified in code)

| Area | What exists | Gap against the brief |
|---|---|---|
| Sign-in | Passwordless: 6-digit email codes (Resend) and Google OAuth (code ready, not configured). Sessions in MongoDB, hashed tokens, httpOnly cookie; users 30 days, admins 8 hours. Rate limits per IP and per address. | No MFA, no session list or revoke, no login history. There are **no passwords**, so "password hashing and recovery" doesn't apply; recovery = a new email code. |
| Roles | Two roles: `user`, `admin`. Admin = session made with an emailed admin code **and** address in `ADMIN_EMAILS`. Checked server-side. | No RBAC: no custom roles, no granular permissions, no admin accounts beyond the env list. |
| Admin area | `/admin` (moderation: suggested edits, held/hidden comments, block/unblock users, recent actions), `/admin/dashboard` (read-only counts and integration status), `/admin/login`. `audit_log` collection written by admin actions. | No user directory or search, no suspensions with expiry, appeals, CMS, media, analytics, logs, security centre, settings, backups, reports. |
| Content | All public content is **TypeScript data in the repo** (`src/data`, 1.8 MB: destinations, states, festivals, food, arts, heritage, stories, quiz, calendar). Community edits are stored as `content_overrides` per field and applied at render. | No CMS: editors can't create, schedule, version or publish content without a code change. |
| Personal data | `/account` (name, home state, interests, travel style, language, marketing consent, export, delete). **Saved places, passport stamps, trips, packing lists, expenses and notes live only in the browser (`localStorage`)**. | Not synced across devices, lost if the browser is cleared, invisible to the server. Module B needs all of it server-side, plus guest-to-account migration. |
| Community | Comments, loves, ratings, suggested edits, reports, story submissions, contact, newsletter, trip-planning requests. | No user-facing "my contributions" view; no support tickets. |
| Yatri | Server-side Groq agent with tools over the guides, daily site-wide cap, rate limits. | No conversation logging (deliberately), no feedback, no admin metrics beyond a daily counter. |
| Analytics | **None.** No visitor tracking of any kind. | Everything in A3 is new. Nothing can be backfilled: figures start from the day tracking ships. |
| Storage and hosting | Vercel Hobby, MongoDB Atlas M0 (512 MB, free), Groq free key, Resend free (sends only to the owner's address until a domain is verified). No file storage, no scheduled jobs. | Uploads (avatars, memories, media manager) need file storage. Atlas M0 has **no built-in backups**. Vercel Hobby crons run at most daily. |

## 2. Honest limits (what won't be built as written, and why)

- **No fabricated numbers.** Analytics, KPIs and charts show only what is recorded from launch onward; empty states say so.
- **Backups:** Atlas M0 has no snapshots. Plan: a daily cron exports the collections as compressed JSON to file storage, keeps a rotation, and the admin can verify and download. Restoration is a guarded, Super-Admin-only, documented procedure; deleting a user does not purge them from existing backups until those rotate out, and the privacy page will say so.
- **Server controls:** Vercel manages the servers, so "server management" means read-only health (uptime checks, error rates, deployment list via the Vercel API if a token is provided), not restart buttons.
- **Email to other people** (user notifications, reminders, support replies) only works once a domain is verified in Resend. Until then, in-app notifications only.
- **Push notifications, passkeys, heatmaps, session replay, A/B testing and 3D model management** are deferred to Phase 9 and built only if they stay light and privacy-safe. No keystroke, form-content or fingerprint capture, ever.
- **Geography:** country and Indian state come from Vercel's request headers (no IP stored); city only in aggregate.
- **Visits are user-recorded only** (no GPS, no inference from browsing). The passport is a personal record, not an official document. Bookings stay external links; no payments.

## 3. Architecture decisions

1. **One user collection, permissions on top.** `users` stays the single identity. Admin access moves from the env list to `admin_roles` + `admin_memberships` with granular permissions; `ADMIN_EMAILS` becomes the **Super Admin bootstrap** only. Every admin API checks a named permission server-side (`requirePermission("users.ban")`).
2. **Admin MFA:** TOTP (authenticator app) with recovery codes, required for every admin role, on top of the emailed code. Fresh re-authentication for destructive actions.
3. **Append-only audit:** admin, security and application events go to separate collections with no update or delete path in the app; a hash chain makes tampering visible.
4. **CMS as a versioned layer over the repo data.** Repo data stays the baseline (fast, typed, reviewed); the CMS stores drafts, versions and published edits in MongoDB (`content_items`, `content_versions`), extending today's `content_overrides`. New items (for example a new destination) live in the database and merge into the same lists. Workflow: Draft → Review → Approved → Published → Archived, with scheduling.
5. **Personal data moves server-side** with per-user ownership on every query: `user_saved_items`, `user_collections`, `user_trips` (stops, days and expenses embedded), `user_places` (passport), `user_memories`, `user_quiz_attempts`, `user_events`, `user_notifications`. Guests keep using local storage; on sign-in, local items are merged once (deduplicated) and the local copy cleared.
6. **First-party, cookieless analytics.** A tiny beacon sends page views and feature events to `/api/collect` only with analytics consent; the server stores a daily salted hash for unique counting (no IP, no user agent string), plus device class, browser family, country, state, referrer host and path. Raw events expire after 90 days; daily aggregates are kept.
7. **No file storage** (owner's decision): preset illustrated avatars and covers; no user uploads, so no upload attack surface.

## 4. Phases

Each phase ends with type check, lint, unit and security tests, browser tests, a production build, a live check and a pull request merged with the owner's approval.

- [x] **P1 Audit and architecture** (this document)
- [x] **P2 Security foundation** (2a and 2b, see the progress log): RBAC (8 built-in roles, custom roles, permission checks), Super Admin bootstrap, admin TOTP MFA with recovery codes, session list and revoke (admin and user), login history, append-only audit and security logs, re-auth for destructive actions.
- [x] **P3 Admin core** (3a and 3b, see the progress log): admin shell (sidebar, dark/light, responsive), user directory with search and paging, suspensions and timed bans with reasons, appeals, session revocation, moderation queue (reports, spam, corrections, copyright), support tickets (New → Under Review → In Progress → Resolved → Closed).
- [x] **P4 Profile core:** `/profile` dashboard, personal information (avatar and cover once storage exists), preferences and personalisation, privacy settings, saved items server-side with guest migration, collections with read-only share links. *(P4a: identity, preferences, privacy, public page. P4b: saved items, collections, share links.)*
- [ ] **P5 Trips and passport:** Trip Planner saved server-side, My Trips (states, day plans, expenses vs estimates, duplicate, archive, PDF and calendar export, read-only sharing), personal calendar and notes, Travel Passport (want to visit / visited / exploring, India map colours, original stamp designs, progress). *(P5a done: trips. P5b next: calendar, notes and the passport.)*
- [ ] **P6 Analytics:** consent-aware beacon, collection API, aggregates, admin dashboards (traffic, geography, devices, pages, features, search including zero-result searches, journeys), CSV export.
- [ ] **P7 Memories and achievements:** memories (private by default, photos, tags, timeline and gallery, scrapbook PDF), quiz history and achievements, My Contributions.
- [ ] **P8 Monitoring:** application and security log centre, health (uptime check, error rate, Core Web Vitals from the beacon), SEO centre (metadata, alt text, broken links, redirects), notifications (in-app; email once a domain exists), backups (daily export, history, verify, guarded restore).
- [ ] **P9 Advanced:** CMS (versioned layer, workflow, scheduling, preview), media manager, improvement engine (evidence-based recommendations with review states), Yatri administration (feedback, unanswered questions, usage), settings and feature flags, maintenance mode.
- [ ] **P10 Integration and final testing:** cross-module flows, permissions matrix tests, cross-user access tests, accessibility, performance, documentation (API, permissions, deployment, maintenance).

## 5. Owner decisions (2026-11-17)

| Question | Answer | Effect on the plan |
|---|---|---|
| File storage for uploads | **No uploads: a set of original illustrated avatars to choose from** | No file storage. Avatars and profile covers are picked from a built-in gallery of Tour India illustrations. Memories are text, tags, places and dates; photos can link to the site's own gallery images. The media manager covers the site's existing assets (credits, assignment, fallbacks) rather than uploads. Backups export to a downloadable file instead of file storage. |
| Analytics | **Own, cookieless** | First-party beacon and `/api/collect`, consent-gated, no IP or fingerprint stored, raw events 90 days, aggregates kept. |
| Email domain | **Not yet: in-app only** | Notifications are in-app; email stays owner-only (admin codes, alerts to the owner) until a domain is verified. |
| CMS content | **Repo baseline plus a database layer** | Decision 4 above. |

## 6. Progress log

### P2a: roles, admin MFA and tamper-evident logs (2026-11-17)

- **Roles and permissions** (`features/admin/permissions.ts`, `rbac.ts`): 22 permissions; 8 built-in roles (Super Admin, Admin, Content Manager, Editor, Moderator, Analyst, Support Manager, Developer); custom roles in `admin_roles`; role holders in `admin_members`. Addresses in `ADMIN_EMAILS` are always Super Admins (bootstrap) and can't be demoted from the admin screens.
- **One guard** (`features/admin/guard.ts`): `requireAdminPage(permission?)` and `requireAdminApi(request, permission, { fresh })`. Checks session → admin role → MFA done in this session → permission, all on the server. Denials go to the security log. `fresh` actions (blocking accounts now; deletions, role changes and restores later) need an authenticator code from the last 15 minutes; the admin screens ask for one and retry.
- **Admin MFA** (`lib/auth/totp.ts`, `features/admin/mfa.ts`, `/admin/mfa`, `/api/admin/mfa`): authenticator-app codes (RFC 6238, no new dependency) after the emailed code, for every admin role. Secrets encrypted with a key derived from `AUTH_SECRET`; each code accepted once; 10 single-use recovery codes stored as HMACs; 8 tries per 15 minutes per admin.
- **Tamper-evident logs** (`lib/security/audit.ts`): `audit_log` and the new `security_events` are append-only; each record has a sequence number and the hash of the one before, and `verifyChain` reports edited records and gaps. Sign-ins (success and failure), MFA events and denied admin requests are logged; failed sign-ins are logged by a keyed hash, never the address.
- **Sessions** now record a public id, a short device label ("Chrome on Android"), country and last-active time (for 2b), and when MFA was completed.
- **Database rules** (`scripts/db-setup.mjs`): new rules for `audit_log` (the old rules would have rejected chained records), `security_events`, `admin_roles`, `admin_members`, and new session fields. Applied automatically before each production build.
- **Tests:** 371 pass, including RFC 6238 vectors, MFA enforcement, code replay, single-use recovery codes, role permissions, stale-MFA re-auth, chain tampering and "no secrets in logs". Walked through the full sign-in in the browser.

**Owner notes**
- The next admin sign-in asks you to set up an authenticator app and save 10 recovery codes. Keep them somewhere safe.
- If you lose both your phone and the recovery codes: in MongoDB Atlas, open `tour_india` → `admin_members`, find your record and delete its `mfa` field; the next sign-in sets up a new authenticator.
- Changing `AUTH_SECRET` makes every stored authenticator unreadable, so every admin would have to set theirs up again (clear their `mfa` field as above). Sessions are not affected.

### P2b: sessions, sign-in history and the admin team (2026-11-17)

- **Your devices** (`features/auth/sessions.ts`, `/api/account/sessions`, account page): every signed-in device with a readable label, country, sign-in and last-active times; sign out one device or all others. Every query is filtered by the owner's id.
- **Recent sign-ins:** the last 15 sign-ins from the security log, including failed codes (matched by the keyed hash of the address, which is all that's logged).
- **Team and roles** (`features/admin/team.ts`, `/api/admin/team`, `/admin/team`): list admins with roles, MFA status and last sign-in; add an admin (they need an account first), change or remove roles, create, edit and delete custom roles. Rules: nobody changes their own roles; only Super Admins grant Super Admin or give a role team, role or restore powers; the `ADMIN_EMAILS` owner can't be demoted; removing all roles ends that person's admin sessions at once; a role in use can't be deleted. Every change needs a fresh authenticator code and is audited with before and after values.
- **Admin sign-out of a user everywhere** (`users.sessions`, fresh code), for lost phones or compromised accounts.
- **Admin navigation** that shows only the areas a role allows.
- The in-memory test store now matches array fields like MongoDB does.
- **Tests:** 381 pass (10 new for sessions and team rules). Walked through the team page (custom role created) and the account devices and history in the browser.

### P3a: admin shell, user directory, restrictions and appeals (2026-11-17)

- **Admin shell** (`components/admin/AdminShell.tsx`): sidebar on wide screens, a scrolling row on phones, only the sections the admin's roles allow; uses the site theme, so dark and light both work.
- **User directory** (`/admin/users`, `users.view`): search by email prefix or name (input escaped), filter by status, 25 a page, server-side; shows status, join and sign-in dates, sign-in method and admin roles.
- **User record** (`/admin/users/[id]`): profile basics, admin roles, live sessions, restriction and appeal history, recent comments, and the admin actions taken on the account. Each view is written to the audit log (`user.view`).
- **Restrictions** (`features/admin/restrictions.ts`, `/api/admin/users`, `users.ban` plus a fresh code): suspensions of 1 to 90 days, timed bans up to 10 years or permanent bans, each with a reason category, an admin note and an optional evidence reference. Restricting signs the account out everywhere. Owners can't be restricted; only Super Admins can restrict another admin; one active restriction at a time. Timed restrictions lift themselves at the next sign-in after they end (`liftedBy: "expiry"`); admins can lift early with a note. "Block author" in moderation now creates a permanent spam ban through the same path.
- **Appeals** (`/appeal`, `/api/appeal`): one appeal per restriction, rate-limited, with the same reply whether or not the address exists. The admin who set a restriction can't decide its appeal unless they're a Super Admin. Overturning restores the account. Restricted email sign-ins and blocked Google sign-ins now point to the appeal page.
- **Database:** new `user_restrictions` collection and rules; `restrictedUntil` on users. Deleting an account keeps its restriction records but replaces the address.
- **Tests:** 390 pass (9 new: suspension sign-out and sign-in refusal, expiry restore, permanent ban and lift, self/owner/admin/duplicate rules, validation, appeals with identical replies and one-per-restriction, appeal-decider rule, directory search with escaping and paging, audited record views). Walked through in the browser: directory, a 3-day suspension through the form, an appeal arriving, the open-appeals panel and the public appeal page.

### P3b: support tickets and the moderation queue (2026-11-17)

- **Support tickets** (`features/support`, `/admin/support`, `/admin/support/[reference]`, `/api/admin/support`, `support.manage`): every contact message is a ticket with a reference like `S-7KQ2-M9XD`, a category (the contact form now asks "What's it about?"), a priority (privacy, copyright and accessibility start high), a status (New → Under review → In progress → Resolved → Closed), an assignee (only admins with the support permission) and internal notes. Lists filter by status, category and "assigned to me", 25 a page, urgent first. Changes are audited with before and after values; opening a ticket is audited. Replies go by email from the admin's own mail app until a domain is set up.
- **Migration:** `db-setup` gives older contact messages a reference, the general category and normal priority, and turns "read" into "under review". Rules updated for the new fields.
- **Moderation queue** (`/admin/queue`, `moderation.manage`): one overview of everything waiting, grouped as inappropriate comments, spam and malicious links, held by the filter, incorrect information (wrong-info reports, suggested edits, correction tickets), privacy, copyright, accessibility and appeals, each with examples and a link to where the decision is made; reports on comments already removed don't count. Recent decisions come from the audit log.
- **Sidebar:** Moderation queue, Comments and edits, Support tickets.
- **Tests:** 396 pass (6 new: contact categories, references and starting priority, the ticket workflow with audit, assignment and role limits, listing order and counts, queue grouping). Form browser tests pass. Walked through: the contact form's new question, the queue, the support page and the shell at phone width.

### P4a: profile identity, preferences, privacy and the public page (2026-11-17)

- **`/profile`** replaces `/account` (which now redirects, keeping the first-sign-in `welcome` and `next` hand-off). Five sections: Overview (cover, avatar, a "finish setting up" checklist, what's saved on this device, planning requests), Details (the basics plus username, avatar, cover, tagline, about, city, website), Preferences, Privacy and Security (sessions, sign-in history, sign out, delete account). The header menu says "Your profile".
- **Avatars:** 16 original illustrated travellers drawn in code (`components/profile/Avatar.tsx`) across five skin tones, eight hair styles and eight Indian landscapes. Nothing is uploaded or stored. Everyone gets a stable default until they pick one. **Covers** reuse the site's 13 licensed hero photos, credited under the header.
- **Usernames:** 3 to 20 lower-case letters, numbers or underscores; staff-like and site names are reserved; unique (index in MongoDB, checked as you type). Tagline, about and city go through the comment filter (no phone numbers, emails, links or slurs; swearing is masked). Websites must be `https://`.
- **Preferences:** regions, seasons, trip length, budget, transport, food and access needs, all optional and never shown publicly, with a switch that stops them being used. Not collected: phone, date of birth, gender — nothing on the site needs them.
- **Privacy:** pages start private. Private, members-only or public; per-field choices for what shows; an opt-in to link comments (with avatar) to the page while it's public. `/u/[username]` shows only the chosen fields, never the email, and looks identical to a missing user when private, members-only to a signed-out visitor, or the account is suspended or banned. Profile pages are `noindex`.
- **Moderation:** the admin user record shows the public profile; `moderation.manage` can clear its text and make it private (`/api/admin/profile`, audited as `profile.reset` with a note). Deleting an account deletes the profile and frees the username.
- **Data:** new `profiles` collection (one per user, validator and partial unique index on `username`) created by `db-setup` on the next production deploy.
- **Tests:** 407 pass (11 new: username rules, sign-in required, defaults and saving, text filtering and strict input, unique usernames, visibility needing a username, field-level privacy, members-only, suspended accounts, comment links, deletion, moderator reset and role limits). Walked through locally on the in-memory store: saving details, the username check, making the page public, the public page signed in and out, a linked comment, the `/account` redirect, and every page at phone width with no sideways scrolling.

### P4b: saved places, collections and share links (2026-11-17)

- **Account lists:** saved places (the heart buttons) and passport stamps are kept in the account once someone signs in (`saved_lists`, one per user; `/api/saved`). The browser keeps a copy so hearts respond instantly; each change is sent to the server and undone in the browser if it's refused. Only real guides and real states are accepted; up to 500 places.
- **Moving a guest's lists:** if someone saved things before signing in, a prompt asks whether to add them to the account or clear them from this browser, so a shared computer never mixes two people's lists without asking. Signing out clears the account's copy from the browser; a guest's own lists are left alone.
- **Collections** on `/saved` (signed in): name, optional note, places chosen from what's saved; up to 30 collections of 100 places. Names and notes go through the comment filter.
- **Share links:** `/c/<16-character id>` shows a collection read-only, with its name, note and place cards, never who made it; `noindex`. Turning sharing off kills the link, and turning it back on makes a new address, so an old link never comes back. Links stop working while the owner is suspended or banned, and everything goes when the account is deleted.
- **Overview** shows saved places, collections and stamps from the account; trip plans and recently viewed still stay in the browser (noted on the page).
- **Data:** new `saved_lists` and `collections` collections (validators, partial unique index on `shareId`) created by `db-setup` on the next production deploy. Fixed the in-memory test store so `$unset` really removes fields on update.
- **Tests:** 418 pass (11 new: sign-in required, ordering and removal, unknown places and states refused, guest merge without duplicates, separate lists per person, collection create/edit/delete, text filtering, no access to others' collections, the collection cap, share links (fresh address, revoke, contents), suspension and account deletion). Walked through locally on the in-memory store: guest hearts, the sign-in prompt and merge, removing a heart while signed in, a passport stamp, creating, filling and sharing a collection, the link signed out, turning it off (404), sign-out clearing the browser copy, signing back in, overview counts, and phone width.

### P5a: trips in the account (2026-11-18)

- **What's stored:** a trip is its planner settings plus the order of items in each day (`trips`, `/api/trips`). Places, activities, food, stays and costs are rebuilt from the guide every time, so a saved trip can't carry anyone's words except its name and its owner's expense list. Settings are checked with the same schema as shared links (now also covering pace, diet and access options, which shared links used to drop), and a trip that can't be rebuilt is refused. Up to 50 trips.
- **Planner:** signed in, "Save trip" saves to the account and links to the trip; opened from My trips (`/planner?trip=<id>`), it becomes "Save changes" and updates that trip. Signed out, it still saves in the browser.
- **Moving a guest's trips:** trips saved in this browser join the sign-in prompt alongside places and stamps; adding them moves them to the account (five per request; ones that can't be rebuilt are skipped), and either choice clears them from the browser.
- **My trips** (`/profile/trips`, new in the profile menu): active trips, archived ones below. **A trip** (`/profile/trips/<id>`): day by day, the warnings, the estimate, and spending against the estimate with who-owes-whom (saved a moment after each change). Actions: edit in the planner, print or save as PDF, add to calendar (.ics, when dates are set), rename, duplicate (without expenses or link), archive or restore, delete (asks twice).
- **Share links:** `/t/<16-character id>` shows the plan and estimate only, never expenses, the people on them or who made it; `noindex`; off kills the link, on again makes a new address; stops while the owner is restricted; deleted with the account.
- **Elsewhere:** the overview counts account trips; the Saved page points signed-in people to My trips; the privacy page and account deletion mention trips and spending. Routes can now opt into a larger request size; trips allow 64 KB (long expense lists), everything else keeps 16 KB.
- **Data:** new `trips` collection (validator, partial unique index on `shareId`) created by `db-setup` on the next production deploy.
- **Tests:** 430 pass (12 new: sign-in required, saving and rebuilding identically, a 45-day trip and a long expense list, refusing unbuildable plans and ignoring words in the layout, rename/archive/restore/duplicate/delete, updating from the planner, expense checks, the 50-trip cap, moving guest trips, no access to others' trips, share links (no expenses or names, revoke, new address, restricted owner), deletion with the account). Walked through locally on the in-memory store: a guest trip from the planner, the sign-in prompt moving it, the trip page, an expense, the share link signed out (no expense or name in it), editing in the planner and saving changes, and phone width.

