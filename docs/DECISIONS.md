# Decisions

| # | Decision | Why | Trade-off |
|---|---|---|---|
| 1 | Next.js 16 App Router, statically generated pages | Content changes rarely; static pages are fast and cheap | A content change needs a rebuild |
| 2 | Editorial content in typed TypeScript files, not MongoDB | Reviewed through Git, type-checked, needs no database to render | Non-developers can't edit without a CMS |
| 3 | MongoDB used only for what must persist on a server: contact messages, newsletter sign-ups, story submissions, rate limits | The brief asks for collections only where persistence is genuinely needed | |
| 4 | No user accounts in this version. Wishlist, trips, passport and expenses live in `localStorage` | Removes password, session and account-takeover risk, and suits a free information site | Saved items don't sync between devices |
| 5 | Static CSP with `'unsafe-inline'` for scripts | Nonces force every page to dynamic rendering (confirmed in current Next.js docs). The site renders no user HTML, and React escapes all output | Weaker XSS defence in depth; see SECURITY_AUDIT |
| 6 | Security headers set in `next.config.ts`; no `proxy.ts` | Nothing needs per-request logic | |
| 7 | India map is pre-projected SVG rendered on the server, not MapLibre | About 22 KB, works without JavaScript, every state is a keyboard-focusable link, and no tile provider draws India's borders | Not zoomable. Leaflet is used for street-level destination maps |
| 8 | Boundary data from `udit-001/india-maps-data` | The only source reachable that has the current 36 divisions. DataMeet's state file is CC BY 4.0 but pre-2019 (J&K includes Ladakh; Daman and Dadra separate) | **Its licence is not stated. Owner decision needed**; see PROJECT_STATUS |
| 9 | CSS animation and scroll-driven timelines; no Framer Motion, GSAP or Lottie | Cuts JavaScript. The effects needed are all achievable in CSS and SVG, and the brief says not to add libraries for popularity | Scroll reveals don't run in browsers lacking `animation-timeline`; content still shows |
| 10 | Rule-based trip planner, no LLM | Instant, deterministic, testable, free to run, and cannot invent attractions or prices | Less flexible than a language model |
| 11 | Print stylesheet and "Save as PDF" rather than a PDF library | No extra bundle; browsers produce a good PDF | One extra click in the print dialog |
| 12 | Trip sharing encoded in the URL | No server storage or personal data; links never expire | Long URLs |
| 13 | "Trending" is replaced with "Good to visit this month" | No genuine trend data exists; the brief forbids fabricating it | |
| 14 | Testimonials omitted | None exist | |
| 15 | Travel Stories are guides, not invented trips. Reader stories are moderated and text-only | No fabricated experiences. Text-only removes the upload attack surface | No reader photos |
| 16 | Moderation is done by the owner in MongoDB Atlas; there is no admin UI | No public administration endpoint | Less convenient |
| 17 | Photos from Wikimedia Commons, downloaded and resized at build time, filtered by licence | Clear licences and attribution; no hotlinking or third-party image host in the CSP | About 40 MB in the repository |
| 18 | The phrase "Incredible India" is not used as branding | It is a Government of India campaign | |
| 19 | The UI says "Last updated", not "Last reviewed" or "Verified" | Fact-checking was only partial (see PROJECT_STATUS). The label should not claim more than was done | |
| 20 | The About page refers to the first version as "a collaborative project", without names | Honest about its origin without naming people who haven't given permission | Owner can reword in `src/app/about/page.tsx` |
| 21 | Weather from Open-Meteo through a server route | No key needed; coordinates come from our data, so no SSRF | Free tier is for non-commercial use; review if the site commercialises |
| 23 | Yatri uses Claude Opus 5.5 with tools over this site's data, and falls back to rule-based answers | Grounded in the site's own guides, and still useful with no API key or during an outage | Opus is the costliest choice for a public chat; `ASSISTANT_MODEL` can change it |
| 24 | The terminal's commands run in the browser against a static index; only `ask` uses the server | Free to run, and works with no AI key | |
| 25 | The original `video.mp4` is re-encoded in the browser to 720p WebM (VP9 and Opus, 10 MB) and served with `preload="none"` | The 40 MB original repeatedly failed to upload to Vercel, and is heavy for visitors. ffmpeg couldn't be installed here | WebM plays in current browsers, though very old Safari versions may not. Its source and licence are unconfirmed. The original stays in `legacy/` |
| 26 | "Advanced cookies" means a versioned consent manager and a signed, hardened session cookie | No tracking exists to add, and none was invented | Theme, recents and chat history are only kept with consent |
| 27 | The calendar lists only sourced dates: fixed national days, 2027 dates already fact-checked, and one 2026 date | Lunar dates must not be guessed | Earlier 2026 festivals don't appear |
| 22 | Migration on branch `rebuild/nextjs`, with the old site moved to `legacy/` | `master` and GitHub Pages stay untouched until cut-over | |
