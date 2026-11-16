# Design system

The source of truth is `src/app/globals.css`. This file explains it. Read it before changing UI.

## Overview

Mode: Persuade on the home page, Operate in the planner and calendar, Read in guides.
Dials: variance 6, motion 7, density 5.
The feel is warm paper and deep peacock teal, with glass only on floating layers (header, menus, dialogs, controls over photos).

## Colours

Tokens are defined on `:root`, then redefined for `[data-theme="dark"]`. That selector also works on any single element, which is how the header goes dark over the home slider. Components use tokens only, never raw hex, except over photos, where the contrast is fixed.

| Token | Use |
|---|---|
| `--bg`, `--surface`, `--surface-2` | Page, cards, sunken areas |
| `--ink`, `--ink-2`, `--muted` | Text, from strongest to weakest |
| `--brand`, `--brand-strong`, `--brand-soft` | Peacock teal: links, active states |
| `--accent` | Saffron: primary buttons, progress, pins |
| `--rani`, `--gold`, `--forest`, `--danger` | Hairline accent, wordmark, success, errors |

## Type

Fraunces for display and headings, Figtree for body text, and Rubik Wet Paint for the wordmark only. Body text is at least 16 px. Hero taglines use `clamp(2.2rem, 6vw, 4.6rem)`.

## Layout

`container-x` sets the page width. Breakpoints are `xs` 26.5rem, then Tailwind's defaults. The desktop nav appears at `xl`. The header publishes its height as `--header-h`, and the home hero slides under the header by that amount.

## Elevation and shape

`--shadow-sm`, `--shadow-md`, `--shadow-lg`, with radii `--radius-md` and `--radius-lg`. `.glass-panel` is the one glass surface for menus and dialogs. `.glass-chip` is for small buttons over photos or video.

## Motion

| Effect | Where | Notes |
|---|---|---|
| Route loading bar | `RouteProgress` | Starts on any internal link click or Back, and finishes on render |
| Scroll progress and reveals | `.scroll-progress`, `.reveal`, `.to-top` ring | Driven by CSS scroll timelines. No JavaScript |
| Hero | `.ken-burns`, `.hero-tagline`, `.hero-ring`, `.hero-motes` | Pauses on hover, with the pause button, or with reduced motion |
| 3D tilt | `data-tilt` attribute, `TiltLayer` | Mouse only, at most 6°, and off with reduced motion |
| WebGL globe | `components/three` | Lazy, draws only on screen, and replaced by a still sphere where unsupported |

`prefers-reduced-motion` disables every animation globally in `globals.css`.

## Scrollbars

The page scrollbar is themed to brand teal, with `scrollbar-gutter: stable`. Use `.scroll-thin` for inner panels and `.rail` for horizontal snap carousels, which get a saffron thumb.

## Components

- **Header:** 7 items plus "More", search, saved, theme menu (Light, Dark, System) and the mobile menu. The live IST clock row is part of the header.
- **Hero slider:** taglines per slide, and lower-right controls (counter, previous, pause with timer ring, next) with dots below them. Swipe and arrow keys also work.
- **TourVideo:** `size="third"` (centred, one third of the screen height) or `"fill"`. Auto quality with a manual menu.

## Do and don't

- Do add new motion as a CSS class in `globals.css`, with a reduced-motion fallback.
- Do mark cards with `data-tilt` rather than writing new pointer code.
- Don't add a second WebGL scene without measuring phone performance.
- Don't put glass behind body text.
