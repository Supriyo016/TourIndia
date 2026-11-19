<p align="center">
  <a href="https://tour-india-pi.vercel.app"><img src="docs/assets/banner.svg" alt="Tour India: discover and plan travel across India" width="100%"></a>
</p>

<p align="center">
  <a href="https://tour-india-pi.vercel.app"><b>Live site</b></a> ·
  <a href="docs/architecture.md">Architecture</a> ·
  <a href="docs/api.md">API</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <a href="https://github.com/Supriyo016/TourIndia/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Supriyo016/TourIndia/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/Supriyo016/TourIndia/actions/workflows/codeql.yml"><img alt="CodeQL" src="https://github.com/Supriyo016/TourIndia/actions/workflows/codeql.yml/badge.svg"></a>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=fff">
  <a href="LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-14505c"></a>
</p>

# Tour India

An independent guide to discovering and planning travel across India: an interactive map of all 28 states and 8 Union Territories, destination guides, a festival calendar, regional food, heritage sites and a trip planner.

Tour India does not sell travel, take bookings or process payments.

**Owner:** Supriyo Sarkar, Founder & Website Owner

## What's inside

| Area | Features |
|---|---|
| Discover | Interactive India map, a 3D globe of all destination guides, 36 state and UT profiles, 52 destination guides, search with suggestions |
| Plan | Day-by-day trip planner with drag and drop, season and weather hints, packing list, print and share links, side-by-side comparison |
| Culture | Festival calendar with calendar export, regional food, heritage sites, arts encyclopedia, stories |
| Yatri | A travel assistant that answers from the site's own guides and links to them; without an AI provider it answers from the guides directly |
| Accounts | Saved places, trips, memories, notes, collections, notifications, privacy controls and account deletion |
| Admin | Moderation, support tickets, content, analytics (cookieless), SEO centre, backups, roles and MFA |
| Reliability | Animated error screens for 404, 500, 502, 503, 504, 401, 403 and offline; works without a database |

## Architecture

```mermaid
flowchart LR
  Browser -->|HTML, RSC| Vercel[Next.js 16 on Vercel]
  Vercel --> Static[Static and ISR pages
(content in src/data)]
  Vercel --> API[Route handlers /api/*
Zod validation, rate limits]
  API --> Mongo[(MongoDB Atlas
optional)]
  API --> Weather[Open-Meteo]
  Browser --> Tiles[OpenStreetMap tiles]
  GitHub[GitHub master] -->|CI: lint, types, unit, API, Playwright| Actions[GitHub Actions]
  GitHub -->|push| Vercel
```

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. The site works without a database; only the forms need one.

## Documentation

| Document | Contents |
|---|---|
| [Project status](docs/PROJECT_STATUS.md) | Where things stand, and what needs the owner |
| [Setup and deployment](docs/setup.md) | Environment, Vercel, MongoDB, rollback |
| [Architecture](docs/architecture.md) | Structure, and how to add content |
| [API](docs/api.md) | Routes and collections |
| [Security audit](docs/SECURITY_AUDIT.md) | Protections, tests and remaining risks |
| [Decisions](docs/DECISIONS.md) | What was chosen and why |
| [Audit of the original site](docs/AUDIT.md) | What was found and resolved |
| [Competitor research](docs/research/COMPETITOR_RESEARCH.md) | Research notes |

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, MongoDB, Zod, React Hook Form, Leaflet and dnd kit. Tested with Vitest and Playwright.

## Licence

Code is MIT licensed ([LICENSE](LICENSE)). Photographs, videos and map data keep their own licences.

## Credits

Photographs are from Wikimedia Commons under the licences listed at `/credits`. Map tiles are © OpenStreetMap contributors. Forecasts are from Open-Meteo.

The original 2022 static site is preserved in `legacy/`.
