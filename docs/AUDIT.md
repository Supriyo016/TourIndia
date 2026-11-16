# Audit of the original site

Audited 2026-11-08 from the `master` branch, now preserved unchanged under `legacy/` on the rebuild branch.

## What existed

Three HTML pages (`index`, `AboutUs`, `ContactUs`), one 1,300-line stylesheet, one JavaScript file, 35 JPGs, 2 PNGs and a 40 MB video. No build step. Deployed on GitHub Pages.

## Findings, by severity

| Severity | Finding | Where | Resolution |
|---|---|---|---|
| Critical | Tour prices with no booking behind them (₹2000 to ₹10000 on gallery cards) and "12 tours available" | `index.html` | Removed. Booking page now links to official sites and disclaims agency status |
| Critical | Invented statistics: "100 complete tours", "900+ cultural destinations" | `index.html` | Removed |
| Critical | Fake contact details: `+123-68395-78`, `abc@gmail.com`, `+91 01234-56789`, `tourindia@gnail.com`, unregistered `tourindia.com` | Footer, `ContactUs.html` | Removed. Contact fields are empty in `src/config/site.ts` until the owner supplies real ones |
| Critical | A street address and a map embed pointing at a college | `ContactUs.html` | Removed |
| High | Names and photographs of five people other than the owner | `AboutUs.html`, `assets/img/teamMembers/` | Not carried over. Files remain in Git history and in `legacy/` |
| High | Lorem ipsum in all six service cards | `index.html` | Replaced with real content |
| High | Forms that do nothing (`action=""`) | Feedback, contact | Replaced with validated forms backed by an API |
| High | `main.js` throws on load: it references `#login-btn`, which does not exist | `assets/js/main.js` | Not carried over |
| High | Malformed doctype (`<!<!DOCTYPE html>`), and `name="name"` repeated on every field | `ContactUs.html` | Replaced |
| High | Broken links: `#booking`, `#Book`, `#packages`, `#Services`, `#Gallery`, `#`, an empty "More" link; Discover and Services anchors dead on other pages | All pages | Replaced; broken-link test added |
| High | No mobile navigation; hard-coded margins such as `margin-left: 230px` | CSS | Rebuilt responsively |
| Medium | Backslash asset paths (`assets\img\...`), absolute links to github.io | All pages | Replaced |
| Medium | Misspellings: "Incerdible", "Kerela", "Safty", "Affortable", "Send Massage", "Linkdin", "accross", "Contcat" | All pages | Replaced |
| Medium | All images have empty `alt` | All pages | Alt text on every image |
| Medium | 40 MB autoplaying video; `footer_image1.jpg` is 2.3 MB and unused | `assets/` | Not carried over |
| Medium | Social icons are not links | Footer | Real links from central config |
| Medium | Slideshow keyframes define 25% twice, so slide 2 never shows | CSS | Replaced with an accessible slider |
| Low | Unused: `discover4`, `experience02`, `experience1/2`, `home1/2/4/5`, `Victoria`, `arrow-down-dark`, `footer_image1/2`, Dark theme CSS with no toggle | `assets/` | Kept in `legacy/`; not used |
| Low | "Incredible India" is the Government of India's campaign name, used in the logo and hero | Logo PNG, hero | New hero avoids it |

## Design identity, kept

- Two-tone wordmark in Rubik Wet Paint, with "Tour" in gold
- Deep peacock teal, hue 190, `#14505C`: now the primary brand colour
- Magenta header gradient: now a thin hairline accent, and `--rani`
- "Explore our India" hero with a search-led call to action
- Animated footer band: now a train crossing the footer

## Reuse decisions

No original photograph or video is reused. Their source and licence can't be established; several look like stock or web images. All photography is now openly licensed from Wikimedia Commons, with credits at `/credits`. If the owner can confirm rights to any legacy image, it can be added back.

## Ownership and history evidence

From the public GitHub API, 2026-11-08:

| Fact | Evidence | Status |
|---|---|---|
| Repository created 2022-05-27 | `created_at` | Verified |
| 12 commits, all by Supriyo Sarkar, 2022-05-27 to 2023-07-05 | Commit log | Verified |
| No commits between 2023-07-05 and this rebuild | Commit log | Verified |
| Date the site first went public | Not recorded anywhere | **Unknown** |
| "3.5+ years" of development or operation | Roughly 13 months of intermittent commits, then a gap of over three years | **Not supported, so not claimed** |

The site publishes the dated commit milestones and makes no claim about years of operation, visitors or customers.

## Social accounts

GitHub was supplied by the owner. X, Instagram, Facebook and YouTube come from the owner's public GitHub profile. LinkedIn is not listed there, so it is unlinked and marked for owner confirmation in `src/config/site.ts`.

## Licences on the original project

The repository has no licence file. No third-party notices had to be preserved beyond Font Awesome and Google Fonts loaded from CDNs, neither of which the rebuild loads. New third-party credits are at `/credits`.
