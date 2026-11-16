# Tour India

An independent guide to discovering and planning travel across India: an interactive map of all 28 states and 8 Union Territories, destination guides, a festival calendar, regional food, heritage sites and a trip planner.

Tour India does not sell travel, take bookings or process payments.

**Owner:** Supriyo Sarkar, Founder & Website Owner

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

## Credits

Photographs are from Wikimedia Commons under the licences listed at `/credits`. Map tiles are © OpenStreetMap contributors. Forecasts are from Open-Meteo.

The original 2022 static site is preserved in `legacy/`.
