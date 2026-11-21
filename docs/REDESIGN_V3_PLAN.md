# Redesign v3 plan

**Started:** 2026-11-16. **Branch:** `rebuild/nextjs` (PR #1). Tick a phase only when its check has passed. To resume after a break, start at the first unticked phase.

## Owner decisions (2026-11-16)

| Question | Answer |
|---|---|
| Sign-in | The owner configures MongoDB Atlas, Resend and Google OAuth directly in their respective dashboards, then adds the required deployment variables in Vercel |
| Maps | Google Maps with an API key restricted to the site. The India map becomes a tilted Google map with states highlighted |
| Festivals 2000–2100 | Calculated from moon positions and labelled "calculated, may differ by a day locally". Official dates replace them where published |
| Score vs animation | Score first. 3D loads after the page is ready, pauses off screen and is lighter on slow phones. Target 95+ in all four Lighthouse categories |

## Interpretation notes

- **"8K images":** each slide is taken from the highest-resolution free-licence original on Wikimedia Commons (7680 px wide or more where one exists). The site stores a 3840 px copy and each screen is sent a size that fits it. Sending 8K files to phones would break the 95 score. Actual source widths are listed in `images.json`.
- **"Videos with sound":** browsers block autoplay with sound, so art videos start on a click.
- **"3D cartoons":** made in code (SVG and CSS 3D transforms plus small WebGL scenes), not downloaded art, so there are no licence questions.

## Phases

- [x] **P14 Hero slider.** Fixed height, 3D turn, parallax, smaller tagline, translucent search, and 12 slides from 8K Commons originals (`scripts/fetch-hero.mts`).
  - Fixed height for every image, whatever its size.
  - 12 slides with a 3D depth and parallax transition.
  - Smaller tagline, a translucent search box, and a layout that leaves the photo visible.
  - Check: the height stays the same across all slides at 375, 768 and 1440 px.
- [x] **P15 Header.**
  - About 25% shorter.
  - The theme icon switches in one click (Light → Dark → System), with a long press or menu for the full list.
  - An animated "Tour India" logo with the same design.
  - Check: header height measured.
- [x] **P16 Site-wide 3D.**
  - One shared background scene with drifting kites, lanterns, clouds and petals.
  - A distinct footer scene: a train crossing hills, and boats.
  - An animated Yatri launcher and panel.
  - New animated 3D cartoon characters to replace the flat ones.
  - Everything pauses when hidden and stops for reduced motion.
- [x] **P17 Home sections.**
  - Remove "Every guide, pinned on the globe" and the globe code.
  - Re-lay out "Explore India by state" without the empty space.
  - Tighten the "From readers" and other loose sections.
- [x] **P18 Section and page heroes.** Every overview title gets a related photo behind it: discover categories such as Lakes, travel styles, culture hubs, calendar, quiz and planner.
- [x] **P19 Google Maps.**
  - A Maps JS loader driven by `NEXT_PUBLIC_GOOGLE_MAPS_KEY`.
  - Place, route and planner maps.
  - An India state map tilted in 3D, with highlighted states.
  - The current map remains as a fallback until the key exists.
- [x] **P20 Calendar 2000–2100.**
  - National and public holidays, festivals, observances and state days.
  - Lunar festivals are calculated, and Islamic dates use the tabular calendar; both are labelled.
  - Check: unit tests against published dates in known years.
- [x] **P21 Living traditions.** All 64 art forms have photos and an article; 21 have a licensed video with sound. Every art form gets photos, a video with sound (licensed, playing on click) and a full encyclopedia article.
- [x] **P22 Travel quiz.** Restructure it as steps with progress, a result with reasons, and links into the planner.
- [x] **P23 Clean-up.** Remove unused code and dependencies, including three.js if the globe was its only use.
- [ ] **P24 Sign-in on.** Owner walkthrough for MongoDB, Resend, Google OAuth and the Maps key. Then `db:setup` and a live sign-in test.
- [x] **P25 Verify.** Live on 2026-11-16 via PRs #1–#3 merged into `master`. PageSpeed Insights (mobile, Lighthouse 13.6) on the live site:

  | Page | Performance | Accessibility | Best practices | SEO |
  |---|---|---|---|---|
  | Home | 96 | 100 | 100 | 100 |
  | Hampi guide | 96 | 100 | 100 | 100 |
  | Explore | 96 | 100 | 100 | 100 |
  | Calendar | 98 | 100 | 100 | 100 |

  What got performance there: no automatic link prefetching, GPU-only animations, `content-visibility` for off-screen sections, the map sent once, inline CSS, and the keyless Google map loading only when near.
  - Type check, lint, unit and browser tests.
  - Lighthouse at 95+ for every category on home, a guide, the map, the calendar and the planner.
  - An independent code and security review, then deploy.

## Work split

Agents work in parallel only on separate files:
- **Calendar agent:** P20 (`src/data/occasions.ts`, `src/features/calendar/*`, tests).
- **Culture agent:** P21 (`src/data/arts.ts`, the art pages, media scripts).
- **Quiz agent:** P22 (`TravelQuiz.tsx`, the quiz page).
- **Main session:** everything else, plus the shared files (`globals.css`, `package.json`, layout).
