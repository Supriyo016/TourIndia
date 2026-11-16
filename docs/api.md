# API

All POST routes accept `application/json` with a body of 16 KB or less from the site's own origin.

| Route | Method | Body | Limit per address |
|---|---|---|---|
| `/api/contact` | POST | `name`, `email`, `subject`, `message` | 5 an hour |
| `/api/newsletter` | POST | `email`, `consent: true` | 5 an hour |
| `/api/stories` | POST | `name`, `email`, `title`, `destination`, `story`, `consent: true` | 3 an hour |
| `/api/weather?slug=` | GET | A destination slug from this site | Cached for 1 hour per slug |

## Responses

| Status | Meaning |
|---|---|
| 200 | Weather data, or a honeypot submission that was discarded |
| 201 | Saved |
| 400 | Body was not valid JSON |
| 403 | Missing or foreign `Origin` |
| 404 | Unknown destination |
| 405 | Wrong method |
| 413 | Body too large |
| 415 | Not JSON |
| 422 | Failed validation; `error` has a message suitable for display |
| 429 | Rate limited |
| 502 | Weather provider unavailable |
| 503 | Database not configured or unavailable |

Errors have the form `{ "error": "Message" }` and never include internal details.

## Collections

| Collection | Purpose | Key indexes |
|---|---|---|
| `contact_messages` | Messages to the owner | `createdAt` |
| `newsletter_subscribers` | Consented addresses | `email` (unique) |
| `story_submissions` | Reader stories; `status` is `pending`, `approved` or `rejected` | `status, createdAt` |
| `rate_limits` | Hashed counters | `expiresAt` (TTL) |

`scripts/db-setup.mjs` applies `$jsonSchema` validators and indexes.
