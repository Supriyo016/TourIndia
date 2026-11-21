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
| 23 | Yatri uses the configured OpenAI-compatible provider (Groq or Vercel AI Gateway) with tools over this site's data, and falls back to guide-based answers | Grounded in the site's own guides, and still useful with no provider configured or during an outage | Provider and model are configurable through server-side environment variables |
| 24 | The terminal's commands run in the browser against a static index; only `ask` uses the server | Free to run, and works with no AI key | |
| 25 | The original `video.mp4` is re-encoded in the browser to 720p WebM (VP9 and Opus, 10 MB) and served with `preload="none"` | The 40 MB original repeatedly failed to upload to Vercel, and is heavy for visitors. ffmpeg couldn't be installed here | WebM plays in current browsers, though very old Safari versions may not. Its source and licence are unconfirmed. The original stays in `legacy/` |
| 26 | "Advanced cookies" means a versioned consent manager and a signed, hardened session cookie | No tracking exists to add, and none was invented | Theme, recents and chat history are only kept with consent |
| 27 | The calendar lists only sourced dates: fixed national days, 2027 dates already fact-checked, and one 2026 date | Lunar dates must not be guessed | Earlier 2026 festivals don't appear |
| 22 | Migration on branch `rebuild/nextjs`, with the old site moved to `legacy/` | `master` and GitHub Pages stay untouched until cut-over | |
| 28 | The bar shows 7 main items; the rest sit under "More" (wide screens) and are listed in full in the mobile menu | Owner's request. Seven fit at 1280 px without wrapping | Calendar, Gallery, Services, About and Contact are one click deeper on desktop |
| 29 | Over the home slider, the header switches to the dark tokens and a transparent glass background | Text and menus stay readable over any photo without one-off colour overrides | |
| 30 | One three.js scene (a globe of destination pins), lazy-loaded near the viewport, skipped for reduced motion, low memory or no WebGL 2 | Owner chose one WebGL scene plus CSS 3D, to protect phone speed | three.js loads only on the home page, when scrolled to |
| 31 | The video tour autoplays with sound where the browser allows it, otherwise muted with a "Sound on" button | Browsers block unmuted autoplay until the visitor has interacted with the site | |
| 32 | Adaptive quality uses three WebM files (720p, 480p, 360p) chosen from the Network Information API and stalls, not HLS | Static files on Vercel with no streaming server; the API is Chromium-only, so others start at 480p | Switching reloads the file at the same moment rather than switching seamlessly mid-segment |
| 33 | Yatri's AI will be a small model run in the visitor's browser (WebLLM), opt-in, with guide mode as the default | Owner's choice: free to run | Needs WebGPU and a large one-time download; not done yet (P10) |
| 34 | One store interface: MongoDB in production, an in-memory copy in development and tests; with no database in production, accounts and community features report "not available" | Every feature runs and is tested locally; production never keeps data in memory | Data written in development is lost when the dev server restarts |
| 35 | Email sign-in uses hashed 6-digit codes (10 minutes, five tries, one-minute resend gap) and hashed session tokens; admin needs an emailed code for an address in ADMIN_EMAILS and lasts 8 hours | No passwords to leak; a database leak exposes neither codes nor live sessions | Needs RESEND_API_KEY and a verified sending domain in production |
| 36 | Google sign-in is a hand-written OAuth code flow with PKCE, state and nonce; ID token claims are checked without fetching keys, as OIDC allows for tokens received straight from Google's token endpoint | No extra auth library; small surface | Needs a Google OAuth client; Google sign-in never grants admin |
| 37 | Encyclopedia corrections are stored as suggestions and change a page only after an admin approves them; approval revalidates the page | The owner's requirement; keeps vandalism off the site | Pages show approved changes after revalidation, not instantly |
| 38 | Moderation masks swearing, refuses slurs, threats, phone numbers, emails and outside links, and holds hostile remarks about any faith or community for an admin | Respect for all religions, without silently deleting borderline speech | Word lists are short and need the owner's ongoing care |
| 39 | "Booking" is a request for planning help with a reference number; nothing is reserved or charged | Tour India is not a registered travel agent (see the bookings page) | The owner must answer requests by email |
| 40 | The calendar adds fixed-date observances and state days with sources, festival dates only where a source published them, and nature seasons labelled as typical | No guessed lunar dates | Some festivals have no date until a source publishes it |
