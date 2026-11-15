# Project status

**Last updated:** 2026-11-16
**Phase:** Redesign v2 complete (see `REDESIGN_PLAN.md`). Accounts and community are built and tested, and switch on when the owner adds the settings below.
**Production:** https://tour-india-pi.vercel.app
**Branch:** `rebuild/nextjs`. `master` and the GitHub Pages site are untouched.

## Redesign v2 (2026-11-16)

- **Shell:** 7 main items plus "More", a glass header over the slider with the live IST clock inside it, a route loading bar, a Light/Dark/System menu, and themed scrollbars.
- **Hero and 3D:** taglines that change with each slide, lower-right controls with a timer ring, a three.js globe of every guide, and 3D tilt on cards.
- **Video:** autoplays in view at a third of the screen height, with 720p, 480p and 360p chosen from the network and a manual quality menu.
- **Accounts:** email code sign-in, Google sign-in, profiles, account deletion, and an admin area with an audit log.
- **Community:** encyclopedia entries with suggested edits that need admin approval; loves, ratings, sharing, viewpoints, tips, questions, replies and reports; and moderation that respects every faith.
- **Planner:** pace, diet and traveller options; a plan check out of 100; Google Maps routes; useful official links.
- **Booking and culture:** planning requests with references, art form pages, the festival year, and culture by region.
- **Calendar:** holidays, confirmed festival dates, observances, state days and nature seasons, with filters, a list view and .ics export.
- **Yatri:** an optional free on-device AI (WebLLM) grounded in the guides, and a Google search link.
- **SEO:** Search Console verification hook, Open Graph image, Organization data, sitemap dates and priorities.
- **Security:** an independent review found 8 issues (none critical); all are fixed and tested.

**Not verified:**
- Email delivery and Google sign-in, because the keys don't exist yet. Development uses logged codes; Google sign-in is covered by unit tests of its checks only.
- The on-device model was tested on one machine with WebGPU.

## Next exact action

1. Add the settings in `setup.md` ("Switching on accounts…") to Vercel: MongoDB, `AUTH_SECRET`, Resend, Google OAuth, `ADMIN_EMAILS`, `GOOGLE_SITE_VERIFICATION`
2. Run `npm run db:setup` against the new database
3. Verify the site in Google Search Console and submit the sitemap

## Needs the owner

| # | Item | Why |
|---|---|---|
| 1 | **MongoDB Atlas account** | Contact, newsletter and story forms return "not available" until it exists. Accounts can't be created on your behalf |
| 2 | **Commit and push** | Needed for automatic deploys and GitHub Actions. Connect only after setting the production branch to `rebuild/nextjs`; otherwise Vercel will treat `master`, the old static site, as production |
| 3 | **Map data licence** | Boundaries come from `udit-001/india-maps-data`, which states no licence. Accept the risk, or supply a licensed or official dataset and run `npm run data:map` |
| 4 | **India's borders on the map** | Publishing maps of India carries legal sensitivities. Check against Survey of India. The site captions the map as non-authoritative |
| 5 | **Other people on the old About page** | Removed from the new site. They could reasonably expect to be told. Their names and photos remain on the old GitHub Pages site and in Git history |
| 6 | **Contact details and LinkedIn** | Empty in `src/config/site.ts` until you supply real ones |
| 7 | **Personal social accounts** | X, Instagram, Facebook and YouTube come from your GitHub profile. Confirm you want them on the brand site |
| 8 | **Legal pages** | Drafted, not reviewed by a lawyer |
| 9 | **Custom domain** | The site uses a `vercel.app` address until you add one |
| 10 | **Old site** | Still online. Redirect or retire it when you are happy with the new one |

## Content verification

`FACT_CHECK.md` lists each item checked, with its source. In the 2026-11-09 pass: 36 rows confirmed, 10 corrected, 25 could not be confirmed. Those 25 are worded cautiously and point readers to the relevant authority.

**A person should still review:** the December 2024 foreign-visitor permit change for Manipur and Nagaland; seasonal closures at Kanha, Panna, Kaziranga, Eravikulam and the Valley of Flowers; the Rohtang permit; temple entry rules at Puri, Lingaraj and Madurai; and security conditions in Manipur, Bastar and Kashmir. No readable official source was found for these. Most other guide text, including history and descriptions, has not been checked line by line.

## Task status

**Completed:** audit, research, design system, 36 state profiles, 52 destination guides, map, search, planner, festivals with official 2027 dates where published, food, heritage, arts, services, bookings, gallery with photos and videos, stories, about, contact, legal pages, forms API, security hardening, independent review, deployment.

**In progress:** none.

**Pending:** the owner items above, and `IMPLEMENTATION_ROADMAP.md`.

**Modified files:** the whole application is new on this branch. The original site moved unchanged to `legacy/`.

**Known bugs:** see `BUG_TRACKER.md`.

**Key decisions:** see `DECISIONS.md`.

## Test results (final code)

| Check | Result |
|---|---|
| Dependencies install | Passed |
| TypeScript and ESLint | Passed, 0 problems |
| Production build | Passed |
| Unit and API tests | 109 of 109 passed |
| API tests on real MongoDB 8.0.4, with validators and indexes | 32 of 32 passed |
| Browser tests, local (Playwright, Edge) | 55 of 56 on the final full run. The other, a navigation timeout under heavy machine load, then passed 4 of 4 |
| Production: all 187 sitemap URLs, internal links, redirects, API routes | All passed |
| Production: browser flows (planner, gallery, forms, navigation, headers) | 15 of 16 passed; the gallery test hit a local connection reset, then passed 2 of 2 |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Independent code and security review | 15 findings, all addressed |

Browser tests cover 10 widths from 320 to 1920px, WCAG 2.1 AA (axe) on 24 pages in both themes, reduced motion, no-JavaScript and form failure paths. The width and axe suites ran locally rather than against production, to stay within image-optimisation limits on the free plan.

### Lighthouse on production (simulated mobile)

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| Home | 72 | 100 | 100 | 100 | 3.3 s | 0 |
| Destination guide | 78 | 100 | 100 | 100 | 3.1 s | 0 |
| Map | 87 | 100 | 100 | 100 | 2.0 s | 0 |
| Planner | 72 | 100 | 96 | 100 | 2.8 s | 0 |

Performance is acceptable but not strong. The main cost is JavaScript start-up on slow phones; LCP is above the 2.5-second target on three of these pages. Measured from one machine on an unstable connection, so treat these as indicative.

## Not tested or not done

- MongoDB Atlas itself, since no hosted database exists yet
- Manual screen-reader testing; real phones; Safari and Firefox
- Competitor research is partial: 7 of the 11 named sites blocked or timed out
- Five subjects have no licensed photo and show a branded panel: West Bengal, Goa Carnival, Losoong, filter coffee and Lakshadweep tuna
- Left out deliberately: accounts, live feeds, real booking, and a newsletter sender. Sign-ups would be stored, but nothing sends email yet

## Latest successful build

2026-11-09, Next.js 16.4.5, deployed to Vercel production.
