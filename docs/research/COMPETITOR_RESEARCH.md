# Tour India: Competitor and Technical Research

Prepared 2026-11-08. Scope: competitor study, adaptable patterns, current technical facts, verified official links.

Method and limits. Pages were read through a text-only fetch tool (it returns page text, not rendered pixels) plus web search. That means mobile behaviour, motion, accessibility quality and performance could not be measured for any site (no Lighthouse, no screen reader, no device testing). Those columns say "not observed" unless the fetched markup itself showed something. Seven of the eleven named competitors could not be read at all (blocked, empty, or timed out); they are marked as such and nothing is guessed about them.

---

## Part 1. Competitor matrix

Legend: "NO" = fetch failed or returned no usable content, so everything is not observed. Observed items are paraphrased from what the fetch returned.

| Site | Fetch result | Homepage / navigation | Discovery, search, filter | Maps | Planning tools | Notable | Limitations (observed) |
|---|---|---|---|---|---|---|---|
| Incredible India (incredibleindia.gov.in) | Read | Video carousel with category tabs, Destinations, Attractions, Travel Diaries. Top nav: Destinations (by six regions), Experiences (themes), Plan your trip, Festivals and Events | Site search with trending-search no-results state; Experiences and Diaries filter by interest and region; "show favourites" toggle | Regional map images used as zone filters; interactive map not observed | Practical info (weather, emergency numbers, holidays, currency converter), visa guide, airport info, itineraries and packages list | Logged-in bookmarks; "did you know" facts on cards | No itinerary builder, reviews, language selector, or booking observed |
| MakeMyTrip | NO (timeout) | not observed | not observed | not observed | not observed | not observed | not observed |
| Tripadvisor | NO (403) | not observed | not observed | not observed | not observed | not observed | not observed |
| Google Travel | NO (empty content) | not observed | not observed | not observed | not observed | not observed | not observed |
| Booking.com | NO (empty content) | not observed | not observed | not observed | not observed | not observed | not observed |
| Airbnb (airbnb.co.in) | Read (home); Goa experiences page read | Tabs for Homes, Experiences, Services; carousels per city; inspiration tabs by theme | Location, dates, guests search; carousels deep-link into pre-filtered results | not observed on home; none seen in text of the Goa experiences page (page is JS-heavy, so absence is inconclusive) | Date and guest fields only | Rating badge for highly rated listings; consistent card anatomy (photo, type and place, price, rating) | No standalone filters visible on home |
| Culture Trip | NO (timeout x2) | not observed | not observed | not observed | not observed | not observed | not observed |
| Atlas Obscura | NO (403 x2) | not observed | not observed | not observed | not observed | not observed | not observed |
| Lonely Planet (India page) | Read (nav only; body cut off) | Skip-to-content link present; nav: Destinations, Books, Trips, Travel Advice, Best in Travel, App; mega-menu grouped by region; mobile uses drill-down panels with back buttons | Hierarchy region, country, city mirrored in URLs; curated "favourite places" lists; Best in Travel list | Interactive maps not observed (only printed maps for sale) | Bookable itineraries, app link; interactive planner not observed | Strong information architecture; seasonal editorial campaigns | Detail-page structure not observed |
| Thrillophilia | Read | Hero search, trending destinations, tiles by region, group tours, fixed departures, reviews carousel, photo grid. Nav: India Packages, International, Activities, MICE | Search plus option to upload a reel or video to find trips; mood filters (Adventure, Relaxing, Romantic, Cultural); trip-length tabs | Static "live" map graphic only | Itinerary builder or budget tool not observed; contact path is request-a-callback | Video-led discovery; live traveller counts; countdown timers; product cards show duration, route summary, rating, price, badges | Heavy sales pressure patterns; no price, date or city filters observed |
| National Geographic Travel | Read | Intro, featured stories, yearly "Best of the World" roundup, destination guides block, UK magazine block, load-more | Curated lists and tags; search and filters not observed | Not observed | Not observed | Mix of long-form features, listicles, how-tos, interviews, photo slideshow; labelled paid content | No tools; discovery is editorial only |
| Wanderlog | Read | Hero with "start planning", itinerary-plus-map view, feature tabs, press, stats. Nav: Travel guides, Hotels, login | Add places from guides in one click; recommendations from the itinerary | Map view shown beside the itinerary | Itinerary, route optimisation, collaboration, offline access, reservations via email import, budget and expense split, packing lists, AI assistant (listed features; depth not observed) | Free vs paid appears to split at AI and route optimisation, per testimonials (not official pricing) | Gating details not observed on the page |
| Roadtrippers | Read | Trip-start form (origin, destination), Extraordinary Places cards, user-submitted finds, magazine, guides | Planner on separate site; map explorer link | Only static map images on this page | Autopilot itinerary; free tier limited to 1 saved trip and 3 stops, higher tiers raise limits | User-submitted finds with contributor names; curated "extraordinary places" | Heavy paywalling of offline maps, navigation, collaboration (exact tier per row unclear) |
| Rome2Rio | Read | Origin/destination form, partner logos, mode counts (train, bus, ferry, flight), featured city-pair routes, articles, link lists | Single route search leading to a route page; accommodation search via a partner | Embedded map not observed on the page | Multi-modal route comparison described, results not shown | One search across train, bus, ferry and flight; QR to the app | No visible main nav; monetised by partner links |
| Kerala Tourism (keralatourism.org) | Read (several sections showed "Loading") | Featured theme banner, What's New stories, category cards, Events, Popular Destinations, E-Brochures, News, Gallery, social | Search, filters, language options: not observed | Not observed | E-brochures described as planning guides; no interactive tools observed | Short editorial cards leading to long features (Theyyam, boat league, regional branding); destination weddings feature | Content loads late (placeholders seen in capture); no search or map observed |

