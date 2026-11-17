# Redesign v4 plan

**Started:** 2026-11-17. **Branch:** `rebuild/nextjs`, shipped to `master` through pull requests. Tick a phase only when its check has passed; to resume, start at the first unticked phase.

## Owner decisions (2026-11-17)

| Question | Answer |
|---|---|
| Footer landmark | Neon line-art Kolkata skyline (Howrah Bridge, Dakshineswar, Victoria Memorial, St Paul's, Vidyasagar Setu) with moving city life, per the owner's reference image |
| Translation | Groq (free, key already set), cached; speech through the browser |
| Sign-in | Walk the owner through MongoDB, AUTH_SECRET and Google sign-in this session |
| Maps | Keep keyless Google embeds; the India map stays the drawn, tilted map |

## The request, restructured

1. **Yatri chat** (main session): remove the diya mark; a moving doodle backdrop of travel motifs inside the chat, like WhatsApp's; an animated travel character speaks for Yatri; the panel opens instantly (code preloaded, no lazy wait).
2. **Home** (main session): the slider keeps playing under the cursor (pause button and keyboard focus still pause it); remove "Choose how you like to travel" and "Start with a state"; navigation text more eye-catching within the Tour India colours.
3. **Characters** (agent A): redraw the animated cartoons with more realistic, layered motion, and add Yatri's character.
4. **Footer** (agent B): an animated Victoria Memorial across the bottom of the footer.
5. **Images** (agent C): replace photos with the highest-resolution free-licence originals (stored at web sizes, gently contrast-enhanced), fill every missing image, and give every encyclopedia entry a Wikipedia-style set of reference images with captions and credits (West Bengal included).
6. **Translation and speech** (agent D): translate guide, state, festival, food, art and heritage text into India's scheduled languages on request, cached; read aloud with the browser's voices.
7. **Admin dashboard** (agent E): one page for admins with users, comments, edits, requests, Yatri use and integration status.
8. **Sign-in** (owner walkthrough): MongoDB Atlas, `AUTH_SECRET`, Google OAuth, then `npm run db:setup` and a live sign-in test.
9. **Verify** (main session): type check, lint, unit and browser tests, independent code and security review, PageSpeed on the main pages, then ship.

## Phases

- [x] P26 Yatri chat
- [x] P27 Home fixes
- [x] P28 Characters
- [x] P29 Footer: neon Kolkata skyline with city life (owner's reference image)
- [x] P30 Images and encyclopedia galleries
- [x] P31 Translation and speech
- [x] P32 Admin dashboard
- [x] P33 Sign-in live (MongoDB Atlas M0 Mumbai, emailed codes via Resend; Google sign-in waits on 2-Step Verification)
- [x] P34 Verify, score and ship (PR #9 merged 2026-11-17)

## Rules for agents

- Work only in the files named in your brief. Shared files (`globals.css`, `layout.tsx`, `package.json`, `images.json` except agent C) belong to the main session.
- Put new styles in CSS modules. Animate only transform and opacity, and respect reduced motion.
- No new runtime dependencies without asking the main session.
- Run `npx tsc --noEmit` (after `npx next typegen` if needed), `npx eslint` on your files and `npx vitest run`; don't build or start a dev server.

## P34 verification log (2026-11-17)

- Type check, lint (one older warning), 355 unit tests, production build and 81 browser tests (Edge) passed.
- Independent review fixes:
  - Translation only sends text found on the page being read (the server loads its own copy of the page), so the shared cache can't be poisoned and the endpoint isn't a free AI proxy.
  - Translations that add links, emails or phone numbers are rejected; a 40-second overall deadline; per-IP limit 240/hour since cached text is free.
  - `db-setup` never fails a deploy (even with a malformed connection string) and only runs on production builds.
  - The slider pauses for keyboard focus (hover still never pauses it, per the owner); the launcher's avatar animates only on hover; the chat avatar's mood resets when the chat closes.
- Shipped: PR #9 merged (4212680); production deploy verified (skyline served, live translation works, off-page text refused).
- PageSpeed (pagespeed.web.dev, mobile, performance/accessibility/best practices/SEO):
  - Home 86 and 87 on a rerun / 100 / 100 / 100 (LCP 3.5 s; was 96–98 before v4)
  - Hampi 93 / 100 / 100 / 100 (LCP 3.2 s; render delay 780 ms, mostly script work); desktop 100
  - Calendar 96 / 100 / 100 / 100 (LCP 2.8 s)
  - Follow-up: win back the home page's mobile performance.

## P35 Home page speed (2026-11-17)

- Cause: `experimental.inlineCss` copied the whole stylesheet (104 KB) into every page three times (a style block plus two copies in the RSC payload). v4's extra styles made the home page 719 KB (123 KB compressed), finishing at 3.2 s on slow 4G.
- Fixes: `inlineCss` off (styles load as one cached file); characters are lazy islands that load near the viewport (`components/characters/lazy.tsx`); the footer skyline's moving layer loads near the viewport; the Yatri button shows a chat icon and fetches Yatri's face and the chat only after the page has loaded.
- Result (local, slow-4G phone profile): home HTML 291 KB (41 KB compressed), arriving at 0.4 s; all characters and the skyline traffic still appear on scroll with CLS under 0.02.
- Live after PR #10: home 91 / 100 / 100 / 100 on mobile (from 86–87), desktop 100; FCP 1.1 s, TBT 30 ms. PageSpeed then flagged that the main photo's preload lacked `fetchpriority=high` (790 ms load delay): Next 16 deprecates `priority`, which no longer adds it. Page heroes and the first slide now use `preload` plus `fetchPriority="high"`; locally the photo arrives at 1.1 s instead of 2.2 s.
- Profiling (Chrome trace, slow-4G, 4x CPU): before the main photo could be drawn, the browser spent one block of about 1 s on layout (588 ms), style (285 ms) and paint (150 ms), and that block also delayed the photo's arrival. Deferring the whole footer (`.footer-deferred`, content-visibility) halves the layout before LCP (936 → 466 ms) and paint (194 → 99 ms). Also stopped preloading the 74 KB wordmark font and deferred the video's 133 KB poster until the video is near.
- Live after PR #12: home 92 performance on mobile (LCP 2.9 s, CLS 0), but accessibility fell to 97: axe can't hit-test skipped content, so it measured the footer's bottom rows against the page's cream background. The helpline and copyright rows now sit outside the deferred block (axe: 0 contrast failures on home and about), while the heavy part stays deferred.
