# Setup and deployment

## Local development

Requires Node.js 20.9 or later.

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

The site runs without a database. Forms will report that submissions are unavailable until `MONGODB_URI` is set.

## Checks

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm test
```

```bash
npm run build && npm run test:e2e
```

End-to-end tests use Microsoft Edge by default on Windows. Set `PW_CHANNEL=chrome` to use Chrome.

## Deployment (Vercel and MongoDB Atlas recommended)

The site is live at https://tour-india-pi.vercel.app, deployed with `vercel deploy --prod`. The steps below add the database and automatic deploys.

GitHub Pages only serves static files, so it can't run the API routes.

1. **Database.** Create a MongoDB Atlas cluster. Create a database user limited to `readWrite` on `tour_india`. Restrict network access as far as your host allows; Vercel's dynamic IPs may require Atlas's Vercel integration or a static-IP add-on.
2. **Prepare collections.**
   ```bash
   MONGODB_URI="your-connection-string" npm run db:setup
   ```
3. **Hosting.** Push `rebuild/nextjs`, connect the repository to the existing `tour-india` Vercel project, and set its production branch to `rebuild/nextjs` before anything else. If it stays on `master`, the next push there would replace this site with the old one.
4. **Environment variables** in Vercel, never in Git:
   - `NEXT_PUBLIC_SITE_URL`: the production address, with no trailing slash
   - `MONGODB_URI`
   - `MONGODB_DB`: `tour_india`
   - `RATE_LIMIT_SALT`: at least 32 random characters
5. **Verify the preview** using the release checklist below.
6. **Domain.** Add your domain in Vercel, which provisions HTTPS.

## Release checklist

- [ ] `npm run build` and all tests pass
- [ ] Contact, newsletter and story forms save to Atlas on the preview
- [ ] A cross-site POST returns 403
- [ ] Headers present in production, including HSTS
- [ ] `/sitemap.xml` shows the production domain
- [ ] Owner decisions in `docs/PROJECT_STATUS.md` are resolved

## Cut-over and rollback

The original site keeps running from `master` on GitHub Pages until you choose to switch.

1. Merge `rebuild/nextjs` only after the preview passes. Merging moves the old files, so disable GitHub Pages first or point it at a branch that retains them.
2. Optionally make the old address send people to the new one with a small static redirect page.

**Rollback:** in Vercel, promote the previous deployment. For the old site, `master` before the merge remains in Git history at commit `dac8648`.

## Moderating reader stories

In Atlas, open `story_submissions`. Set `status` to `approved` to publish or `rejected` to decline. Approved stories appear within an hour.

## Backups

Atlas paid tiers offer continuous backup. On the free tier, schedule `mongodump` and keep the output somewhere private, since it contains personal data.
