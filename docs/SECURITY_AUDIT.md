# Security audit

Last updated 2026-11-08. This records what was built and tested. It is not a claim that the application is completely secure.

## Attack surface

No accounts, no sessions, no file uploads, no payments and no admin interface. Pages are static. Server code is limited to three form endpoints and one weather proxy.

## Protections

| Risk (OWASP Top 10:2025) | Protection | Where |
|---|---|---|
| Broken access control | No privileged routes exist. Stories publish only when the owner sets `approved` in the database | `api/stories`, `community-stories.ts` |
| Security misconfiguration | CSP, HSTS (production), `nosniff`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy; no `X-Powered-By` | `next.config.ts` |
| Supply chain | Lockfile, `npm audit` in CI, Next.js at or above the versions fixing the Oct/Nov 2026 advisories, sharp 0.35.5 | `package.json`, CI |
| Cryptographic failures | IPs stored only as salted SHA-256; production refuses to run with a missing or short salt when a database is configured | `rate-limit.ts` |
| Injection (XSS, NoSQL, calendar) | React escaping; `<` escaped in JSON-LD; Zod makes every field a plain string before it reaches MongoDB; calendar text escaped and UIDs generated | `validation/forms.ts`, `generate.ts` |
| Insecure design | Shared trip links carry only validated options and item ids. Text is regenerated from our own data, so a crafted link can't put words on the page | `features/itinerary/share.ts` |
| Authentication failures | Not applicable: no authentication exists | |
| Data integrity | Stored browser data is checked for shape and falls back safely | `use-stored-value.ts` |
| Logging | Failures logged without personal data or request bodies | `form-handler.ts` |
| Exceptional conditions | Generic error messages; honest 503 when storage is unavailable | `form-handler.ts` |
| CSRF | `Origin` must match the site, and JSON is required | `form-handler.ts` |
| SSRF | The weather route looks coordinates up from a slug in our data; it takes no URL or coordinates | `api/weather` |
| Abuse and DoS | Per-address rate limits, 16 KB streamed body cap with early rejection, bounded in-memory limiter, honeypot | `form-handler.ts`, `rate-limit.ts` |
| Open redirects | No redirect takes user input | |
| Secrets | Environment variables only, server-only modules, `.env*` ignored by Git | |
| Privacy | Fragment-based share links never reach the server. Newsletter responses don't reveal whether an address exists | `share.ts`, `api/newsletter` |

## Assistant and cookies

| Risk | Protection | Where |
|---|---|---|
| Runaway AI cost | Limits per address (40 an hour) and per session (25 an hour), a site-wide daily cap (`ASSISTANT_DAILY_LIMIT`, default 500), 1,500 output tokens per reply, 3 tool rounds, and strict message limits. Set usage and spending limits in the configured provider account | `api/assistant` |
| Prompt injection | Tools only read this site's own content, and none can write, browse or send anything. The prompt treats tool text as data | `features/assistant/agent.ts` |
| Malicious links or markup in replies | Replies render as React text. Only same-site links and bold are recognised | `RichText.tsx` |
| Secret exposure | Provider credentials are read from server-side environment variables and are never sent to the browser | `agent.ts` |
| Session forgery | HMAC-signed session with expiry and constant-time comparison. `__Host-` prefix, HttpOnly, Secure, SameSite=Strict | `lib/security/session.ts` |
| Consent | Versioned `ti_consent` cookie, set by a same-origin, validated endpoint. Refusing deletes optional storage | `api/consent`, `lib/consent.ts` |

The in-memory rate limiter is per server instance. Until a database is connected, the assistant's limits are approximate on Vercel, so configure appropriate usage and spending limits in the selected provider account.

## Tests performed

| Test | Result |
|---|---|
| Route handlers: origin, content type, malformed JSON, oversize, rate limits, per-address buckets, header spoofing, NoSQL operators, privileged fields, honeypot, consent, enumeration, moderation, email exposure, weather slug abuse, database-down behaviour | 32 of 32 passed against a real MongoDB 8.0.4 server with `db-setup` validators and indexes applied |
| Shared-link abuse: huge or infinite values, impossible dates, unknown cities and destinations, wrong types, text injection, oversize | Passed |
| Calendar injection | Passed |
| Running production server: headers, wrong methods, cross-site POST | Passed |
| Client bundles scanned for secret names | Passed |
| `npm audit --omit=dev` | See `PROJECT_STATUS.md` |
| Independent code and security review | 15 findings, all addressed; see `BUG_TRACKER.md` |

## Not tested

- **MongoDB Atlas itself.** The tests used a local MongoDB server. TTL expiry was configured but not observed firing, and no hosted database exists yet.
- The deployed production environment, including real HSTS and platform header behaviour.
- Penetration testing by a third party.

## Known limitations and remaining risks

| Risk | Severity | Notes |
|---|---|---|
| CSP allows inline scripts | Low to medium | Required for static rendering, because nonces force dynamic rendering. The review found no route for user data into HTML |
| Non-browser clients can forge `Origin` | Low | The rate limit is the real control for them |
| Self-hosting needs `TRUSTED_PROXY_HOPS` | Medium if missed | Without it all visitors share one rate-limit bucket, which is safe but strict. Not needed on Vercel |
| In-memory limiter is per instance | Low | Only used when no database is configured |
| Fixed-window limiter allows bursts at window edges | Low | Acceptable for these forms |
| Reader stories hold personal data | Medium | Protect Atlas access and backups |
| Boundary dataset has no stated licence | Legal, not security | See `PROJECT_STATUS.md` |

## Deployment settings

- Least-privilege Atlas user (`readWrite` on `tour_india` only), TLS (default on Atlas) and restricted network access
- A random `RATE_LIMIT_SALT` of 32 or more characters
- Enable GitHub secret scanning and Dependabot on the repository
- Rotate the database password if it is ever exposed

## Review of accounts and community code (2026-11-16)

An independent review covered the new store, auth, account, community, admin and booking code. It checked against the OWASP Top 10 with each finding traced in code. There were no critical findings. All eight findings are fixed, with tests:

| # | Finding | Severity | Fix |
|---|---|---|---|
| 1 | Open redirect via a tab, newline or backslash in `next` | Medium-high | One `safePath()` (src/lib/safe-path.ts) used by Google sign-in, the account page and Yatri links. Unit-tested |
| 2 | Off Vercel, every visitor shares one rate-limit bucket | Medium | A loud production error until `TRUSTED_PROXY_HOPS` is set |
| 3 | Slow code guessing by reissuing codes | Low-medium | Daily cap on code attempts per address: 20, or 10 for admin |
| 4 | Response time revealed admin addresses | Low | The email is sent after the response (`after()`) |
| 5 | Inherited keys such as `constructor` passed the editable-field check | Low | `Object.hasOwn` checks |
| 6 | Comment counter race | Low | Conditional status update, so the count only changes when the update applies |
| 7 | Account deletion left bookings, reports and suggestions, and stale totals | Low | All removed or anonymised, and totals corrected |
| 8 | Behind a TLS proxy, cookies could lack Secure, and the non-`__Host-` cookie was accepted | Low | In production, HTTPS and the Google origin come from the public address, and only `__Host-ti_auth` is read |

Checked and fine: NoSQL operator injection (every filter value is validated), mass assignment, IDOR, admin escalation, CSRF on every state-changing route, OTP storage and comparison, session tokens, Google ID-token claims, XSS (React text only), PII in responses, and behaviour when settings are missing.
