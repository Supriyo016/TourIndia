# Contributing to Tour India

Thanks for helping. Corrections to travel information are the most valuable contribution.

## Ground rules

- Tour India is an independent guide. It does not sell travel, take bookings or process payments, so please don't add prices, availability, reviews or visitor numbers.
- Every fact needs a source you can link. See [docs/FACT_CHECK.md](docs/FACT_CHECK.md).
- Photos must have a licence that allows reuse, and a credit in `/credits`.

## Development

```bash
npm install
npm run dev          # http://localhost:3000, works without a database
npm run lint
npm run typecheck
npm test             # unit and API tests
npm run test:e2e     # Playwright
```

Never run tests against the live database: leave `MONGODB_URI` empty locally.

## Pull requests

1. Branch from `master`. Vercel deploys `master` to production, so keep it green.
2. Keep changes focused, and describe what you changed and how you checked it.
3. CI must pass (lint, typecheck, unit, API and end-to-end tests).

## Reporting problems

Use the issue templates. Report security issues privately, as described in [SECURITY.md](SECURITY.md).