Cross-cutting findings from the sites that could be read:
- Government and tourism-board sites (Incredible India, Kerala) organise by region and theme but give little interactive planning; Incredible India does offer favourites and practical-info pages.
- Commercial sites (Thrillophilia, Roadtrippers, Wanderlog) win on planning tools but gate them behind payment or callbacks and add urgency cues.
- Lonely Planet's strict region, country, city hierarchy with a skip link and drill-down mobile menu is the cleanest information architecture of the set.
- No read site showed a combined "what is actually open, when to go, what permit do I need" view. That is the gap.

---

## Part 2. Worth adapting for Tour India (prioritised)

Constraints: no booking, one owner, no team, so every pattern must be cheap to maintain and must not need live inventory. Patterns below come from the observed sites above plus product reasoning; items marked (reasoned) are not copied from any one competitor.

1. Region, state, destination hierarchy with clean URLs (Lonely Planet, Incredible India). Why: predictable navigation, good SEO, easy for a solo owner to extend. Original: use India-specific levels (zone, state or UT, circuit, place) and a "nearby" link graph stored in MongoDB.
2. Practical-info block on every destination: best months, how to reach, permits, emergency numbers (Incredible India practical pages). Why: reduces trip-breaking mistakes. Original: structured per-place fields with a "last verified" date and source link, which no read competitor showed.
3. Permit and entry-rules checker (reasoned; gap found above). Why: Inner Line and Protected Area rules are the top India-specific confusion. Original: a plain-language yes/no per state and traveller type that links only to official sources, with a visible "rules change, confirm officially" notice.
4. Save to a trip without an account first (Wanderlog, Incredible India favourites). Why: instant value. Original: store the shortlist locally, offer optional sign-in later; no collaboration features at launch.
5. Simple trip planner: days, places, map beside list (Wanderlog layout). Why: the core "trip-planning" promise. Original: seasonal and distance sanity warnings (reasoned), no booking or price data.
6. Map as a filter and a view (Incredible India regional map filters, Wanderlog map beside list). Why: spatial context for a huge country. Original: open map tiles, clustering, and "within N hours of this place" overlay.
7. Mood and trip-length entry points (Thrillophilia chips). Why: low-effort discovery. Original: honest, editorial moods ("quiet", "high altitude", "family friendly") without countdown timers, fake scarcity or live visitor counts.
8. Editorial seasonal picks and yearly roundups (Lonely Planet Best in Travel, NatGeo roundup). Why: cheap, recurring, shareable content. Original: a monthly "where to go in [month]" page driven by one data table.
9. Short story cards that lead into long reads (Kerala What's New, NatGeo). Why: storytelling without a design team. Original: first-person owner notes and local voices; all text and photos original or licensed.
10. Contributor submissions with moderation (Roadtrippers user finds). Why: scales content. Original: later phase only, moderated by the owner, with a simple report link; skip at launch to protect solo workload.
11. Consistent card anatomy (Airbnb): image, name, place, one key fact. Why: scannability and faster build. Original: key fact is season or permit status rather than price or rating.
12. Skip link, drill-down mobile menu, strong focus states (Lonely Planet markup). Why: accessibility baseline and mobile usability. Original: test with a screen reader and keyboard before launch since this research could not.
13. Official-resources hub and emergency strip (Incredible India emergency numbers page). Why: trust and safety. Original: a persistent footer strip with 112 and the tourist helpline, linking only to Part 4 resources.
14. Static-first rendering with ensureStatic (Next.js 16.4; see Part 3). Why: fast, cheap hosting for a content site. Original: apply to destination pages; keep planner as the dynamic part.
15. Avoid: callback-only contact, countdown timers, paywalled offline maps. Why: seen on Thrillophilia and Roadtrippers; conflicts with a non-booking, trust-first positioning.

---

## Part 3. Current technical facts (checked 2026-11-08)

| Topic | Fact | Source |
|---|---|---|
| Next.js latest stable | 16.4.5 (npm dist-tag "latest"); 16.4 released 2026-10-06; Active LTS is 16.x, Maintenance LTS is 15.5.x (15.5.29). create-next-app in 16.4 enables Cache Components by default; Next.js 17 is stated to make it the default | https://registry.npmjs.org/-/package/next/dist-tags , https://nextjs.org/blog/next-16-4 , https://nextjs.org/blog/november-2026-security-release |
| Middleware renamed to proxy? | Yes. Docs say the `middleware` file convention is deprecated and renamed `proxy` (version history: v16.0.0, "Middleware is deprecated and renamed to Proxy. Proxy defaults to the Node.js runtime"). File is `proxy.ts` exporting `proxy`. Codemod: `npx @next/codemod@canary middleware-to-proxy .`. Proxy cannot set a `runtime` option. Server Function calls are POSTs to their page route, so a matcher that excludes a path also skips Proxy for them; authorise inside each Server Function | https://nextjs.org/docs/app/api-reference/file-conventions/proxy |
| CSP nonces vs static rendering | Nonces require dynamic rendering: static pages are built without request headers, so no nonce can be injected. With nonces, all pages must be dynamic; static optimisation and ISR are disabled, CDN caching needs extra configuration, and Partial Prefetching/PPR is incompatible with nonce-based CSP. Alternative: experimental SRI (`experimental.sri`, hash-based) keeps static generation. Without nonces, set CSP via `headers()` in next.config with `'unsafe-inline'`. Doc last updated 2026-03-20; examples use `proxy.ts` | https://nextjs.org/docs/app/guides/content-security-policy |
| Tailwind CSS | Current major is v4. The Next.js guide is for v4.3; npm "latest" is 4.3.5. Setup: `npm install tailwindcss @tailwindcss/postcss postcss`; `postcss.config.mjs` with the `@tailwindcss/postcss` plugin; `@import "tailwindcss";` in `app/globals.css` | https://tailwindcss.com/docs/installation/framework-guides/nextjs , https://registry.npmjs.org/tailwindcss/latest |
| MongoDB Node.js driver | 7.8.0 is npm "latest" (read from the registry's `latest` record; the tarball URL names mongodb-7.8.0). The npm package page itself returned 403. Engine requirement not checked | https://registry.npmjs.org/mongodb/latest |
| OWASP Top 10 | 2025 edition is current (owasp.org/Top10 permanently redirects to the 2025 edition). Categories: A01 Broken Access Control, A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging and Alerting Failures, A10 Mishandling of Exceptional Conditions | https://top10.owasp.org/2025 |
| Security advisories to pin above | Pin `next` to at least 16.4.5 (or 15.5.29 on the 15 line). 2026-11-03 release fixes: High, cross-tenant cache disclosure mixing `unstable_cache` and `use cache` (GHSA-mfr8-8qww-v76h); several Medium: nested `use cache` root-parameter leak, binary-argument cache collisions, self-hosted shell cache poisoning, compressed response framing mismatch behind HTTP/1.1 proxies, cookie values exposed via `x-middleware-set-cookie` in Edge routes, SVG rejection bypass in Image Optimization. 2026-10-14 (fixed in 16.4.1 / 15.5.28): Critical RCE in `use cache` returning typed arrays; Critical RCE in Image Optimization with SVG on glibc Linux (CVE-2026-96889; ensure `sharp` is 0.35.5 or later); High DoS via Server Actions. Earlier: React Server Components CVE-2025-66478 (Dec 2025). Next.js now ships scheduled monthly security releases, so track the blog. Note the Nov post's install line contains a typo ("for 16.5" next to 16.4.5) | https://nextjs.org/blog/november-2026-security-release , https://nextjs.org/blog/nextjs-security-update-october-14-2026 , https://nextjs.org/blog/CVE-2025-66478 |

Implications for Tour India (reasoned): the `use cache` advisories apply only if Cache Components are used; avoid `unstable_cache` plus `use cache` mixing and avoid passing security-significant binary arguments to cached functions. Prefer `images.dangerouslyAllowSVG: false` (default) and keep `sharp` current. For CSP, a content-heavy site that wants static pages should evaluate SRI/hash approach versus nonces; nonces make every page dynamic.

---

## Part 4. Official resources (checked from this environment on 2026-11-08)

Important caveat: this environment had an unstable network. Several government hosts timed out or failed DNS, and a second pass failed even for hosts that had succeeded the first time (for example mha.gov.in). A failure here is not proof the site is down. "Confirmed" below means a request returned a successful response in this session; for state portals it means HTTP 200 after redirects and does not prove the content is the official tourism board (only Kerala's content was read).

### 4a. National and service links

| Resource | URL | Outcome |
|---|---|---|
| Ministry of Tourism | https://tourism.gov.in/ | HTTP 200 (redirected to https://www.tourism.gov.in/) |
| Incredible India | https://www.incredibleindia.gov.in/ | HTTP 200 (redirected to /en); content read |
| Ministry of Home Affairs | https://www.mha.gov.in/ | HTTP 200 (first pass); later DNS failure |
| MHA Protected/Restricted Area Permit page | https://www.mha.gov.in/en/divisionofmha/foreigners-division/protected-area-permit-pap-restricted-area-permit-rap | Appeared in search results; direct fetch failed (socket hang up). Not confirmed |
| Bureau of Immigration entry-restrictions page | https://boi.gov.in/boi/contents/travelling-to-india/entry-to-restricted-protected-prohibited-areas | Appeared in search results; direct fetch returned 404. Not confirmed |
| e-Visa portal | https://indianvisaonline.gov.in/evisa/tvoa.html | Page fetched and read via the fetch tool (title "e-Visa", Bureau of Immigration); curl TLS/connect attempts failed. Confirmed by one method |
| IRCTC | https://www.irctc.co.in/ | Fetch tool returned only the title "IRCTC Next Generation eTicketing System" (page shell, partial); curl timed out or failed DNS. Partially confirmed |
| ASI main site | https://asi.nic.in/ | HTTP 200 |
| ASI e-ticketing | https://asi.payumoney.com/ | HTTP 200 after redirect to https://eticket.webfront.in/asi/ . Not independently verified as the current official ticketing link; check ASI's own site before linking |
| 112 (ERSS) | https://112.gov.in/ | Direct fetch failed (connection refused / timeout). Existence is supported by search results listing 112.gov.in and PIB/MHA pages, not by a successful fetch. Not confirmed |
| India emergency number 112 | n/a | Per PIB/MHA material seen in search results: single pan-India emergency number under ERSS. Pages themselves were not fetched |
| Tourist helpline 1800-11-1363 (short code 1363) | https://www.tourism.gov.in/tourist-helpline | URL returned HTTP 200 to curl, but the fetch tool got 403, so the number was not read from that page. Number, 24x7, 12 languages (Hindi, English plus 10 international) is reported in PIB releases surfaced by search (e.g. https://www.pib.gov.in/PressReleasePage.aspx?PRID=2205891&reg=3&lang=1 ); those PIB pages were not fetched. Confirm on the ministry page before publishing |
| UNESCO India page | https://whc.unesco.org/en/statesparties/in/ | HTTP 403 to both curl and fetch tool (bot block). Not confirmed by fetch; appears in search results |
| India.gov.in national portal | https://www.india.gov.in/ | HTTP 200 (second pass) |

### 4b. Permit portals (Inner Line / Protected Area / UT entry)

| Area | Candidate official URL (from search results) | Outcome |
|---|---|---|
| Arunachal Pradesh ILP | https://arunachalilp.com/ | DNS not found. Not confirmed |
| Nagaland ILP | https://ilp.nagaland.gov.in/ | DNS not found. Not confirmed |
| Manipur ILP | sources conflict (manipurilponline.mn.gov.in vs mepo.manipur.gov.in) | Not fetched. Not confirmed |
| Mizoram ILP | no URL found | Not confirmed |
| Ladakh (LAHDC Leh permit) | https://lahdclehpermit.in/ | Fetch failed: certificate has expired. Not confirmed; Indian-citizen rules reported inconsistently, check the portal |
| Lakshadweep entry permit | no official URL found | Not confirmed |

Reported (not verified against a live page): the MHA relaxation for Manipur, Mizoram and Nagaland (Protected Area regime) ran to 31.12.2022 and no later extension was found in search; MHA's Foreigners Division page is the place to check current notifications. Because permit rules change at short notice, the site should link to official sources and avoid stating rules as fixed.

### 4c. State and UT tourism portals

Result column: "yes" = HTTP 200 after redirects in the first pass. "no" = not confirmed (connection failure, DNS failure or non-200), not proof the site is down.

| State / UT | URL tested | Confirmed |
|---|---|---|
| Andhra Pradesh | https://tourism.ap.gov.in/ | yes |
| Arunachal Pradesh | https://arunachaltourism.com/ | yes |
| Assam | https://tourism.assam.gov.in/ | yes |
| Bihar | https://tourism.bihar.gov.in/ | yes |
| Chhattisgarh | https://tourism.cg.gov.in/ | no (no connection) |
| Goa | https://www.goa-tourism.com/ | no (HTTP 400; alternate goa-tourism.com also failed) |
| Gujarat | https://www.gujarattourism.com/ | yes |
| Haryana | https://haryanatourism.gov.in/ | yes |
| Himachal Pradesh | https://himachaltourism.gov.in/ | yes |
| Jharkhand | https://jharkhandtourism.gov.in/ | no (no connection) |
| Karnataka | https://www.karnatakatourism.org/ | yes (redirects to karnatakatourism.org/en/) |
| Kerala | https://www.keralatourism.org/ | yes (content read) |
| Madhya Pradesh | https://www.mptourism.com/ | no (no connection) |
| Maharashtra | https://maharashtratourism.gov.in/ | yes |
| Manipur | https://manipurtourism.gov.in/ | yes |
| Meghalaya | https://www.meghalayatourism.in/ | yes |
| Mizoram | https://tourism.mizoram.gov.in/ | no (no connection) |
| Nagaland | https://nagalandtourism.com/ | no (no connection) |
| Odisha | https://odishatourism.gov.in/ | yes |
| Punjab | https://punjabtourism.punjab.gov.in/ | yes |
| Rajasthan | https://tourism.rajasthan.gov.in/ | yes (redirects to www.tourism.rajasthan.gov.in) |
| Sikkim | https://sikkimtourism.gov.in/ | no (no connection) |
| Tamil Nadu | https://www.tamilnadutourism.tn.gov.in/ | yes |
| Telangana | https://tourism.telangana.gov.in/ | no (no connection) |
| Tripura | https://tripuratourism.gov.in/ | yes |
| Uttar Pradesh | https://uptourism.gov.in/ | yes |
| Uttarakhand | https://uttarakhandtourism.gov.in/ | yes |
| West Bengal | https://wbtourism.gov.in/ | yes |
| Andaman and Nicobar Islands | https://www.andamantourism.gov.in/ | no (no connection) |
| Chandigarh | https://chandigarhtourism.gov.in/ | no (no connection) |
| Dadra and Nagar Haveli and Daman and Diu | https://damantourism.gov.in/ | no (DNS not found) |
| Delhi | https://delhitourism.gov.in/ | no (no connection) |
| Jammu and Kashmir | https://jktourism.jk.gov.in/ | no (DNS not found) |
| Ladakh | https://ladakh.gov.in/ | no (no connection) |
| Lakshadweep | https://lakshadweeptourism.com/ | no (no connection) |
| Puducherry | https://pondytourism.py.gov.in/ | no (no connection) |

Totals: 20 of 28 states confirmed; 0 of 8 UTs confirmed. URLs for unconfirmed entries are best guesses from memory, not discovered from an official index; they need a manual check before use.

### 4d. UNESCO World Heritage Sites in India

- Count: 45, as of the 48th World Heritage Committee session (Busan, July 2026), when the Ancient Buddhist Site of Sarnath was reported inscribed (25 July 2026). Evidence: multiple news reports surfaced by search (e.g. https://www.timeout.com/india/news/sarnath-is-now-indias-45th-unesco-world-heritage-site-072726 , https://www.outlooktraveller.com/News/sarnath-becomes-indias-45th-unesco-world-heritage-site ) and a search snippet describing UNESCO's India country page as listing 45. The UNESCO country page itself returned 403 and was not read, so the 45 figure is not confirmed from an official page fetched in this session.
- Confirmed from an official page: UNESCO's own article dated 15 July 2025 states India had 44 properties after Maratha Military Landscapes of India: https://www.unesco.org/en/articles/maratha-military-landscapes-india-inscribed-unesco-world-heritage-list-indias-44th-world-heritage-0 (fetched). An Indian Ministry of Culture release of March 2026 also gave 44 (seen only in a search summary, so it predates the Sarnath addition).
- Recommendation: display the count with an "as of" date and link to https://whc.unesco.org/en/statesparties/in/ ; recheck before launch.

---

## Not done / open items

- Rendering, performance, accessibility and mobile behaviour were not tested for any competitor.
- Seven named competitors (MakeMyTrip, Tripadvisor, Google Travel, Booking.com, Culture Trip, Atlas Obscura, plus partial Airbnb detail) need a manual browser review.
- Official confirmation still needed for: 112.gov.in, tourist helpline page text, permit portals for Arunachal, Nagaland, Manipur, Mizoram, Ladakh and Lakshadweep, UNESCO's count, all eight UT portals, and eight state portals.
- MongoDB driver engine requirements and Next.js 16.4 minimum Node version were not checked.
