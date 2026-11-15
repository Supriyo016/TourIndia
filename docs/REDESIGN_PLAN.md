# Redesign plan (v2)

**Started:** 2026-11-16
**Branch:** `rebuild/nextjs`, with each phase committed separately
**Resume rule:** finish one phase, run its checks, commit it, then tick it here. After any interruption, restart at the first unticked phase.

## Goal

Turn the live Next.js site into a full tourism platform with three parts:

- A 3D, animated interface that stays fast on phones
- Accounts, with community features moderated by an admin
- Deeper planning, booking, culture and calendar tools

## What can't be done as asked

| Request | What is possible instead |
|---|---|
| Put the site at the top of Google | No one can guarantee a ranking. We can do the technical SEO properly: metadata, JSON-LD, sitemap, speed, internal links and original content. Ranking then depends on Google and on time. |
| Add the site to Google Search Console | Search Console needs your Google account. I add the verification hook (`GOOGLE_SITE_VERIFICATION`) and the sitemap. You click "Verify" and submit the sitemap yourself. |
| Content "like a 4-year-old site" | I won't fake the site's age or history. I can add depth instead: encyclopedia entries, more guides and calendar detail, all from sources. |
| Video always plays with music | Browsers block autoplay with sound. The video will autoplay muted, with a large one-tap "Sound on" button that is remembered once you allow it. |
| Google Maps | The embed and the "open in Google Maps" links need no key. Live directions and Places need a Google Maps API key, which comes with billing. |
| Continue with Google, email OTP | Code can be written now. To run, it needs a Google OAuth client and an email-sending account, both created by you. |

## Phases

Each phase has a test gate: typecheck, lint, unit tests, Playwright and a build. A phase is ticked only after its gate passes.

- [x] **P0. Clean-up and structure.** Done 2026-11-16: 7 unused exports removed; no unused dependencies. Remove dead code. Each feature lives in `src/features/<name>` (logic) and `src/components/<name>` (UI). Write the design system to `docs/DESIGN.md`.
- [x] **P1. Shell.** Done 2026-11-16.
  - Navigation: 7 main items plus a "More" dropdown, glassy and transparent over the hero.
  - A top route-loading progress bar.
  - Light, dark and system themes.
  - Date, time, next holiday, calendar and notes in the nav panel.
  - Custom scrollbars: page, panels, horizontal rails, and a reading-progress bar.
- [x] **P2. Hero and 3D.** Done 2026-11-16: taglines per slide, lower-right controls with timer ring, Ken Burns zoom, light motes, three.js globe, CSS 3D tilt on cards.
  - The slider tagline changes with each slide.
  - Advanced controls at the lower right: progress ring, thumbnails, keyboard and swipe.
  - One lazy-loaded WebGL scene, plus CSS 3D tilt and parallax elsewhere.
  - Motion turns off under reduced motion and on low-end devices.
- [x] **P3. Video tour.** Done 2026-11-16.
  - Takes one third of the screen height, centred, and autoplays muted with sound on tap.
  - 360p, 480p and 720p renditions, switched automatically from the Network Information API and buffering. A manual quality menu as well.
- [x] **P4. Data and backend.** Done 2026-11-16.
  - Schemas for users, sessions, OTP codes, comments, reactions, ratings, edit proposals, the audit log and bookings.
  - zod validation, indexes and TTLs.
  - Repository layer and an API with rate limits, CSRF and same-origin checks.
- [x] **P5. Auth.** Done 2026-11-16.
  - Glass sign-in modal: email plus 6-digit OTP (hashed, 10-minute expiry, 5 tries) and Google OAuth.
  - Profile completion: name, home state, travel interests and consent. Nothing beyond what the site uses.
  - Admin login with role check and an extra OTP.
- [x] **P6. Community.** Done 2026-11-16.
  - Each place gets an encyclopedia page, with comments, love reactions, ratings, shares and "help others" answers.
  - Proposed edits go to an admin queue. Diff, approve and reject, all logged.
  - A word filter covering abuse, slurs and religious insults, in English and romanised Hindi, plus a report button.
- [x] **P7. Planner.** Done 2026-11-16.
  - Customisation: budget, pace, travel style, transport, accessibility, diet, kids and seniors.
  - Route analysis: distances, travel time, season and festival clashes, holiday crowds, budget split, warnings.
  - Google Maps embed and links, and links to official sites.
- [ ] **P8. Booking and culture.**
  - Booking: an enquiry flow with steps, date and guest pickers, saved drafts and status tracking. No real payments.
  - Culture: filters, a timeline, regional maps, and the community features from P6.
- [ ] **P9. Calendar.**
  - All national holidays, plus major festivals of every religion and region, nature events (monsoon, bird migration, blooms) and fairs, each with details and a source.
  - Month, list and year views, filters, and .ics export.
- [ ] **P10. Assistant.** Yatri is upgraded on the model the owner chooses. It answers about this site only, never disparages other sites, and can add web results if a search key is supplied.
- [ ] **P11. SEO and quality.**
  - JSON-LD for TouristDestination, Event, Article and BreadcrumbList.
  - Open Graph images, a sitemap split by section, and Search Console verification.
  - Lighthouse and axe on key pages, and fixes to reach the targets.
- [ ] **P12. Security review.** An independent review covering OWASP Top 10, auth, OTP brute force, IDOR, XSS, CSRF, injection, uploads, rate limits and headers. All findings fixed.
- [ ] **P13. Ship.**
  - Commit and push `rebuild/nextjs` to GitHub.
  - Deploy to Vercel, run live checks, and update the docs.

## Owner decisions (2026-11-16)

1. **AI model:** a small in-browser model (WebLLM). It is opt-in: visitors tap "Load AI model". It needs WebGPU and is about a 300 to 400 MB one-time download. Guide mode stays the default and is the fallback. P10 adds the model host to the CSP.
2. **Auth:** built now. In development the OTP prints to the server log. Production switches on when `AUTH_GOOGLE_ID`/`SECRET` and `RESEND_API_KEY` are added to Vercel.
3. **3D:** one lazy-loaded three.js hero scene, CSS 3D on other pages, reduced automatically on slow devices.
4. **Pace:** stop for the owner's review after P0 to P3, before the backend and community phases.

Later decisions are recorded in `DECISIONS.md`.
