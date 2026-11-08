# Architecture

```
Browser
  │  static HTML, small client islands, localStorage for personal data
  ▼
Next.js 16 (App Router)
  ├─ Static pages: built from src/data at build time
  ├─ /search-index.json: static search index
  ├─ /api/weather: server fetch to Open-Meteo, cached 1 hour
  └─ /api/contact, /api/newsletter, /api/stories
        │  origin check → content type → rate limit → size limit → Zod → store
        ▼
     MongoDB (server-only module)
```

## Layout

| Path | Purpose |
|---|---|
| `src/app` | Routes |
| `src/components` | UI, grouped by feature |
| `src/features` | Business logic with no UI: planner, search, quiz, badges |
| `src/data` | Editorial content, typed by `src/types/content.ts` |
| `src/data/generated` | Machine-built map paths and photo manifest. Don't edit by hand |
| `src/config` | Brand, owner, contact, social links and navigation |
| `src/lib` | Database, security, validation, helpers |
| `scripts` | Map and photo builders, database setup |
| `tests` | `unit`, `security` (real routes against real MongoDB), `e2e` (Playwright) |
| `legacy` | The original site, unchanged and not served |

## Adding content

**A destination:** add a record to a file in `src/data/destinations/`, then run `npm run data:images`. Its page, card, search entry, sitemap entry, map pin and planner option all follow from the record.

**A milestone, email or social link:** edit `src/config/site.ts`. A social entry with `url: null` is never shown.

## Rendering

Pages are Server Components. Client code is limited to the interactive parts: header, search, hero, filters, planner, forms and map preview. Long lists are rendered on the server and passed to client filters as prepared nodes, so card code and the photo manifest aren't sent to the browser.

The map is plain SVG with real links, so it works before JavaScript loads. Region highlighting and hover are CSS driven by data attributes.

## Theme

Colour tokens are CSS variables on `:root`, overridden by `[data-theme="dark"]`. A small inline script applies the saved choice before first paint.
